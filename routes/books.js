var express = require('express');
var router = express.Router();

require('../models/connection');
const Book = require('../models/books');


let idBook = req.body.idBook
// Ajouter un livre dans la collection Book, lorsque celui ci intègre la bibliothèque.
router.post('/newBook', (req, res) => {
    // Récupération du contenu du livre de l'API Gutenberg 

fetch(`https://www.gutenberg.org/cache/epub/${idBook}/pg${idBook}-images.html`)
.then(response => response.json())
.then(data => {
    console.log(data)
})




  // Si le livre existe, ne pas l'ajouter
  Book.findOne({title: req.body.title}).then((data) => {
    if (data === null ) {
        const newBook = new Book({
            title: req.body.title, 
            author: req.body.author,
            year: req.body.year,
            synopsis: String,
            content: String, // a récupérer from un fetch 
        }); 
        newBook.save().then(data => res.json({result: true, data}))
    } else {
        res.json({result: false, error: 'Book already in database'})
    }
    
  });
  // Sinon ajouter le livre 
});


module.exports = router;
