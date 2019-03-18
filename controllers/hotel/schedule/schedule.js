const Hotel = require('../../../schemas/hotel');
const _ = require('lodash');

exports.getScehduleByDay = (req) => { // GET /hotel/schedule/:hotel_id/:day
  return new Promise((resolve, reject) => {
    let {hotel_id, day} = req.params;
    if(!hotel_id || !day) reject('hotel_id || day params are missing');

    Hotel.findById(hotel_id).select("schedule").exec((err, hotel) => {
      if(!hotel) return reject("hotel_id not exists");
      let schedule = _.orderBy(hotel.schedule.filter(s => s.day==day), ['time'], ['asc']);
      resolve(schedule);
    });
  });
}

exports.addScheduleItem = (req) => {
  return new Promise((resolve, reject) => {
    let {hotel_id} = req.body;
    let schedule = _.pick(req.body, ['day', 'time', 'desc']);

    Hotel.findById(hotel_id).exec((err, hotel) => {
      if(!hotel) return reject(`hotel_id ${hotel_id} not exists`);

      hotel.schedule.push(schedule);
      hotel.save((err, hotel) => {
        if(err) return reject(err.message);
        resolve(hotel);
      });
    });
  });
};

exports.editSchedule = (req) => { // PATCH /hotel/schedule
  return new Promise((resolve, reject) => {
    let {hotel_id, schedule_id, day, time, desc} = req.body;
    if(!hotel_id || !schedule_id || !day || !time || !desc) reject('hotel_id || schedule_id || day || time || desc params are missing');

    Hotel.update({'schedule._id': schedule_id}, { '$set': {
      'schedule.$.day': day,
      'schedule.$.time': time,
      'schedule.$.desc': desc
    }}).exec((err, hotel) => {
      if(err) reject(err.message);
      if(!hotel) reject("hotel_id not exists");
      resolve(hotel);
    });
  })
}

exports.deleteSchedule = (req) => {
  return new Promise((resolve, reject) => {
    let {hotel_id, schedule_id} = req.body;
    if(!hotel_id || !schedule_id) reject('hotel_id || schedule_id params are missing');
    Hotel.update(
      { _id: hotel_id },
      { $pull: {'schedule': { _id: schedule_id }}}
    ).exec((err, stats) => {
      if(err) reject(err.message);
      if(stats.nModified==0) reject("schedule_id not exists in hotel");
      resolve(stats);
    });
  });
};

exports.getSchedule = (req) => { // GET /hotel/schedule/me/:hotel_id/:schedule_id
  return new Promise((resolve, reject) => {
    let {hotel_id, schedule_id} = req.params;
    if(!hotel_id || !schedule_id) reject('hotel_id || schedule_id params are missing');

    Hotel.findById(hotel_id).exec((err, hotel) => {
      if(err) reject(err.message);
      var schedule = _.find(hotel.schedule, (o) => o._id==schedule_id);
      if(!schedule) reject("schedule_id not found");
      resolve(schedule);
    })
  });
};
