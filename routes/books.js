var express = require('express');
var router = express.Router();

const Book = require('../models/books');
const fetch = require('node-fetch');

// Ajouter un livre dans la collection Book, lorsque celui ci intègre la bibliothèque.
router.post('/newBook', (req, res) => {

    // Récupération du contenu du livre de l'API Gutenberg 
   /*let idBook = req.params
    async function getContent() {
    const rep = await fetch(`https://www.gutenberg.org/cache/epub/${idBook}/pg${idBook}-images.html`)
    let reponse = await rep.json();
    console.log(response)
    return reponse;
    }*/

  Book.findOne({title: req.body.title}).then((data) => {
    if (data === null ) { // Si le livre n'est pas dans la base de donnée : l'ajouter
        const newBook = new Book({
            title: req.body.title, 
            author: req.body.author,
            year: req.body.year,
            synopsis: req.body.synopsis,
            content: req.body.content, // a récupérer d'un API
        }); 
        newBook.save().then(data => res.json({result: true, data}))
    } else { // Si le livre est dans la base de données : error
        res.json({result: false, error: 'Book already in database'})
    }
  });
});

module.exports = router;
