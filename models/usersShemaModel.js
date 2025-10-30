const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: String,
  fragment: { type: Number, default: 20 },
  library: [{ type: mongoose.Schema.Types.ObjectId, ref: "books" }],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
