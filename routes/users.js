var express = require("express");
var router = express.Router();
const User = require("../models/users.js");
const Book = require("../models/books.js");
const Comment = require("../models/comments");
const uid2 = require("uid2"); // Générateur de token unique
const bcrypt = require("bcrypt"); // Librairie pour hasher les mots de passe
const { checkBody } = require("../modules/checkBody");

//-----------Inscription------------//

router.post("/signup", (req, res) => {
  // vérfication du remplissage des champs obligatoires
  if (!checkBody(req.body, ["username", "email", "password"])) {
    res.json({result: false, error: "Missing or empty fields"});
    return;
  }
  // Verifie si un user est deja enregistré
  User.findOne({ username: req.body.username }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);  // Hashage du password
      const newUser = new User({   
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),
      });

      newUser.save().then((newDoc) => { 
        res.json({
          result: true,
          token: newDoc.token, // Renvoyer le token à l'inscription pour la navigation utilisateur
          fragment: newDoc.fragment,
        });
      });
    } else {
      res.json({ result: false, error: "Utilisateur déjà existant" }); 
    }
  });
});

//------------Connexion-----------//

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {   // Vérifie que les champs sont bien remplis
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Verifie si un user est deja enregistré
  User.findOne({ username: req.body.username }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {    // Vérifie le mot de passe
      res.json({ result: true, token: data.token, fragment: data.fragment });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

// ----------- Récupérer les fragments d'un utilisateur ----------- //

router.get("/fragments/:token", async (req, res) => {
  try {
    const user = await User.findOne({ token: req.params.token });
    if (user) {
      res.json({ result: true, fragments: user.fragment });
    } else {
      res.status(404).json({ result: false, error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ result: false, error: "Server error" });
  }
});

/* --------------------LIVRES LUS -------------------- */

//Ajouter ou retirer un livre des "livres lus"
router.put("/toggleReadBook/:token/:bookId", async (req, res) => {
  try {
    // On cherche l'utilisateur correspondant au token fourni
    const user = await User.findOne({ token: req.params.token });
    if (!user) return res.json({ result: false, error: "Utilisateur non trouvé" });

    // On cherche le livre via son ID (bookId)
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.json({ result: false, error: "Livre introuvable" });

    // Vérifie si le livre est déjà présent dans la liste des livres lus
    const index = user.readBooks.findIndex((id) => id.toString() === req.params.bookId);

    let added; // Variable booléenne pour savoir si le livre a été ajouté ou retiré

    if (index === -1) {
      // S’il n’est pas encore dans la liste → on l’ajoute
      user.readBooks.push(book._id);
      added = true;

    } else {
      // S’il y est déjà → on le retire
      user.readBooks.splice(index, 1);
      added = false;
    }

    // On sauvegarde les changements dans MongoDB
    await user.save();

    // On renvoie une réponse claire au front-end
    res.json({ result: true, added });
  } catch (error) {
    // Gestion d’erreur serveur
    console.error("Erreur toggleReadBook:", error);
    res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

//Récupérer la liste des livres lus
router.get("/:token/readBooks", async (req, res) => {
  try {
    // On récupère l’utilisateur avec sa liste de livres lus
    // Le "populate" permet de remplacer les IDs par les objets "Book" complets
    const user = await User.findOne({ token: req.params.token }).populate("readBooks");
    if (!user) return res.json({ result: false, error: "Utilisateur non trouvé" });

    // On renvoie la liste des livres
    res.json({ result: true, readBooks: user.readBooks });
  } catch (error) {
    console.error("Erreur get readBooks:", error);
    res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});


/* --------------------LIVRES À LIRE -------------------- */

//Ajouter ou retirer un livre des "livres à lire"
router.put("/toggleToRead/:token/:bookId", async (req, res) => {
  try {
    // Récupération de l'utilisateur via son token
    const user = await User.findOne({ token: req.params.token });
    if (!user) return res.json({ result: false, error: "Utilisateur non trouvé" });

    // Récupération du livre concerné
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.json({ result: false, error: "Livre introuvable" });

    // Vérifie si le livre est déjà dans la liste "à lire"
    const index = user.toRead.findIndex((id) => id.toString() === req.params.bookId);
    let added;

    if (index === -1) {
      // Le livre n’est pas encore dans la liste → on l’ajoute
      user.toRead.push(book._id);
      added = true;
    } else {
      // Le livre y est déjà → on le retire
      user.toRead.splice(index, 1);
      added = false;
    }

    // On sauvegarde les modifications
    await user.save();

    // On renvoie la confirmation au front
    res.json({ result: true, added });
  } catch (error) {
    console.error("Erreur toggleToRead:", error);
    res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});


// Récupérer la liste des livres à lire
router.get("/:token/toRead", async (req, res) => {
  try {
    // Même principe que pour les livres lus, mais sur la liste "toRead"
    const user = await User.findOne({ token: req.params.token }).populate("toRead");
    if (!user) return res.json({ result: false, error: "Utilisateur non trouvé" });

    res.json({ result: true, toRead: user.toRead });
  } catch (error) {
    console.error("Erreur get toRead:", error);
    res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});




/* --------------------  STATISTIQUES UTILISATEUR -------------------- */
// GET → /users/:token/stats
router.get("/:token/stats", async (req, res) => {
  try {
    const user = await User.findOne({ token: req.params.token });
    if (!user) return res.json({ result: false, error: "Utilisateur non trouvé" });

    // Compter le nombre de commentaires écrits par cet utilisateur
    const commentCount = await Comment.countDocuments({ author: user._id });

    res.json({
      result: true,
      stats: {
        commentCount,
        fragmentsCurrent: user.fragment,
        fragmentsTotal: user.totalFragments,
      },
    });
  } catch (error) {
    console.error("Erreur get stats:", error);
    res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});



/* -------------------- PROFIL UTILISATEUR -------------------- */

router.get("/:token", async (req, res) => {
  try {
    // On cherche l’utilisateur par son token pour afficher ses infos de profil
    const user = await User.findOne({ token: req.params.token });
    if (!user)
      return res.json({ result: false, error: "Utilisateur non trouvé" });

    // On renvoie uniquement les infos non sensibles
    res.json({
      result: true,
      user: { username: user.username, email: user.email, token: user.token },
    });
  } catch (error) {
    console.error("Erreur get profil:", error);
    res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

router.get("/:token/status/:bookId", async (req, res) => {
  try {
    const user = await User.findOne({ token: req.params.token })
      .populate("readBooks")
      .populate("toRead");
    if (!user) return res.json({ result: false, error: "Utilisateur non trouvé" });

    const isRead  = user.readBooks.some(b => b._id.toString() === req.params.bookId);
    const isToRead = user.toRead.some(b => b._id.toString() === req.params.bookId);

    res.json({ result: true, isRead, isToRead });
  } catch (e) {
    console.error("status error:", e);
    res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});


module.exports = router;