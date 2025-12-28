const mongoose = require('mongoose');
const Schema = mongoose.Schema;


mongoose.connect('mongodb://127.0.0.1:27017/mydatabase')
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;