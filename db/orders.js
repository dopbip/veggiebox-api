const dayjs = require('dayjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ordersModel = new Schema({
  phoneNumber: { type: String, default: ''},
  status: { type: String, default: 'Pending' },
  location: { type: Object, default:{}},
  itemOrdered: {type: Array, default: []},
  orderTime: { type: String, require: true, default: dayjs().format('DD-MM-YYYY h:mm:ss A') },
  totalAmount: { type: String,  default: '' },
  
});

module.exports = mongoose.model('orders', ordersModel);