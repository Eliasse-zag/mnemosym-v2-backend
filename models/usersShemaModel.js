const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: String,
  fragment: { type: Number, default: 20 },  // Nombre de fragments que possède l'utilisateur (par défaut 20)
  personalLibrary: [{ type: mongoose.Schema.Types.ObjectId, ref: "books" }], // Bibliothèque personnelle de l'utilisateur (références vers des livres)
});

const User = mongoose.model("users", userSchema);

module.exports = User;
