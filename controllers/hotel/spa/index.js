const _ = require('lodash');
const moment = require('moment-timezone');
const Spa = require('../../../schemas/spa');
const Reservation = require('../../../schemas/reservation');
const { resSuccess, resError } = require('../../../consts');

exports.addSpa = async (req, res) => {
  try {
    const { therepist, hotel } = req.body;
    var dateVar = new Date(req.body.date);
    for (let i = 8; i < 19; i++) {
      if (i == 12) continue;
      let date = new Date(dateVar.setHours(i));
      let newSpa = new Spa({
        therepist,
        date,
        hotel
      });
      await newSpa.save();
    }
    const spa = await Spa.find({ hotel });
    resSuccess(res, spa);
  } catch (err) {
    resError(res, err.message);
  }
};

exports.getSpaAvailableByDate = async (req, res) => {
  try {
    const { hotel } = req.params;

    const date = await moment(req.params.date).format('DD/MM/YYYY');
    console.log(date)
    available = await Spa.find({ hotel, occupied: false, 'string.date': date }).sort({ 'int.time': 1 });

    resSuccess(res, available);
  } catch (err) {
    resError(res, err.message);
  }
}

exports.deletePast = async () => {
  try {
    let now = new Date();
    const deleted = await Spa.deleteMany({ date: { $lt: now } });
    resSuccess(res, deleted);
  } catch (err) {
    resError(res, err.message);
  }
};

exports.addAppointment = async (req, res) => {
  try {
    const user = req.user;
    const spa = await Spa.findById(req.body.appointment_id);
    if (!spa) throw new Error('appointment not exist')
    else if (spa.occupied) throw new Error('this appointment is already occupied')
    appointment = await Spa.addAppointment(spa, user, req.body.treatment);

    resSuccess(res, appointment);
  } catch (err) {
    resError(res, err.message);
  }
}

exports.cancelAppointment = async (req, res) => {
  try {
    
    const user = req.user;
    const spa = await Spa.findById(req.params.appointment_id);
    if (!spa) throw new Error('appointment not exist')
    appointment = await Spa.cancelAppointment(spa, user);

    resSuccess(res, appointment);
  } catch (err) {
    resError(res, err.message);
  }
}