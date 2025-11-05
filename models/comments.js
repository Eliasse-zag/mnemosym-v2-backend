const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  content: String,
  postedAt: { type: Date, default: Date.now },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "books" },

  // Tableau contenant les "likes" du commentaire
  // Ici, chaque élément est une chaîne (le token utilisateur)
  // Cela permet d’éviter qu’un utilisateur like plusieurs fois le même commentaire
  isLike: [{ type: String, default: [] }],
  gaveFragment: { type: Boolean, default: false } // Indique si un fragment a déjà été donné pour ce commentaire
});

const Comment = mongoose.model("comments", commentSchema);

module.exports = Comment;