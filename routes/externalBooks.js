var express = require('express');
var router = express.Router();
const externalBook = require('../models/externalBooks');
const User = require('../models/usersShemaModel');
const Book = require('../models/books');
const fetch = require('node-fetch');

// Ajouter un livre externe via son titre (recherche sur Gutendex)
router.post('/addBookByTitle', async(req, res) => {

    try {
        const {title} = req.body; 
        if (!title) return res.status(400).json({result: false, error: 'Title is required'}); 

    //Exemple d'URL à exploiter : https://gutendex.com/books?search=dickens%20great
    const response = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(title)}`);
    if (response.status !== 200) return res.status(502).json({result: false, error: 'Error fetching data from Gutendex'});
    
    const searchData = await response.json(); // Résultat de la recherche
    if (!searchData?.results?.length) return res.json({result: false, error: 'No book found with this title'});
    
    //console.log("searchData", searchData) // Plusieurs oeuvres peuvent être trouvées

    // Vérification : il doit exister une version française
    // Gutendex fournit un champ "languages" (ex: ['en','fr'])
    const frenchResult = searchData.results.find(r => Array.isArray(r.languages) && r.languages.includes('fr'));
    if(!frenchResult) return res.json({ result: false, error: 'No French version available for this book' });
    
    const bookData = frenchResult;
    const existingBook = await externalBook.findOne({ gutendexId: bookData.id });
    if (existingBook) return res.json({ result: false, error: 'Book already in database' });
    
    const bookCount = await Book.countDocuments(); // nombre total de livres
    const fragmentsRequired = 1 + bookCount;

    const newBook = new externalBook({
        gutendexId: bookData.id,
        title: bookData.title, 
        author: bookData.authors?.[0].name || 'Unknown',
        synopsis: bookData.summaries?.[0] || 'No synopsis available',
        fragmentsRequired,
        fragmentsCollected: 0,
    })

    const savedBook = await newBook.save();
    return res.json({ result: true, data: savedBook });
    
      
    } catch (error) {
        return res.status(500).json({result: false, error: 'An error occurred while processing the request'});
    }
})

// Récupérer tous les livres de la collection Book  
router.get('/allExternalBooks', (req, res) => {
    externalBook.find().then((books) => {
        res.json({result: true, books})
    });
});

// Donner un fragment à un livre d'externalBook
router.post('/giveFragment', async (req, res) => {
  const { token, bookId } = req.body;
  if (!token || !bookId) {   // Vérifie que les deux champs sont bien présents
    return res.status(400).json({ result: false, error: 'Champs manquants' });
  }
  try {
    const user = await User.findOne({ token });   // Recherche de l'utilisateur via son token
    const book = await externalBook.findById(bookId);
    if (!user || !book) {  // Vérifie que l'utilisateur et le livre existent
      return res.status(404).json({ result: false, error: 'Utilisateur ou livre introuvable' });
    }
    if (user.fragment < 1) {  // Vérifie que l'utilisateur a au moins 1 fragment à donner
      return res.status(403).json({ result: false, error: 'Fragments insuffisants' });
    }
    user.fragment -= 1;  // Décrémente les fragments de l'utilisateur
    book.fragmentsCollected += 1;  // Incrémente les fragments collectés pour le livre
    await user.save();      // Sauvegarde les modifications en base de données
    await book.save();
    res.json({     // Réponse JSON avec les nouvelles valeurs mises à jour
      result: true,
      message: 'Fragment donné avec succès',
      userFragments: user.fragment,
      bookFragments: book.fragmentsCollected
    });
  } catch (err) {
    res.status(500).json({ result: false, error: 'Erreur serveur' });
  }
});


module.exports = router;
