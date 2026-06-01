import Post from "../models/Post.js";

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = await Post.create({
      title: title?.trim(),
      content: content.trim(),
      author: req.user.id,
    });

    const populated = await Post.findById(post._id).populate("author", "name");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL POSTS
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIKE / UNLIKE
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;

    // Fix: ObjectIds must be compared as strings for reliable like toggling.
    if (post.likes.some((id) => id.toString() === userId)) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const updated = await Post.findById(post._id)
      .populate("author", "name email")
      .populate("comments.user", "name");

    // Fix: return the same populated post shape as the feed.
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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

    post.comments.push({
      user: req.user.id,
      text: text.trim(),
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name")
      .populate("comments.user", "name");

    res.json(populatedPost);
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

    await post.save();

    const updated = await Post.findById(postId)
      .populate("author", "name")
      .populate("comments.user", "name");

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

    const updated = await Post.findById(postId)
      .populate("author", "name")
      .populate("comments.user", "name");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// EDIT POST
export const editPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (
      post.author.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Fix: prevent blank edits from saving invalid post content.
    if (title !== undefined) post.title = title.trim();
    if (content !== undefined) {
      if (!content.trim()) return res.status(400).json({ message: "Content is required" });
      post.content = content.trim();
    }

    await post.save();

    const updated = await Post.findById(post._id)
      .populate("author", "name")
      .populate("comments.user", "name");

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
