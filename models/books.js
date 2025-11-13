const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title: {type: String, trim: true}, 
    gutendexId: { type: Number, unique: true, index: true },
    author: String,
    year: String, // Année de parution du livre
    synopsis: {type: String, trim: true},
    content: {type: String, trim:true}, // Contenu du livre
    //fragmentsRequired: Number,
    fragmentsCollected: { type: Number, default: 0 },  // Nombre de fragments que possède le livre (par défaut 0)
    comments: [{type: mongoose.Schema.Types.ObjectId, ref:'comments'},],
},{ timestamps: true });

const Book = mongoose.model('books', bookSchema);

module.exports = Book;
