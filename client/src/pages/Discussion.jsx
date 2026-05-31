const Discussion = () => {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Discussion Title</h1>

      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <p>Comments will appear here...</p>
      </div>

      <input
        className="w-full p-2 rounded bg-gray-700"
        placeholder="Write a comment..."
      />
    </div>
  );
};

export default Discussion;