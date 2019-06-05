const Room = require('../../../schemas/room');
const User = require('../../../schemas/user');
const Hotel = require('../../../schemas/hotel');
const { resError, resSuccess } = require('../../../consts')

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.room_id);
    if (!room) throw new Error('invalid room');
    resSuccess(res, room)
  } catch (err) {
    resError(res, err.message);
  }
}

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ hotel: req.hotel._id }).sort('number');
    resSuccess(res, rooms)
  } catch (err) {
    resError(res, err.message);
  }
}

exports.getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ hotel: req.hotel._id, user: null }).sort('number');
    resSuccess(res, rooms)
  } catch (err) {
    resError(res, err.message);
  }
}

// add rooms to hotel
exports.addRooms = async (req, res) => {
  try {
    const { min, max, capacity, superstition } = req.body;
    var roomAdded = [];
    for (let i = min; i <= max; i++) {
      if (superstition.includes(i)) continue;
      let newRoom = new Room({
        hotel: req.hotel._id,
        number: i,
        capacity
      })
      await newRoom.save(async (err, room) => {
        if (err) console.log(err);
        else await roomAdded.push(room)

        if (i == max) {
          resSuccess(res, roomAdded)
        }
      })
    }
  } catch (err) {
    resError(res, err.message);
  }
}

exports.checkIn = async (req, res) => {
  try {
    const { number, user_id, start_date, end_date, guest_amount } = req.body;
    const user = await User.findById(user_id);
    if (!user) throw new Error('invalid user');
    const room = await Room.findOne({ hotel: req.hotel._id, number });
    if (!room) throw new Error('invalid room');
    else if (room.user != null) throw new Error(`room ${number} already occupied`);
    else if (room.capacity < guest_amount) throw new Error(`room ${number} max capacity is ${room.capacity}`);

    room.user = user_id;
    room.guest_amount = guest_amount;
    room.startdate = new Date(start_date);
    room.enddate = new Date(end_date);
    await room.save();

    user.room = room._id;
    user.hotel = room.hotel;
    await user.save();
    resSuccess(res, room)
  } catch (err) {
    resError(res, err.message);
  }
}

exports.checkOut = async (req, res) => {
  try {
    const room = await Room.findOne({ hotel: req.hotel._id, number: req.params.number });
    if (!room) throw new Error('invalid room');
    else if (room.user == null) throw new Error(`room is already empty`);

    const user = await User.findById(room.user);
    if (!user) throw new Error('invalid user')

    room.user = null;
    room.guest_amount = 0;
    room.startdate = null;
    room.enddate = null;
    await room.save();

    user.room = null;
    user.hotel = null;
    await user.save();
    resSuccess(res, room)
  } catch (err) {
    resError(res, err.message);
  }
}

// // add rooms to hotel
// exports.addRooms = ({ hotel_id, min, max, capacity, exc }) => {
//   return new Promise(async (resolve, reject) => {
//     if (!hotel_id || !min || !max || !capacity) return reject('hotel_id || min || max || capacity params are missing');
//     console.log(hotel_id)
//     let excArray = [];
//     if (exc) excArray = exc.split(",");

//     await Hotel.findById(hotel_id, (err, hotel) => {
//       console.log(hotel)
//       if (err) return reject(err.message);
//       else if (!hotel) return reject(`hotel ${hotel_id} not exists`);
//       var roomsSuccess = [];
//       var roomsFail = [];
//       for (let i = min; i <= max; i++) {
//         if (!excArray.includes(i.toString())) {  //only if room is NOT in excArray
//           let newRoom = new Room({ hotel: hotel_id, number: i, capacity });
//           newRoom.save((err) => {
//             if (err) //might ref not exists || (hotel, number) unique key already exists
//               roomsFail.push({ number: i, error: err.message });
//             else
//               roomsSuccess.push(newRoom);

//             if (i == max)
//               resolve({ roomsSuccess, roomsFail });
//           });
//         }
//       }
//     });
//   });
// }


// exports.checkOut = ({ room_id, user_id }) => {
//   return new Promise((resolve, reject) => {
//     if (!room_id || !user_id) reject('room_id || user_id params are missing');

//     Room.findById(room_id).then((room) => {
//       if (!room) return reject(`room_id: ${room_id} not exists)`);
//       if (room.user == null) return reject(`room is already empty`);
//       if (room.user != user_id) return reject(`room is occupied by another user: ${room.user}`);

//       room.user = null;
//       room.guest_amount = 0;
//       room.save((e, room) => {
//         if (e) reject(new Error(e.message));
//         resolve(room);
//       })
//     })
//     Room.checkOut(room_id, user_id).then(room => resolve(room)).catch(e => reject(e.message));
//   });
// }


// exports.checkIn = ({room_id, user_id, num_of_days, guest_amount}) => {
//   return new Promise(async (resolve, reject) => {
//     if(!room_id || !user_id || !num_of_days || !guest_amount) reject('guest_amount ||num_of_days || room_id || user_id params are missing');
//     else if(num_of_days<0) reject('num_of_days param is illigle');
//     await User.findById(user_id, async (err, user) => {
//       if(err) return reject(err.message);
//       else if(!user) return reject(`user ${user_id} not exists`);

//       await Room.findById(room_id, async (err, room) => {
//         if(err) return reject(err.message);
//         else if(!room) return reject(`room ${room_id} not exists`);
//         else if(room.user != null) return reject(`room ${room_id} already occupied`);
//         else if(room.capacity < guest_amount) return reject(`room ${room_id} max capacity is ${room.capacity}`);
//         room.user = user_id;
//         room.guest_amount = guest_amount;
//         room.startdate = new Date();
//         room.enddate = new Date();
//         room.enddate.setDate(room.enddate.getDate() + Number(num_of_days));
//         room.save((err, room) => {
//           if(err) return reject(err.message);
//           user.room = room_id;
//           user.hotel = room.hotel;
//           user.save((err, user) => {
//             if(err) return reject(err.message);

//             resolve(room)
//           })
//         })
//       });
//     });
