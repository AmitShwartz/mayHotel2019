const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {TIME_INT} = require('../consts');

const ReservationSchema = new Schema({
  user_id:  {type: String, ref: 'User', default: null},
  occupied: {type: Boolean, default: false}
});

const EventSchema = new Schema({
    name:     {type: String, required: true},
    category: {type: String, required: true},
    content:  {type: String, required: true},
    location: {type: String, required: true},
    capacity: {type: Number, required: true, min: [1, 'at least 1 sit']},
    counter:  {type: Number, default: 0, min: [0, 'at least 0 sits taken']},
    time: {
      type: String,
      required: [true, 'time param missing'],
      validate: {
        validator: function(v) {
          const regexTime = RegExp('^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
          return regexTime.test(v);
        },
        message: props => `time: ${props.value} is illegal. HH:MM format only`
      },
    },
    int: {time: Number},
    reservations: [ReservationSchema]
  });

  EventSchema.pre('save', function(next){
    this.int.time  = TIME_INT(this.time);
    next();
  });

  module.exports = EventSchema;