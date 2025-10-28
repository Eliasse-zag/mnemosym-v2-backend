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
            content: textContent, 
        }); 
        newBook.save().then(data => res.json({result: true, data}))
    } else { // Si le livre est dans la base de données : error
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

    // https://gutendex.com/books?search=dickens%20great
    const response = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(title)}`);
    const searchData = await response.json();
    //console.log("searchData", searchData) // Plusieurs oeuvres possibles, par défaut prendre le 0

    if (searchData.count === 0) {
        return res.json({result: false, error: 'No book found with this title'});
    }
     const frenchResult = searchData.results.find(r => r.languages?.includes('fr'));

    // Vérification : il doit exister une version française
    // Gutendex fournit un champ "languages" (ex: ['en','fr'])
      if (frenchResult === undefined) {
          return res.json({ result: false, error: 'No French version available for this book' });
      } 

      const bookData = frenchResult;
      //console.log("bookData", bookData) // Première oeuvre trouvée
      

    // Récupération du texte
    const textUrl = await fetch(`https://www.gutenberg.org/ebooks/${bookData.id}.html.images`); // récupération du text en HTML
    const textContent = await textUrl.text(); // conversion au format text

    // Trouver API avec les meta d'un livre
    Book.findOne({gutendexId: bookData.id}).then((data) => {
        if (data === null) { // Si le livre n'est pas dans la base de donnée : l'ajouter
          const newBook = new Book({
                gutendexId: bookData.id,
                title: bookData.title, 
                author: bookData.authors[0].name,
                synopsis: bookData.summaries[0],
                content: textContent
            })
            newBook.save().then(data => res.json({result: true, data}))
            
          } else { // Si le livre est dans la base de données : error
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


module.exports = router;
