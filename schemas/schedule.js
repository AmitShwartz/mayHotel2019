const mongoose = require('mongoose');
const SpaSchema = require('./spa');
const EventSchema = require('./event');
const Schema = mongoose.Schema;
const objectID = Schema.Types.ObjectId;

// const SpaSchema = new Schema({
//     therepist: {type: String , required: true},
//     user:      {type: String ,  ref : 'User', default: null},
//     treatment: {type: String, default: null},
//     status:    {type: Boolean, default: false},
//     time: {
//       type: String,
//       required: [true, 'time param missing'],
//       validate: {
//         validator: function(v) {
//           const regexTime = RegExp('^([8-9]|1[0-1]|1[3-8]):00$');
//           return regexTime.test(v);
//         },
//         message: props => `time: ${props.value} is illegal. HH:MM format and round hours only from 08:00 to 18:00 except 12:00`
//       }
//     },
//     int: {time: Number}
//   });

// SpaSchema.pre('save', function(next){
//     this.int.time  = TIME_INT(this.time);
//     next();
//     });


const ScheduleSchema = new Schema({
  hotel:    {type: objectID , ref : 'Hotel', required: true},
  date: {
    type: Date,
    required: [true, 'date param missing'],
    get: v => `${v.getDate()}/${v.getMonth()}/${v.getFullYear()}`
  },
  day: {
    type:Number,
    min: [1, 'day is illegal. min is 1'],
    max: [7, 'day is illegal. max is 7']
  },
  spa: [SpaSchema],
  events: [EventSchema]
},{collection: 'schedules'});

ScheduleSchema.index({ date: 1, hotel: 1}, { unique: true }); //(hotel, date) = unique key

ScheduleSchema.pre('save', function(next){
  this.day = this.toObject({ getters: false }).date.getDay() + 1;
  next();
});

module.exports = mongoose.model('Schedule',ScheduleSchema);
