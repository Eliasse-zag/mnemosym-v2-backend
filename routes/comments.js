const express = require("express");
const router = express.Router();

const Comment = require("../models/comments");
const Book = require("../models/books");
const User = require("../models/usersShemaModel");

//récupérer tous les commentaires d’un livre
router.get("/:bookId", async (req, res) => {
  try {
    const comments = await Comment.find({ book: req.params.bookId })
      .populate("author", "username")
      .sort({ postedAt: -1 });

    res.json({ result: true, comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "Erreur serveur." });
  }
});

//publier un nouveau commentaire
router.post("/:bookId", async (req, res) => {
  try {
    const { token, content } = req.body;

    if (!token || !content) {
      return res.json({ result: false, error: "Champs manquants." });
    }

    const user = await User.findOne({ token });
    if (!user)
      return res.json({ result: false, error: "Utilisateur non trouvé." });

    const book = await Book.findById(req.params.bookId);
    if (!book) return res.json({ result: false, error: "Livre introuvable." });

    const newComment = new Comment({
      author: user._id,
      content,
      book: book._id,
    });

    const savedComment = await newComment.save();
    const populatedComment = await savedComment.populate("author", "username");

    book.comments.push(savedComment._id);
    await book.save();

    res.json({ result: true, comment: populatedComment });
  } catch (error) {
    console.error("Erreur ajout commentaire:", error);
    res.status(500).json({ result: false, error: "Erreur serveur." });
  }
});

module.exports = router;
