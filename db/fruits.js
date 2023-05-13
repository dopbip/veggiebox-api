const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fruitModel = new Schema({
  name: { type: String, default: ''},
  pack_price: { type: Number, },
  packed_items: { type: Number, },
  qty_in_store: { type: Number},
  emoji: { type: String,  },
  key_word: { type: Array },

});

module.exports = mongoose.model('fruits', fruitModel);