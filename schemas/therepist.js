const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectID = Schema.Types.ObjectId;
const _ = require('lodash');

const {TIME_INT, DATE_INT} = require('../consts');
const Hotel = require('./hotel');

const ScheduleSchema = new Schema({
  startDate: {
    type: Number,
    required: [true, 'startDate param missing'],
    validate: function(v) {
      let now = DATE_INT(new Date());
      if (now > v) return false;
      return true;
    }
  },
  endDate: {
    type: Number,
    required: [true, 'endDate param missing'],
    validate: function(v) {
      let now = DATE_INT(new Date());
      if (now > v) return false;
      return true;
    }  
  },
  dayOff: {
    type: Number,
    required: [true, 'dayOff param missing'],
    validate: function(v) {
      let now = DATE_INT(new Date());
      if (now > v) return false;
      return true;
    }  
  },
  startTime: {
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
  endTime: {
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
  int: {
    startTime: Number,
    endTime: Number
  }
});

const AppointmentSchema = new Schema({
  treatment: {type: String, required: true},
  user:      {type: String ,  ref : 'User', required: true},
  date:      {type: Number, required: true}, //INT -> YYYYMMDD
  time:      {type: Number, required: true} // HHMM
});

const TherepistSchema = new Schema({
  hotel:       {type: objectID , ref : 'Hotel', required: true},
  name:        {type: String, required: true},
  schedule:    ScheduleSchema,
  appointments: [AppointmentSchema],
  numOfApp:     {type: Number, default: 0}
},{collection: 'therepists'});

TherepistSchema.pre('save', function(next){
  Hotel.findById(this.hotel).exec((err, hotel) => {
    if(err) next(err);
    if(!hotel) next(new Error("hotel_id not exists"));

    if(!hotel) next(new Error("hotel_id not exists"));
    this.schedule.int.startTime  = TIME_INT(this.schedule.startTime);
    this.schedule.int.endTime    = TIME_INT(this.schedule.endTime);
    next();
  })
});

module.exports = mongoose.model('Therepist',TherepistSchema);



