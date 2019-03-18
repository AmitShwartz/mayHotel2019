const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectID = Schema.Types.ObjectId;
const _ = require('lodash');

const {TIME_INT} = require('../consts');
const Hotel = require('./hotel');

const MealSchema = new Schema({
    hotel:    {type: objectID , ref : 'Hotel', required: true},
    name:     {type: String, required: true},
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
  },{collection: 'meals'});

MealSchema.pre('save', function(next){
  Hotel.findById(this.hotel).exec((err, hotel) => {
    if(err) next(err);
    if(!hotel) next(new Error("hotel_id not exists"));

    if(!hotel) next(new Error("hotel_id not exists"));
    this.int.startTime  = TIME_INT(this.startTime);
    this.int.endTime    = TIME_INT(this.endTime);
    next();
  })
});

module.exports = mongoose.model('Meal',MealSchema);
