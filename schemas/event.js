const mongoose = require('mongoose');
const moment = require('moment-timezone');
const QRCode  = require('qrcode');
const _ = require('lodash');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const EventSchema = new Schema({
    hotel:    {type: ObjectId, ref: 'Hotel', required: true},
    name:     {type: String, required: true},
    category: [String],
    content:  {type: String, required: true},
    location: {type: String, required: true},
    capacity: {type: Number, required: true, min: [1, 'at least 1 seat']},
    counter:  {type: Number, default: 0, min: [0, 'at least 0 seats taken']},
    date:     {type: Date, required: true},
    string:{
      date: String,
      time: String
    },
    qrcode: String,
    reservations: [{
      user: {type: String, ref: 'User', required: true},
      amount: {type: Number, required: true, min: [1, 'at least 1 seat']},
      counter: {type: Number, default: 0, min: [0, 'at least 0 seats taken']}
    }]
  },{collection: 'events'});

  EventSchema.statics.checkCounter = async (event_id, amount) => {
    const event = await Event.findById(event_id);
    if(!event) throw Error(`Event ${event_id} not exist.`);
    const diff = event.capacity - event.counter;
    if(diff == 0) throw Error(`Event ${event_id} at full capacity.`);
    else if (amount > diff) throw Error(`There is only ${diff} seats left in this event`);

    return event;
  };

  EventSchema.methods.listUser = async function (user, amount) {
    const event = this;

    let existingReservations = await _.filter(event.reservations, reservation => reservation.user == user._id);
    let listedAmount = 0;

    existingReservations.forEach(reservation => listedAmount += reservation.amount);
    const diff = user.room.guest_amount - listedAmount;
    if(diff < amount) throw new Error(`User ${user._id} can list up to max of ${diff} guests.`)

    const generatedID = new mongoose.Types.ObjectId();
    console.log(generatedID)
    event.reservations = await event.reservations.concat({_id: generatedID, user: user._id, amount});
    event.counter += amount;
    await event.save()
    return generatedID;
  };

  EventSchema.methods.listOutUser = async function (reservation_id) {
    const event = this;

    event.reservations = await event.reservations.filter( reservation => {
      if(reservation._id == reservation_id) {
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
 
    event.qrcode = await QRCode.toDataURL(event._id.toString()); 
    event.string.date = await moment(event.date).format('DD/MM/YYYY');
    event.string.time = await moment(event.date).format('HH:mm');
    next()
  });

  const Event = mongoose.model('Event', EventSchema);
  module.exports = Event;