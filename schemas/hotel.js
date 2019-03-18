const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ScheduleSchema = new Schema({
  day: {
    type:Number,
    required:[true, 'day param is missing'],
    min: [1, 'day is illegal. min is 1'],
    max: [7, 'day is illegal. max is 7']
  },
  time: {
    type: String,
    required: [true, 'time param missing'],
    validate: {
      validator: function(v) {
        const regexTime = RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
        return regexTime.test(v);
      },
      message: props => `time: ${props.value} is illegal. HH:MM format only`
    },
  },
  desc: {
    type:String,
    required: [true, 'desc param is missing']
  }
});

var HotelSchema = new Schema({
    name:  {type:String, required: true},
    logo:  String,
    schedule: [ScheduleSchema]
  },{collection: 'hotels'});

module.exports = mongoose.model('Hotel',HotelSchema);
