const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fruitModel = new Schema({
  name: { type: String, default: 'Appo'},
  pack_price: { type: Number, default: 25},
  packed_items: { type: Number, default: 5},
  qty_in_store: { type: Number, default: 80},
  emoji: { type: String,  default: '🍏'},
  key_word: { type: Array ,default: ["apples", "apple"]},

});

module.exports = mongoose.model('fruits', fruitModel);