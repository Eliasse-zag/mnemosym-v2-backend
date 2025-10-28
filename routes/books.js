var express = require('express');
var router = express.Router();

const Book = require('../models/books');
const fetch = require('node-fetch');

// Ajouter un livre dans la collection Book, lorsque celui ci intègre la bibliothèque.
router.post('/newBook/:gutendexId', async(req, res) => {

    const gutendexId = req.params.gutendexId
    const response = await fetch(`https://gutendex.com/books/${gutendexId}`);
    const bookData = await response.json();
    //console.log("bookData", bookData) 
    //console.log("author", bookData.authors[0].name) // Voltaire 
    //console.log("Content", bookData.formats['text/html']) // url du text à exploiter

    // Récupération du texte 
    const textUrl = await fetch(`https://www.gutenberg.org/ebooks/${gutendexId}.html.images`); // récupération du text en HTML
    const textContent = await textUrl.text(); // conversion au format text 

    // Trouver API avec les meta d'un livre 
  Book.findOne({gutendexId: gutendexId}).then((data) => {
    if (data === null ) { // Si le livre n'est pas dans la base de donnée : l'ajouter
        const newBook = new Book({
            title: bookData.title, 
            author: bookData.authors[0].name,
            synopsis: bookData.summaries[0],
            content: textContent, // a récupérer d'un API
        }); 
        newBook.save().then(data => res.json({result: true, data}))
    } else { // Si le livre est dans la base de données : error
        res.json({result: false, error: 'Book already in database'})
    }
  });
});

module.exports = router;
