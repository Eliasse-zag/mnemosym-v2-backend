const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  content: String,
  postedAt: { type: Date, default: Date.now },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "books" },
  isLike: [{ type: String, default: [] }],
});

const Comment = mongoose.model("comments", commentSchema);
module.exports = Comment;
