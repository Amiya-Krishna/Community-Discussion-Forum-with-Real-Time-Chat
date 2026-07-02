import Post from "../models/Post.js";
import { createNotification } from "./notificationController.js";
import { extractMentionedUsers } from "../utils/mentions.js";

const populatePost = (query) =>
  query
    .populate("author", "name email")
    .populate("comments.user", "name")
    .populate("reactions.user", "name")
    .populate("comments.reactions.user", "name");

// Keep the legacy `likes` array in sync with the "like" reaction so older
// clients (and the stat cards on the dashboard) keep working.
const syncLegacyLikes = (post) => {
  post.likes = post.reactions.filter((r) => r.emoji === "like").map((r) => r.user);
};

const notifyMentions = async (users, fromUserId, message, link) => {
  await Promise.all(
    users
      .filter((u) => u._id.toString() !== fromUserId.toString())
      .map((u) => createNotification(u._id, message, { type: "mention", fromUser: fromUserId, link }))
  );
};

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { title, content, image } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" });
    }

    const mentionedUsers = await extractMentionedUsers(content);

    const post = await Post.create({
      title: title?.trim(),
      content: content.trim(),
      image: image || null,
      author: req.user.id,
      mentions: mentionedUsers.map((u) => u._id),
    });

    await notifyMentions(mentionedUsers, req.user.id, `${req.user.name} mentioned you in a post`, `/discussion/${post._id}`);

    const populated = await populatePost(Post.findById(post._id));

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL POSTS (paginated + optional search)
export const getPosts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;
    const { search, sort } = req.query;

    const filter = {};
    if (search && search.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [{ title: re }, { content: re }];
    }

    let sortStage = { createdAt: -1 };
    if (sort === "oldest") sortStage = { createdAt: 1 };

    const [posts, total] = await Promise.all([
      populatePost(Post.find(filter)).sort(sortStage).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);

    res.json({
      posts,
      page,
      hasMore: skip + posts.length < total,
      total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE POST
export const getPost = async (req, res) => {
  try {
    const post = await populatePost(Post.findById(req.params.id));
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const ALLOWED_EMOJIS = new Set(["like", "love", "laugh", "wow", "sad", "celebrate"]);

// TOGGLE REACTION (like/love/laugh/wow/sad/celebrate)
export const toggleReaction = async (req, res) => {
  try {
    const { emoji = "like" } = req.body;
    if (!ALLOWED_EMOJIS.has(emoji)) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    const existingIdx = post.reactions.findIndex((r) => r.user.toString() === userId);

    if (existingIdx !== -1 && post.reactions[existingIdx].emoji === emoji) {
      // same reaction again -> remove it (toggle off)
      post.reactions.splice(existingIdx, 1);
    } else if (existingIdx !== -1) {
      // different reaction -> replace it
      post.reactions[existingIdx].emoji = emoji;
    } else {
      post.reactions.push({ user: userId, emoji });
      if (post.author.toString() !== userId) {
        await createNotification(
          post.author,
          `${req.user.name} reacted to your post`,
          { type: "reaction", fromUser: userId, link: `/discussion/${post._id}` }
        );
      }
    }

    syncLegacyLikes(post);
    await post.save();

    const updated = await populatePost(Post.findById(post._id));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIKE / UNLIKE — legacy endpoint, mapped onto the "like" reaction
export const toggleLike = async (req, res) => {
  req.body.emoji = "like";
  return toggleReaction(req, res);
};

// ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const mentionedUsers = await extractMentionedUsers(text);

    post.comments.push({
      user: req.user.id,
      text: text.trim(),
      mentions: mentionedUsers.map((u) => u._id),
    });

    await post.save();

    if (post.author.toString() !== req.user.id) {
      await createNotification(
        post.author,
        `${req.user.name} commented on your post`,
        { type: "comment", fromUser: req.user.id, link: `/discussion/${post._id}` }
      );
    }
    await notifyMentions(mentionedUsers, req.user.id, `${req.user.name} mentioned you in a comment`, `/discussion/${post._id}`);

    const populatedPost = await populatePost(Post.findById(post._id));

    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TOGGLE COMMENT REACTION
export const toggleCommentReaction = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { emoji = "like" } = req.body;
    if (!ALLOWED_EMOJIS.has(emoji)) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user.id;
    const existingIdx = comment.reactions.findIndex((r) => r.user.toString() === userId);

    if (existingIdx !== -1 && comment.reactions[existingIdx].emoji === emoji) {
      comment.reactions.splice(existingIdx, 1);
    } else if (existingIdx !== -1) {
      comment.reactions[existingIdx].emoji = emoji;
    } else {
      comment.reactions.push({ user: userId, emoji });
    }

    await post.save();

    const updated = await populatePost(Post.findById(postId));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// EDIT COMMENT
export const editComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.text = text.trim();
    comment.mentions = (await extractMentionedUsers(text)).map((u) => u._id);

    await post.save();

    const updated = await populatePost(Post.findById(postId));

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (
      comment.user.toString() !== req.user.id &&
      post.author.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.comments = post.comments.filter(
      (c) => c._id.toString() !== commentId
    );

    await post.save();

    const updated = await populatePost(Post.findById(postId));

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// EDIT POST
export const editPost = async (req, res) => {
  try {
    const { title, content, image } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.author.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (title !== undefined) post.title = title.trim();
    if (content !== undefined) {
      if (!content.trim()) return res.status(400).json({ message: "Content is required" });
      post.content = content.trim();
      post.mentions = (await extractMentionedUsers(content)).map((u) => u._id);
    }
    if (image !== undefined) post.image = image || null;

    await post.save();

    const updated = await populatePost(Post.findById(post._id));

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE POST
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.author.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
