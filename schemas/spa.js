const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const { TIME_INT, DATE_INT } = require('../consts');

const SpaSchema = new Schema({
  hotel: { type: ObjectId, ref: 'Hotel', required: true },
  user: { type: String, ref: 'User', default: null },
  therepist: { type: String, required: true },
  treatment: { type: String, default: null },
  occupied: { type: Boolean, default: false },
  date: { type: Date, required: true },
  string: {
    date: String,
    time: String
  },
  int: {
    date: Number,
    time: Number
  }
}, { collection: 'spa' });

SpaSchema.index({ date: 1, therepist: 1, hotel: 1 }, { unique: true }); // unique key

SpaSchema.statics.addAppointment = async (spa, user, treatment) => {
  spa.user = user._id;
  spa.occupied = true;
  spa.treatment = treatment
  await spa.save();

  user.spa = await user.spa.concat({ appointment: spa._id });
  await user.save();

  return spa;
}

SpaSchema.statics.cancelAppointment = async function(spa, user) {
  spa.user = null;
  spa.occupied = false;
  spa.treatment = null;
  await spa.save();

  user.spa = await user.spa.filter(
    item => item.appointment.toString() != spa._id.toString()
    );
  await user.save();

  return spa;
}

SpaSchema.pre('save', async function (next) {
  const spa = this;

  spa.string.date = await moment(spa.date).format('DD/MM/YYYY');
  spa.string.time = await moment(spa.date).format('HH:mm');
  spa.int.time = await TIME_INT(spa.string.time);
  spa.int.date = await DATE_INT(spa.date);
  next()
});

const Spa = mongoose.model('Spa', SpaSchema);
module.exports = Spa;
