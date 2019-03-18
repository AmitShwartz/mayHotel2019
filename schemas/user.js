const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserSchema = new Schema({
    _id:        {type:String, required: true},
    firstname:  {type:String, required: true},
    lastname:   {type:String, required: true},
    phone:      {type:String, required: true},
    address:    {type:String, required: true},
    QRcode:     {type:'String'}
  },{collection: 'users'});

module.exports = mongoose.model('User',UserSchema);
