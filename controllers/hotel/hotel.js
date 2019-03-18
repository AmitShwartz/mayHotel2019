const Hotel = require('../../schemas/hotel');
const Room  = require('../../schemas/room');
const Table = require('../../schemas/table');

exports.createHotel = (req) => {
  return new Promise((resolve, reject) => {
    let {name, logo} = req.body;
    if(!name) return reject('name param is missing');

    const newHotel = new Hotel({name, logo});
    newHotel.save((err,hotel) => {
      if (err) return reject(err.message);
      resolve(hotel);
    });
  });
}

exports.addRooms = (req) => {
  return new Promise((resolve,reject) => {
    let {hotel_id, min, max, exc} = req.body;
    if(!hotel_id || !min || !max)
      return reject('hotel_id || min || max params are missing');

    let excArray = [];
    if(exc)
      excArray = exc.split(",");

    Hotel.findById(hotel_id).exec((err, hotel) => {
      if(!hotel) return reject(`hotel ${hotel_id} not exists`);
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

// return all available rooms by hotel_id
exports.getAvailableRooms = (req) => {
  return new Promise((resolve, reject) => {
    let {hotel_id} = req.body;
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

exports.getTables = (req) => {
  return new Promise((resolve, reject) => {
    let {hotel_id} = req.body;
    if(!hotel_id) return reject('hotel_id param is missing');

    Hotel.findById(hotel_id).exec((err, hotel) => {
        if(err) return reject(err.message);
        else if(!hotel) return reject(`hotel: ${hotel_id} not exists`);

        Table.find({
          hotel: hotel_id
        }).select(`number sits`).sort('number').exec((err, tables) => {
          if(err) return reject(err.message);

          resolve(tables);
        });
    });
  });
}
