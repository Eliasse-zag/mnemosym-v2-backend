const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title: String, 
    gutendexId: Number,
    author: String,
    year: String,
    addAt: Date,
    synopsis: String,
    content: String,
    fragmentsRequired: Number,
    fragmentsCollected: { type: Number, default: 0 },  // Nombre de fragments que possède le livre (par défaut 0)
    comments: [{type: mongoose.Schema.Types.ObjectId, ref:'comments'},],
},{ timestamps: true });

const Book = mongoose.model('books', bookSchema);

module.exports = Book;
