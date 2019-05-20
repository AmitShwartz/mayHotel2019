const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const objectID = mongoose.Schema.Types.ObjectId;

var HotelSchema = new Schema({
    name:  {type:String, required: true},
    logo:  String,
    token: {type: String, default: null},
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8
    },
    events: [{
      event:{
        type: objectID,
        ref: 'Event',
        default: null
      }
    }],
    spa:  [{
      appointment:{
        type: objectID,
        ref: 'Spa',
        default: null
      }
    }],
    meals:[{
      meal:{
        type: objectID,
        ref: 'Meal',
        default: null
      }
    }],
    rooms: [{
      room: {
        type: objectID,
        ref: 'Room',
        default: null      
      }
    }]
},{collection: 'hotels'});

HotelSchema.index({name:1}, {unique: true});

HotelSchema.statics.findByCredentials = async (name, password) => {

  const hotel = await Hotel.findOne({name});
  if(!hotel) throw Error('Unable to login');

  const isMatch = await bcrypt.compare(password, hotel.password);
  if(!isMatch) throw Error('Unable to login');

  return hotel;
}

HotelSchema.methods.generateAuthToken = async function (){
  const hotel = this;
  const token = jwt.sign({_id: hotel._id.toString()},'mayHotel2019');
  
  hotel.token = token;
  await hotel.save();

  return token;
}

HotelSchema.methods.toJSON = function () {
  const hotel = this;
  const hotelObject = hotel.toObject();

  //delete hotelObject.password;
  //delete hotelObject.token;

  return hotelObject;
}

HotelSchema.pre('save', async function (next) {
  const hotel = this;
  
  if(hotel.isModified('password'))
    hotel.password = await bcrypt.hash(hotel.password, 8);
  
  next();
})

const Hotel = mongoose.model('Hotel',HotelSchema);
module.exports = Hotel;
