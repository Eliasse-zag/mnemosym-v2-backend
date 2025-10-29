const express = require("express");
const router = express.Router();

const Comment = require("../models/comments");
const Book = require("../models/books");
const User = require("../models/usersShemaModel");

//récupérer tous les commentaires d’un livre
router.get("/:bookId", async (req, res) => {
  try {
    const comments = await Comment.find({ book: req.params.bookId })
      .populate("author", "username") // récupère le username de l’auteur
      .sort({ postedAt: -1 }); // du plus récent au plus ancien

    res.json({ result: true, comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, error: "Erreur serveur." });
  }
});

//publier un nouveau commentaire
router.post("/:bookId", (req, res) => {
  const { token, content } = req.body;
  if (!token || !content)
    return res.json({ result: false, error: "Missing fields" });
  // On trouve l'utilisateur
  User.findOne({ token }).then((user) => {
    if (!user) return res.json({ result: false, error: "User not found" });
    //On trouve le livre
    Book.findById(req.params.bookId).then((book) => {
      if (!book) return res.json({ result: false, error: "Book not found" });

      new Comment({
        author: user._id,
        content,
        book: book._id,
        postedAt: new Date(),
      })
        .save()
        .then((comment) => {
          book.comments.push(comment._id);
          book.save();
          res.json({ result: true, comment });
        });
    });
  });
});

// Liker un commentaire
router.put("/likeComment", (req, res) => {
  const { token, commentId } = req.body;
  if (!token || !commentId) {
    return res.json({ result: false, error: "Missing token or comment ID" });
  }
  // On trouve l'utilisateur
  User.findOne({ token }).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "User not found" });
    }
    // On trouve le commentaire
    Comment.findById(commentId).then((comment) => {
      if (!comment) {
        return res.json({ result: false, error: "Comment not found" });
      }
      // Vérifie si l'utilisateur a déjà liké
      const hasLiked = comment.isLike.includes(user._id);

      if (hasLiked) {
        comment.isLike = comment.isLike.filter((id) => !id.equals(user._id));
      } else {
        comment.isLike.push(user._id);
      }

      comment.save().then((updated) => {
        res.json({
          result: true,
          liked: !hasLiked,
          totalLikes: updated.isLike.length,
        });
      });
    });
  });
});

module.exports = router;
