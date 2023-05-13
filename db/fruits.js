const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fruitModel = new Schema({
  "name": "Appo",
  "pack_price": { "$numberInt": "25" },
  "packed_items": { "$numberInt": "5" },
  "qty_in_store": { "$numberInt": "100" },
  "emoji": "🍏",
  "key_word": ["apples", "apple"]
  // name: { type: String, default: ''},
  // pack_price: { type: Number, },
  // packed_items: { type: Number, },
  // qty_in_store: { type: Number},
  // emoji: { type: String,  },
  // key_word: { type: Array },

});

module.exports = mongoose.model('fruits', fruitModel);