const mongoose = require('mongoose');

const externalBookSchema = mongoose.Schema({
    title: String, 
    gutendexId: Number,
    author: String,
    year: String,
    addAt: Date,
    synopsis: String,
    fragmentsRequired: Number,
    fragmentsCollected: { type: Number, default: 0 },  // Nombre de fragments que possède le livre (par défaut 0)
    // comments: [{type: mongoose.Schema.Types.ObjectId, ref:'comments'},]
});

const externalBook = mongoose.model('externalBooks', externalBookSchema);

module.exports = externalBook;
