const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {TIME_INT} = require('../consts');

const SpaSchema = new Schema({
  therepist: {type: String , required: true},
  user:      {type: String ,  ref : 'User', default: null},
  treatment: {type: String, default: null},
  status:    {type: Boolean, default: false},
  time: {
    type: String,
    required: [true, 'time param missing'],
    validate: {
      validator: function(v) {
        const regexTime = RegExp('^([8-9]|1[0-1]|1[3-8]):00$');
        return regexTime.test(v);
      },
      message: props => `time: ${props.value} is illegal. HH:MM format and round hours only from 08:00 to 18:00 except 12:00`
    }
  },
  int: {time: Number}
});

SpaSchema.pre('save', function(next){
  this.int.time  = TIME_INT(this.time);
  next();
  });

  module.exports = SpaSchema;
