const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title: String, 
    gutendexId: Number,
    author: String,
    year: String,
    addAt: Date,
    synopsis: String,
    content: String,
    fragmentsCollected: { type: Number, default: 0 },
    comments: [{type: mongoose.Schema.Types.ObjectId, ref:'comments'},]
});

const Book = mongoose.model('books', bookSchema);

module.exports = Book;
