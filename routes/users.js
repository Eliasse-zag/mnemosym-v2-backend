var express = require('express');
var router = express.Router();
const User = require('../models/usersShemaModel.js');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');



//-----------S'Inscrire------------//

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'email', 'password'])) {
    res.json({ result: false, user: newUser, error: 'Utilisateur déjà existant' });
    return;
  }

   // Verifie si un user est deja enregistré
  User.findOne({ username: req.body.username }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
console.log(req.body);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        fragment: 20
      });

      newUser.save().then(newDoc => {
  res.json({ result: true, token: newDoc.token, fragment: newDoc.fragment });
});
    } else {
      res.json({ result: false, error: 'Utilisateur déjà existant' });
    }
  });
});




//------------Se Connecter -----------//

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Verifie si un user est deja enregistré
  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
     res.json({ result: true, token: data.token, fragment: data.fragment });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});




// ----------- Récupérer les fragments d'un utilisateur ----------- //

router.get('/fragments/:token', async (req, res) => {
  try {
    const user = await User.findOne({ token: req.params.token });
    if (user) {
      res.json({ result: true, fragments: user.fragment });
    } else {
      res.status(404).json({ result: false, error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ result: false, error: 'Server error' });
  }
});



module.exports = router;