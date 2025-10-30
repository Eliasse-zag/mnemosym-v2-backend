var express = require("express");
var router = express.Router();
const User = require("../models/usersShemaModel.js");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const Book = require("../models/books.js");

//-----------S'Inscrire------------//

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["username", "email", "password"])) {
    res.json({
      result: false,
      user: newUser,
      error: "Utilisateur déjà existant",
    });
    return;
  }

  // Verifie si un user est deja enregistré
  User.findOne({ username: req.body.username }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
      console.log(req.body);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        fragment: 1,
      });

      newUser.save().then((newDoc) => {
        res.json({
          result: true,
          token: newDoc.token,
          fragment: newDoc.fragment,
        });
      });
    } else {
      res.json({ result: false, error: "Utilisateur déjà existant" });
    }
  });
});

//------------Se Connecter -----------//

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Verifie si un user est deja enregistré
  User.findOne({ username: req.body.username }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
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

// ----------- AJOUT / SUPPRESSION D'UN LIVRE (Bookmark) ----------- //
router.put("/toggleLibrary/:token/:bookId", async (req, res) => {
  try {
    const user = await User.findOne({ token: req.params.token });
    if (!user) {
      return res.json({ result: false, error: "Utilisateur non trouvé" });
    }

    const bookId = req.params.bookId;
    const book = await Book.findById(bookId);
    if (!book) {
      return res.json({ result: false, error: "Livre introuvable" });
    }

    const index = user.library.findIndex((id) => id.toString() === bookId);
    let added;

    if (index === -1) {
      user.library.push(bookId);
      added = true;
    } else {
      user.library.splice(index, 1);
      added = false;
    }

    await user.save();
    res.json({ result: true, added });
  } catch (error) {
    console.error("Erreur toggleLibrary:", error);
    res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

// ----------- RÉCUPÉRER LA BIBLIOTHÈQUE DE L'UTILISATEUR ----------- //
router.get("/:token/library", async (req, res) => {
  try {
    const user = await User.findOne({ token: req.params.token }).populate(
      "library"
    );
    if (!user) {
      return res.json({ result: false, error: "Utilisateur non trouvé" });
    }
    res.json({ result: true, library: user.library });
  } catch (error) {
    console.error("Erreur get library:", error);
    res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

// ----------- RÉCUPÉRER LE PROFIL UTILISATEUR ----------- //
router.get("/:token", async (req, res) => {
  try {
    const user = await User.findOne({ token: req.params.token });
    if (!user) {
      return res.json({ result: false, error: "Utilisateur non trouvé" });
    }
    res.json({
      result: true,
      user: { username: user.username, email: user.email, token: user.token },
    });
  } catch (error) {
    console.error("Erreur get profil:", error);
    res.status(500).json({ result: false, error: "Erreur serveur" });
  }
});

module.exports = router;
