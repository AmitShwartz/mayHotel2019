const Room  = require('../../../schemas/room');
const User  = require('../../../schemas/user');
const Hotel  = require('../../../schemas/hotel');

// return room by room_id
exports.getRoom = ({room_id}) => {
  return new Promise((resolve, reject) => {
    if(!room_id) reject('room_id param is missing');

    Room.findById(room_id).populate('user').populate('hotel_id').exec((err, room) => {
      if(err) reject(err.message);
      else if(!room) reject(`Room: ${room_id} not exists`);
      resolve(room);
    });
  });
}

// return all rooms by hotel_id
exports.getAllRooms = ({hotel_id}) => {
  return new Promise((resolve, reject) => {
    if(!hotel_id) return reject('hotel_id param is missing');

    Hotel.findById(hotel_id).exec((err, hotel) => {
        if(err) return reject(err.message);
        else if(!hotel) return reject(`hotel: ${hotel_id} not exists`);

        Room.find({hotel: hotel_id}).select(`number`).sort('number').exec((err, rooms) => {
          if(err) return reject(err.message);
          resolve(rooms);
        });
    });
  });
}

// return all available rooms by hotel_id
exports.getAvailableRooms = ({hotel_id}) => {
  return new Promise((resolve, reject) => {
    if(!hotel_id) return reject('hotel_id param is missing');

    Hotel.findById(hotel_id).exec((err, hotel) => {
        if(err) return reject(err.message);
        else if(!hotel) return reject(`hotel: ${hotel_id} not exists`);

        Room.find({
          hotel: hotel_id,
          user: null
        }).select(`number`).sort('number').exec((err, rooms) => {
          if(err) return reject(err.message);

          resolve(rooms);
        });
    });
  });
}

// add rooms to hotel
exports.addRooms = ({hotel_id, min, max, exc}) => {
  return new Promise(async (resolve,reject) => {
    if(!hotel_id || !min || !max) return reject('hotel_id || min || max params are missing');
    console.log(hotel_id)
    let excArray = [];
    if(exc) excArray = exc.split(",");

    await Hotel.findById(hotel_id, (err, hotel) => {
      console.log(hotel)
      if(err) return reject(err.message);
      else if(!hotel) return reject(`hotel ${hotel_id} not exists`);
      var roomsSuccess = [];
      var roomsFail = [];
      for(let i=min; i<=max; i++){
        if(!excArray.includes(i.toString())) {  //only if room is NOT in excArray
          let newRoom = new Room({hotel: hotel_id, number: i});
          newRoom.save((err) => {
            if(err) //might ref not exists || (hotel, number) unique key already exists
              roomsFail.push({number: i, error: err.message});
            else
              roomsSuccess.push(newRoom);

            if(i==max)
              resolve({roomsSuccess, roomsFail});
          });
        }
      }
    });
  });
}

exports.checkIn = ({room_id, user_id, num_of_days}) => {
  return new Promise(async (resolve, reject) => {
    if(!room_id || !user_id || !num_of_days) reject('num_of_days || room_id || user_id params are missing');
    else if(num_of_days<0) reject('num_of_days param is illigle');
    await User.findById(user_id, async (err, user) => {
      if(err) return reject(err.message);
      else if(!user) return reject(`user ${user_id} not exists`);

      await Room.findById(room_id, async (err, room) => {
        if(err) return reject(err.message);
        else if(!room) return reject(`room ${room_id} not exists`);
        else if(room.user != null) return reject(`room ${room_id} already occupied`);
        room.user = user_id;
        room.startdate = new Date();
        room.enddate = new Date();
        room.enddate.setDate(room.enddate.getDate() + Number(num_of_days));
        room.save((err, room) => {
          if(err) return reject(err.message);
          user.room = room_id;
          user.save((err, user) => {
            if(err) return reject(err.message);
            
            resolve(room)
          })
        })
      });
    });

    // Room.findById(room_id).then((room) => {
    //   if(!room) reject(new Error(`room_id: ${room_id} not exists`));
    //   else if(room.user) reject(new Error(`room: ${room_id} already occupied by user ${user_id}`));
    //   room.user = user_id;
    //   room.save((e, room) => {
    //     if(e) reject(new Error(e.message));

    //     resolve(room);
    //   })
    // })
    // Room.checkIn(room_id, user_id).then((room) => {
    //   resolve(room);
    // }).catch((e) => {
    //   reject(e.message);
    // });
  });
}

exports.checkOut = ({room_id, user_id}) => {
  return new Promise((resolve, reject)  => {
    if(!room_id || !user_id) reject('room_id || user_id params are missing');

    Room.checkOut(room_id, user_id).then(room => resolve(room)).catch(e => reject(e.message));
  });
}
