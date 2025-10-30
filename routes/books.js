var express = require('express');
var router = express.Router();
var sanitizeHTML = require('sanitize-html');
const Book = require('../models/books');
const fetch = require('node-fetch');

// Ajouter un livre dans la collection Book via son ID Gutendex 
// Fonctionnalité réservée à l'admin
router.post('/newBook/:gutendexId', async(req, res) => {

    const gutendexId = req.params.gutendexId
    const response = await fetch(`https://gutendex.com/books/${gutendexId}`);
    const bookData = await response.json();
    //console.log("bookData", bookData) // Meta d'un livre 
    //console.log("Content", bookData.formats['text/html']) // URL du texte à exploiter

    // Récupération du texte à partir de l'URL
    const textUrl = await fetch(`https://www.gutenberg.org/ebooks/${gutendexId}.html.images`); // récupération du texte en HTML
    const textContent = await textUrl.text(); // conversion au format text 

    // Rechercher si le livre est déjà dans la base de données
    Book.findOne({gutendexId: gutendexId}).then((data) => {
    if (data === null ) { // Si le livre n'est pas dans la base de données => l'ajouter
        const newBook = new Book({
            title: bookData.title, 
            author: bookData.authors[0].name,
            synopsis: bookData.summaries[0],
            content: cleanHtml, 
        }); 
        newBook.save().then(data => res.json({result: true, data}))
    } else { // Si le livre est dans la base de données => error
        res.json({result: false, error: 'Book already in database'})
    }
  });
});

// Ajouter un livre dans la collection Book, à partir de son titre récupéré sur le front (req.body.title)
router.post('/addBookByTitle', async(req, res) => {
    
    const title = req.body.title;
    if (!title) {
        return res.json({result: false, error: 'Title is required'});
    };

    //Exemple d'URL à exploiter : https://gutendex.com/books?search=dickens%20great
    const response = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(title)}`);
    const searchData = await response.json();
    //console.log("searchData", searchData) // Plusieurs oeuvres peuvent être trouvées

    if (searchData.count === 0) {
        return res.json({result: false, error: 'No book found with this title'});
    }

    // Vérification : il doit exister une version française
    // Gutendex fournit un champ "languages" (ex: ['en','fr'])
    const frenchResult = searchData.results.find(r => r.languages?.includes('fr'));
    if (frenchResult === undefined) {
        return res.json({ result: false, error: 'No French version available for this book' });
    } 

    const bookData = frenchResult;
    //console.log("bookData", bookData) 
      
    // Récupération du texte
    const textUrl = await fetch(`https://www.gutenberg.org/ebooks/${bookData.id}.html.images`); // récupération du texte en HTML
    const textContent = await textUrl.text(); // conversion au format texte

    // Rechercher si le livre est déjà dans la base de données
    Book.findOne({gutendexId: bookData.id}).then((data) => {
        if (data === null) { // Si le livre n'est pas dans la base de données => l'ajouter
          const newBook = new Book({
                gutendexId: bookData.id,
                title: bookData.title, 
                author: bookData.authors[0].name,
                synopsis: bookData.summaries[0],
                content: cleanHtml
            })
            newBook.save().then(data => res.json({result: true, data}))
        } else { // Si le livre est dans la base de données => error
        res.json({result: false, error: 'Book already in database'})
    }
})
})

// Récupérer tous les livres de la collection Book  
router.get('/allBooks', (req, res) => {
    Book.find().then((books) => {
        res.json({result: true, books})
    });
});

// Récupérer un livre spécifique par son ID MongoDB
router.get('/:id', (req, res) => {
    const bookId = req.params.id;
    Book.findById(bookId).then((book) => {
        if (book) {
            res.json({result: true, book});
        } else {
            res.json({result: false, error: 'Book not found'});
        }
    });   
})  

module.exports = router;
