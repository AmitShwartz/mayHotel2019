const Hotel = require('../../schemas/hotel');

exports.createHotel = ({name, logo}) => {
  return new Promise((resolve, reject) => {
    if(!name) return reject('name param is missing');

    const newHotel = new Hotel({name, logo});
    newHotel.save((err,hotel) => {
      if (err) return reject(err.message);
      resolve(hotel);
    });
  });
}

// exports.getTables = ({hotel_id}) => {
//   return new Promise((resolve, reject) => {
//     if(!hotel_id) return reject('hotel_id param is missing');

//     Hotel.findById(hotel_id).exec((err, hotel) => {
//         if(err) return reject(err.message);
//         else if(!hotel) return reject(`hotel: ${hotel_id} not exists`);

//         Table.find({
//           hotel: hotel_id
//         }).select(`number sits`).sort('number').exec((err, tables) => {
//           if(err) return reject(err.message);

//           resolve(tables);
//         });
//     });
//   });
// }
