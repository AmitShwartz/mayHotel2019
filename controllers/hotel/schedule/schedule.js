const Hotel = require('../../../schemas/hotel');
const Schedule = require('../../../schemas/schedule');
const User = require('../../../schemas/user');
const _ = require('lodash');

exports.addSchedule =({date, hotel_id}) => new Promise(async (resolve, reject) => {
  if(!date || !hotel_id) return reject('date || hotel_id param is missing');

  let newDate = new Date(date);
  let now = new Date();
  if(now > newDate) return reject(`The date ${date} has already passed`);
  newDate.setTime(newDate.getTime() + newDate.getTimezoneOffset() * 60 * 1000  + (/* UTC+8 */ 2) * 60 * 60 * 1000);
  newDate.setDate(newDate.getDate()+1)

  await Hotel.findById(hotel_id, async (err, hotel) =>{
    if(err) return reject(err.message);
    else if(!hotel) return reject(`hotel_id ${hotel_id} not exists`);
    let newSchedule = new Schedule({
      hotel: hotel_id,
      date: newDate
    });
    newSchedule.save((err,schedule) => {
      if (err) return reject(err.message);
      return resolve(schedule);
    });
  })
});

exports.addEventSchedule = ({hotel, date, name, category, content, location, capacity, time}) => {
  return new Promise(async (resolve, reject) =>{
    if(!(hotel && date && name && category && content && location && capacity && time)) return reject('params miissing');
    date = new Date(date);
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000  + (/* UTC+8 */ 2) * 60 * 60 * 1000);
    date.setDate(date.getDate()+1);

    await Schedule.findOne({hotel,date}, (err,check)=>{
      if(err) return reject(err.message);
      else if(!check) return reject('hotel || hotel date not exist');
    });
    await Schedule.findOne({hotel, date, events:{$not:{$elemMatch:{name,time}}}}, async (err, schedule) =>{
      if(err) return reject(err.message);
      else if(!schedule) return reject('event has already been assigned') 
      let reservations = new Array();
      const reservation = {user_id: null, occupeid: false};  
      for (let i = 0; i < capacity; i++) {
        reservations.push(reservation); 
      }
      console.log(reservations.length)
      schedule.events.push({name, category, content, location, capacity, time, reservations});

      schedule.save((err,schedule) => {
        if (err) return reject(err.message);
        return resolve(schedule.events);
      });
    });
  });
}

exports.addSpaSchedule = ({hotel, date, therepist}) => {
  return new Promise(async (resolve, reject) =>{
    if(!therepist||!hotel||!date) reject('hotel||date||therepist params are missing');
    date = new Date(date);
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000  + (/* UTC+8 */ 2) * 60 * 60 * 1000);
    date.setDate(date.getDate()+1);
    console.log(date)
    await Schedule.findOne({hotel,date}, (err,check)=>{
      if(err) return reject(err.message);
      else if(!check) return reject('hotel || hotel date not exist');
    });
    await Schedule.findOne({hotel, date, spa:{$not:{$elemMatch:{therepist}}}}, async (err, schedule) =>{
      console.log(schedule)
      if(err) return reject(err.message);
      else if(!schedule) return reject('therapist has already been assigned')
      for (let i = 8; i < 19; i++) {
        if(i==12) continue;
        let time = `${i}:00`;
        let newSpa = {therepist,time} ;
        schedule.spa.push(newSpa);
      }
      schedule.save((err,schedule) => {
        if (err) return reject(err.message);
        return resolve(schedule.spa);
      });
    });
  });
}

exports.getScheduleByHotel = ({hotel}) => {
  return new Promise(async (resolve, reject) => {
    if(!hotel) reject('hotel param is missing');
    Schedule.find({hotel}, (err, schedule) => {
      console.log(schedule)
      if(err) return reject(err.message);
      else if(!schedule) return reject("no schedule for this hotel");
      return resolve(schedule);
    }).sort({date:1});
  })
}

exports.deletePast = () =>{
  return new Promise ((resolve,reject) =>{
    let now = new Date();
    Schedule.deleteMany({date:{ $lt: now }},(err, deleted) =>{
      if(err) return reject(err.message);
      return resolve(deleted);
    })
  })
}

exports.getSpaAvailable = ({hotel})=>{
  return new Promise(async (resolve,reject)=>{
    if(!hotel)return reject('hotel param is missing');
    let now = new Date();
    await Schedule.find({hotel, date:{ $gte: now }}, async (err,schedule)=>{
      console.log(schedule)
      if(err) return reject(err.message);
      else if(!schedule||schedule.length == 0) return reject("no such schedule exist");
      await schedule.map(day =>{
        day.spa = _.filter(day.spa, spa => spa.status === false);
        day.spa = _.sortBy(day.spa,'int.time');
      })
      
      return resolve(schedule);
    }).sort({date:1});
  })
}

exports.getSpaAvailableByDate = ({hotel, date})=>{
  return new Promise(async (resolve,reject)=>{
    if(!hotel||!date)return reject('hotel || date params are missing');
    date = new Date(date);
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000  + (/* UTC+8 */ 2) * 60 * 60 * 1000);
    date.setDate(date.getDate()+1);

    await Schedule.findOne({hotel, date}, async (err,schedule)=>{
      if(err) return reject(err.message);
      else if(!schedule) return reject("no such schedule exist");
      schedule.spa = _.filter(schedule.spa, spa => spa.status === false);
      schedule.spa = _.sortBy(schedule.spa,'int.time');
      return resolve(schedule);
    });
  })
}

exports.addAppointment = ({appointment_id, user_id, treatment})=>{
  return new Promise(async (resolve,reject)=>{
    if(!(appointment_id && user_id && treatment)) return reject('appointment_id || user_id || treatment params are missing')

    await User.findById(user_id, (err,user) =>{
      if(err) return reject(err.message);
      else if(!user) return reject(`user with id ${user_id} not exist.`)
    }); 
    await Schedule.findOneAndUpdate({spa:{$elemMatch:{_id:appointment_id,status: false}}},
    {$set:{"spa.$.status": true, "spa.$.user": user_id, "spa.$.treatment": treatment }},
    (err, schedule)=>{
      if(err) return reject(err.message);
      else if(!schedule) return reject("no such schedule exist");
      let appointment = _.filter(schedule.spa, spa => spa.id == appointment_id)
      return resolve({appointment_id: appointment[0].id,
                      date: schedule.date,
                      time: appointment[0].time,
                      therepist: appointment[0].therepist,
                      treatment: treatment});
    })
  })
}

exports.cancelAppointment = ({appointment_id})=>{
  return new Promise(async (resolve,reject)=>{
  await Schedule.findOneAndUpdate({spa:{$elemMatch:{_id:appointment_id, status: true}}},
   {$set:{"spa.$.status": false, "spa.$.user": null, "spa.$.treatment": null }},
   (err, schedule)=>{
    if(err) return reject(err.message);
    else if(!schedule) return reject("no such schedule exist");
    let appointment = _.filter(schedule.spa, spa => spa.id == appointment_id)
    return resolve({appointment_id: appointment[0].id});
   })
  })
}

exports.deleteSchedule = ({schedule_id}) => {
  return new Promise((resolve, reject) => {
    if(!schedule_id) reject('schedule_id param is missing');
    Schedule.findByIdAndDelete(schedule_id, (err, res) =>{
      if(err) return reject(err.message);
      return resolve(res);
    })
  });
};
