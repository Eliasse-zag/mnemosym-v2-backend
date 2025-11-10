const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  token: String,
  fragment: { type: Number, default: 2 },  // Nombre de fragments que possède l'utilisateur (2 attribués à l'inscription)
  totalFragments: { type: Number, default: 2 }, // Nbr de fragments cumulés
  //Livres terminés
  readBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "books" }], // Livres terminés
  //Livres à lire
  toRead: [{ type: mongoose.Schema.Types.ObjectId, ref: "books" }], // Livre à lire 
  rewardedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "books" }], //Liste des livres pour lesquels un fragment a déjà été gagné
});
const User = mongoose.model("users", userSchema);

module.exports = User;