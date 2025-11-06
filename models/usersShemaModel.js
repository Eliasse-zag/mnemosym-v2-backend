const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: String,
  fragment: { type: Number, default: 10 },  // Nombre de fragments que possède l'utilisateur (par défaut 10)
  totalFragments: { type: Number, default: 0 },
  //Livres terminés
  readBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "books" }],
  //Livres à lire
  toRead: [{ type: mongoose.Schema.Types.ObjectId, ref: "books" }],
 //Liste des livres pour lesquels un fragment a déjà été gagné
  rewardedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "books" }],
});
const User = mongoose.model("users", userSchema);

module.exports = User;