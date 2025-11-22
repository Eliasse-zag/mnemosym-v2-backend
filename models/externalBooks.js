const mongoose = require('mongoose');

const externalBookSchema = mongoose.Schema({
    title: {type: String, trim: true}, 
    gutendexId: { type: Number, unique: true, index: true },
    author: String,
    year: String,
    synopsis: {type: String, trim: true},
    fragmentsRequired: Number,
    fragmentsCollected: { type: Number, default: 0 }, 
}, { timestamps: true });

const externalBook = mongoose.model('externalBooks', externalBookSchema);

module.exports = externalBook;
