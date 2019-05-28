const Hotel = require('../../schemas/hotel');
const { resError, resSuccess } = require("../../consts");

exports.createHotel = async (req, res) => {
  try {
    const newHotel = new Hotel(req.body);
    await newHotel.save();

    const token = await newHotel.generateAuthToken();

    resSuccess(res, { hotel: newHotel, token });
  } catch (err) {
    resError(res, err.massage);
  }
}

exports.login = async (req, res) => {
  try {
    const hotel = await Hotel.findByCredentials(req.body.name, req.body.password);
    const token = await hotel.generateAuthToken();
    resSuccess(res, { hotel, token });
  } catch (err) {
    resError(res, err.message);
  }
}

exports.logout = async (req, res) => {
  try {
    req.hotel.tokens = req.hotel.tokens.filter(token => token.token !== req.token);
    await req.hotel.save();
    resSuccess(res);
  } catch (err) {
    resError(res, err.message);
  }
}

exports.logoutAll = async (req, res) => {
  try {
    req.hotel.tokens = [];
    await req.hotel.save();
    resSuccess(res);
  } catch (err) {
    resError(res, err.message);
  }
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
