const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fruitModel = new Schema({
  name: { type: String, default: ''},
  pack_price: { type: String, default: '' },
  packed_items: { type: String, default: '' },
  qty_in_store: { type: String, default: '' },
  emoji: { type: String, default: '' },
  key_word: { type: Array, default: [] },

});

module.exports = mongoose.model('fruits', fruitModel);