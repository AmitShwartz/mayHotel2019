const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var HotelSchema = new Schema({
    name:  {type:String, required: true},
    logo:  String,
  },{collection: 'hotels'});

module.exports = mongoose.model('Hotel',HotelSchema);
