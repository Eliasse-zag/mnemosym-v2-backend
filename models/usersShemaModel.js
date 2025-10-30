const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  token: String,
  fragment: { type: Number,
    default: 1 }

});

const User = mongoose.model('users', userSchema);

module.exports = User;