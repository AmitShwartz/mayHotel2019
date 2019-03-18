const Room  = require('../../../../schemas/room');
const User  = require('../../../../schemas/user');

exports.addMissing = (req) => {
  return new Promise((resolve, reject) => {
    let {room_id, item, quantity} = req.body;
    if(!room_id || !item || !quantity) return reject('room_id || item || quantity params are missing');
    const newMissing = {item,quantity};
    Room.findOneAndUpdate({_id: room_id}, {$push: {'room_service.missing_items': newMissing} }, {new: true}).exec((err, room) => {
      if(err) return reject(err.message);
      else if(!room) return reject(`room ${room_id} is not exists`);
      resolve(room);
    });
  });
}

exports.completeMissing = (req) => {
  return new Promise((resolve, reject) => {
    let {room_id} = req.body;
    if(!room_id) return reject('room_id param is missing');

    Room.findOneAndUpdate({_id: room_id}, {$set: {'room_service.missing_items': []} }, {new: true}).exec((err, room) => {
      if(err) return reject(err.message);
      else if(!room) return reject(`room ${room_id} is not exists`);
      resolve(room);
    });
  });
}

exports.addMaintenance = (req) => {
  return new Promise((resolve, reject) => {
    let {room_id, desc} = req.body;
    if(!room_id || !desc) return reject('room_id || desc params are missing');

    Room.findOneAndUpdate({_id: room_id}, {$push: {'room_service.maintenance': desc} }, {new: true}).exec((err, room) => {
      if(err) return reject(err.message);
      else if(!room) return reject(`room ${room_id} is not exists`);
      resolve(room);
    });
  });
}

exports.completeMaintenance = (req) => {
  return new Promise((resolve, reject) => {
    let {room_id} = req.body;
    if(!room_id) return reject('room_id param is missing');

    Room.findOneAndUpdate({_id: room_id}, {$set: {'room_service.maintenance': []} }, {new: true}).exec((err, room) => {
      if(err) return reject(err.message);
      else if(!room) return reject(`room ${room_id} is not exists`);
      resolve(room);
    });
  });
}

exports.addAlarmClock = (req) => {
  return new Promise((resolve, reject) => {
    let {room_id, date, time} = req.body;
    if(!room_id || !time || !date) return reject('room_id || date || time params are missing');

    const regexTime = RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
    if(!Date.parse(date)) return reject("date param is illegal");
    else if(!regexTime.test(time)) return reject("time param is illegal. HH:MM format only");

    //const datetime = new Date(`${date}T${time}`);
    let datetime = new Date(date);
    let timeArr = time.split(':');
    datetime.setHours(timeArr[0], timeArr[1]);

    Room.findOneAndUpdate({_id: room_id}, {'room_service.alarmClock': datetime}, {new: true}).exec((err, room) => {
      if(err) return reject(err.message);
      else if(!room) return reject(`room ${room_id} is not exists`);
      resolve(room);
    });
  });
}

exports.completeAlarmClock = (req) => {
  return new Promise((resolve, reject) => {
    let {room_id} = req.body;
    if(!room_id) return reject('room_id param is missing');

    Room.findOneAndUpdate({_id: room_id}, {'room_service.alarmClock': null}, {new: true}).exec((err, room) => {
      if(err) return reject(err.message);
      else if(!room) return reject(`room ${room_id} is not exists`);
      resolve(room);
    });
  });
}

exports.setCleanable = (req) => {
  return new Promise((resolve, reject) => {
    let {room_id, value} = req.body;
    if(!room_id || !value) return reject('room_id || value params are missing');
    else if(!(value=='true' || value=='false')) return reject("value param is not boolean");

    Room.findOneAndUpdate({_id: room_id}, {'room_service.isCleanable': value}, {new: true}).exec((err, room) => {
      if(err) return reject(err.message);
      else if(!room) return reject(`room ${room_id} is not exists`);
      resolve(room);
    });
  });
}
