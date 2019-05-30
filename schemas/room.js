const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectID = Schema.Types.ObjectId;
const User = require("./user");

var RoomSchema = new Schema({
    hotel:    {type: objectID , ref : 'Hotel', required: true},
    number:   {type:Number, required: true},
    user:     {type: String , ref : 'User', default: null},
    guest_amount: {type:Number, default: null},
    capacity: {type:Number, required: true},
    room_service: {
      missing: [{
        items:[{item: String, quantity: Number, _id: false}],
        is_handle: {type:Boolean, default: false},
        date: {type: Date, default: new Date()}
      }],
      maintenance: [{
        desc: String,
        is_handle: {type:Boolean, default: false},
        date: {type: Date, default: new Date()}
      }],
      clean: {
        date: Date,
        is_handle: {type:Boolean, default: false}
      },
      alarmClock: {type:Date, default: null}
    },
    startdate: {type: Date, default: null},
    enddate: {type: Date, default: null}
  },{collection: 'rooms'});

RoomSchema.index({ number: 1, hotel: 1}, { unique: true }); //(hotel, number) = unique key

RoomSchema.pre('save', function(next){
  var room = this;

  if(room.user && room.isModified('user')){ //check if room.user id is existed user.
      User.findById(room.user).then((user) => {
        if(!user) next(new Error(`user_id: ${room.user} not exists`));
        next();
      })
  } else {
    next();
  }
});

const Room = mongoose.model('Room',RoomSchema);
module.exports = Room;
