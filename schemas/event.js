const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const EventSchema = new Schema({
  hotel: { type: ObjectId, ref: 'Hotel', required: true },
  name: { type: String, required: true },
  category: [String],
  content: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true, min: [1, 'at least 1 seat'] },
  counter: { type: Number, default: 0, min: [0, 'at least 0 seats taken'] },
  date: { type: Date, required: true },
  string: {
    date: String,
    time: String
  },
  reservations: [{
    reservation: {
      type: ObjectId,
      ref: 'Reservation',
      required: true,
    },
    _id: false
  }]
}, { collection: 'events' });

EventSchema.index({ date: 1, name: 1, hotel: 1 }, { unique: true }); //unique key

EventSchema.statics.checkCounter = async (event_id, amount) => {
  const event = await Event.findById(event_id);
  if (!event) throw Error(`Event ${event_id} not exist.`);
  const diff = event.capacity - event.counter;

  console.log(`${diff} = ${event.capacity} - ${event.counter}`)

  if (diff == 0) throw Error(`Event ${event_id} at full capacity.`);
  else if (amount > diff) throw Error(`There is only ${diff} seats left in this event`);

  return event;
};


EventSchema.methods.listOutUser = async function (reservation_id) {
  const event = this;

  event.reservations = await event.reservations.filter(reservation => {
    if (reservation._id == reservation_id) {
      event.counter -= reservation.amount;
      return false;
    }
    return true;
  });
  await event.save();
};

// EventSchema.methods.toJSON = function () {
//   const event = this;
//   const eventObject = event.toObject();

//   delete eventObject.reservations;
//   delete eventObject.counter;

//   return eventObject;
// }

EventSchema.pre('save', async function (next) {
  const event = this;

  event.string.date = await moment(event.date).format('DD/MM/YYYY');
  event.string.time = await moment(event.date).format('HH:mm');
  next()
});

const Event = mongoose.model('Event', EventSchema);
module.exports = Event;