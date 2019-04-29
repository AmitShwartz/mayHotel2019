const mongoose = require('mongoose');
const QRCode  = require('qrcode');
const Schema = mongoose.Schema;
const objectID = Schema.Types.ObjectId;

var UserSchema = new Schema({
    _id:        {type:String, required: true},
    firstname:  {type:String, required: true},
    lastname:   {type:String, required: true},
    phone:      {type:String, required: true},
    address:    {type:String, required: true},
    room:       {type: objectID , ref : 'Room', default: null},
    vouchers: [{voucher_id:{type: objectID , ref : 'Voucher', default: null},_id: false}],

    QRcode:     {type:String}
  },{collection: 'users'});

module.exports = mongoose.model('User',UserSchema);
