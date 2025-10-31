var express = require('express');
var router = express.Router();
const externalBook = require('../models/externalBooks');
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
    
    const newBook = new externalBook({
        gutendexId: bookData.id,
        title: bookData.title, 
        author: bookData.authors?.[0].name || 'Unknown',
        synopsis: bookData.summaries?.[0] || 'No synopsis available',
    })

    const savedBook = await  await newBook.save();
    return res.json({ result: true, data: savedBook });
    
      
    } catch (error) {
        return res.status(500).json({result: false, error: 'An error occurred while processing the request'});
    }
})



module.exports = router;
