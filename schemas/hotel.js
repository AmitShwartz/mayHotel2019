const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const objectID = mongoose.Schema.Types.ObjectId;

var HotelSchema = new Schema({
  name: { type: String, required: true },
  logo: String,
  tokens: [{
    token: { type: String, required: true }
  }],
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8
  },
  events: [{
    event: {
      type: objectID,
      ref: 'Event',
      required: true
    },
    _id:false
  }],
  spa: [{
    appointment: {
      type: objectID,
      ref: 'Spa',
      required: true
    },
    _id:false
  }],
  meals: [{
    meal: {
      type: objectID,
      ref: 'Meal',
      required: true
    },
    _id:false
  }],
  rooms: [{
    room: {
      type: objectID,
      ref: 'Room',
      required: true
    },
    _id:false
  }]
}, { collection: 'hotels' });

HotelSchema.index({ name: 1 }, { unique: true });

HotelSchema.statics.findByCredentials = async (name, password) => {

  const hotel = await Hotel.findOne({ name });
  if (!hotel) throw Error('Unable to login');

  const isMatch = await bcrypt.compare(password, hotel.password);
  if (!isMatch) throw Error('Unable to login');

  return hotel;
}

HotelSchema.methods.generateAuthToken = async function () {
  const hotel = this;
  const token = jwt.sign({ _id: hotel._id.toString() }, 'mayHotel2019');

  hotel.tokens = hotel.tokens.concat({ token });
  await hotel.save();

  return token;
}

HotelSchema.methods.toJSON = function () {
  const hotel = this;
  const hotelObject = hotel.toObject();

  delete hotelObject.password;
  delete hotelObject.tokens;

  return hotelObject;
}

HotelSchema.pre('save', async function (next) {
  const hotel = this;

  if (hotel.isModified('password'))
    hotel.password = await bcrypt.hash(hotel.password, 8);

  next();
})

const Hotel = mongoose.model('Hotel', HotelSchema);
module.exports = Hotel;
