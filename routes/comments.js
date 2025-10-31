const express = require("express");
const router = express.Router(); 


const Comment = require("../models/comments"); // Modèle des commentaires
const Book = require("../models/books");       // Modèle des livres
const User = require("../models/usersShemaModel"); // Modèle des utilisateurs


// RÉCUPÉRER TOUS LES COMMENTAIRES D’UN LIVRE
// Méthode GET → /comments/:bookId
router.get("/:bookId", async (req, res) => {
  try {
    // On récupère tous les commentaires liés au livre dont l’ID est passé en paramètre
    const comments = await Comment.find({ book: req.params.bookId })
      .populate("author", "username")// remplace l’ID de l’auteur par son nom d’utilisateur
      .sort({ postedAt: -1 }); //trie les commentaires du plus récent au plus ancien

    // Si tout va bien, on renvoie la liste des commentaires
    res.json({ result: true, comments });
  } catch (error) {
    // En cas d’erreur serveur
    console.error(error);
    res.status(500).json({ result: false, error: "Erreur serveur." });
  }
});



// PUBLIER UN NOUVEAU COMMENTAIRE
// Méthode POST → /comments/:bookId
router.post("/:bookId", async (req, res) => {
  try {
    // On récupère le token utilisateur et le contenu du commentaire dans le corps de la requête
    const { token, content } = req.body;

    // Vérifie que les champs nécessaires sont bien fournis
    if (!token || !content) {
      return res.json({ result: false, error: "Champs manquants." });
    }

    // Recherche de l’utilisateur à partir du token
    const user = await User.findOne({ token });
    if (!user)
      return res.json({ result: false, error: "Utilisateur non trouvé." });

    // Recherche du livre associé au commentaire
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.json({ result: false, error: "Livre introuvable." });

    // Création d’un nouveau document "Comment" dans la base
    const newComment = new Comment({
      author: user._id,
      content,          
      book: book._id,  
    });

    // Enregistrement du commentaire en base
    const savedComment = await newComment.save();

    // On remplit les infos de l’auteur (pour afficher son username)
    const populatedComment = await savedComment.populate("author", "username");

    // Ajout du commentaire dans la liste des commentaires du livre
    book.comments.push(savedComment._id);
    await book.save();

    // Réponse au frontend avec le nouveau commentaire
    res.json({ result: true, comment: populatedComment });
  } catch (error) {
    console.error("Erreur ajout commentaire:", error);
    res.status(500).json({ result: false, error: "Erreur serveur." });
  }
});



//LIKER / DISLIKER UN COMMENTAIRE
// Méthode PUT → /comments/likeComment
router.put("/likeComment", async (req, res) => {
  try {
    // On récupère le token utilisateur et l’ID du commentaire à liker
    const { token, commentId } = req.body;

    // Vérifie la présence des deux champs obligatoires
    if (!token || !commentId)
      return res.json({ result: false, error: "Champs manquants." });

    // Recherche du commentaire concerné
    const comment = await Comment.findById(commentId);
    if (!comment)
      return res.json({ result: false, error: "Commentaire introuvable." });

    // Vérifie si le token est déjà présent dans le tableau "isLike"
    const hasLiked = comment.isLike.includes(token);

    if (hasLiked) {
      // Si déjà liké → on retire le like (dislike)
      comment.isLike = comment.isLike.filter((t) => t !== token);
    } else {
      // Sinon → on ajoute le token au tableau (like)
      comment.isLike.push(token);
    }
    // Sauvegarde du changement en base
    await comment.save();
    // Réponse envoyée au frontend avec le nombre de likes à jour
    res.json({
      result: true,
      liked: !hasLiked, // indique si le commentaire est désormais liké ou non
      likeCount: comment.isLike.length, // nombre total de likes
    });
  } catch (error) {
    console.error("Erreur like:", error);
    res.status(500).json({ result: false, error: "Erreur serveur." });
  }
});


module.exports = router;