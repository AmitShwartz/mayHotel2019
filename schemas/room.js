const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectID = Schema.Types.ObjectId;
const User = require("./user");

var RoomSchema = new Schema({
    hotel:    {type: objectID , ref : 'Hotel', required: true},
    number:   {type:Number, required: true},
    user:     {type: String , ref : 'User', default: null},
    room_service: {
      missing_items: [{item: String, quantity: Number}],
      maintenance: [String],
      isCleanable: {type:Boolean, default: true},
      alarmClock: {type:Date, default: null}
    }
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

RoomSchema.statics.checkIn = function(room_id, user_id){
  var Room = this;
  return new Promise((resolve, reject) => {
    Room.findById(room_id).then((room) => {
      if(!room) reject(new Error(`room_id: ${room_id} not exists`));
      if(room.user) reject(new Error(`room: ${room_id} already occupied by user ${user_id}`));
      room.user = user_id;
      room.save((e, room) => {
        if(e) reject(new Error(e.message));

        resolve(room);
      })
    }).catch(e => reject(new Error(e.message)));
  });
}

RoomSchema.statics.checkOut = function(room_id, user_id){
  var Room = this;
  return new Promise((resolve, reject) => {
    Room.findById(room_id).then((room) => {
      if(!room) reject(new Error(`room_id: ${room_id} not exists)`));
      if(room.user == null)     reject(new Error(`room is already empty`));
      if(room.user != user_id)  reject(new Error(`room is occupied by another user: ${room.user}`));

      room.user = null;
      room.save((e, room) => {
        if(e) reject(new Error(e.message));
        resolve(room);
      })
    })
  });
}

module.exports = mongoose.model('Room',RoomSchema);
