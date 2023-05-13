const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fruitModel = new Schema({
  name: { type: String, default: ''},
  pack_price: { type: String, },
  packed_items: { type: String, },
  qty_in_store: { type: String},
  emoji: { type: String,  },
  key_word: { type: String },

});

module.exports = mongoose.model('fruits', fruitModel);