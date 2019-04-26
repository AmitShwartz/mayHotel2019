const Room  = require('../../../../schemas/room');
const _ = require('lodash');

exports.getOpenCalls = ({hotel_id}) => {
  return new Promise((resolve, reject) => {
    if(!hotel_id) return reject('hotel_id param is missing');
    Room.find({hotel: hotel_id}, async (err, rooms) => {
      if(err) return reject(err.message);
      else if(!rooms || rooms.length == 0) return reject(`Hotel ${hotel_id} has no rooms `);
      let calls = [];
      await rooms.map(async (room) =>{
        room.room_service.missing_items.map(item =>{
          let call = {
            id: item.id,
            room_num: room.number,
            type: 'missing',
            is_handle: item.is_handle,
            date: item.date,
            item: item.item,
            quantity: item.quantity
          }
          calls.push(call);
        });
        room.room_service.maintenance.map(item =>{
          let call = {
            id: item.id,
            room_num: room.number,
            type: 'maintenance',
            is_handle: item.is_handle,
            date: item.date,
            desc: item.desc,
          }
          calls.push(call);      
        });
        console.log(room.room_service.clean.date)
        if(room.room_service.clean.date!== null) {
          let clean = {
            id: room.id,
            room_num: room.number,
            date: room.room_service.clean.date,
            is_handle: room.room_service.clean.is_handle,
            type: 'clean'
          }
          calls.push(clean)
        }
      })
      calls = await _.sortBy(calls, 'date')
      return resolve(calls);
    });
  });
}

exports.addMissing = ({room_id, item, quantity}) => {
  return new Promise((resolve, reject) => {
    if(!room_id || !item || !quantity) return reject('room_id || item || quantity params are missing');
    const newMissing = {item,quantity};
    Room.findOneAndUpdate({_id: room_id}, {$push: {'room_service.missing_items': newMissing} }, {new: true}).exec((err, room) => {
      if(err) return reject(err.message);
      else if(!room) return reject(`room ${room_id} is not exists`);
      resolve(room);
    });
  });
}

exports.handleMissing = ({call_id}) => {
  return new Promise((resolve, reject) => {
    if(!call_id) return reject('call_id param is missing');
    console.log(call_id)
    Room.findOneAndUpdate({'room_service.missing_items':{$elemMatch:{_id:call_id}}},
      {$set:{'room_service.missing_items.$.is_handle': true}},
      (err, call)=>{
       if(err) return reject(err.message);
       else if(!call) return reject("no such call exist");
       return resolve(call);
      })
  });
}

exports.completeMissing = ({call_id}) => {
  return new Promise((resolve, reject) => {
    if(!call_id) return reject('call_id param is missing');
    console.log(call_id)
    Room.findOneAndUpdate({'room_service.missing_items':{$elemMatch:{_id:call_id}}},
      {$pull:{'room_service.missing_items': { '_id': call_id}}},
      (err, call)=>{
       if(err) return reject(err.message);
       else if(!call) return reject("no such call exist");
       return resolve(call);
      })
  });
}

exports.addMaintenance = ({room_id, desc}) => {
  return new Promise((resolve, reject) => {
    if(!room_id || !desc) return reject('room_id || desc params are missing');
    const newMaintenance = {desc};

    Room.findOneAndUpdate({_id: room_id}, 
      {$push: {'room_service.maintenance': newMaintenance} }, {new: true}).exec((err, room) => {
      if(err) return reject(err.message);
      else if(!room) return reject(`room ${room_id} is not exists`);
      resolve(room);
    });
  });
}


exports.handleMaintenance = ({call_id}) => {
  return new Promise((resolve, reject) => {
    if(!call_id) return reject('call_id param is missing');
    console.log(call_id)
    Room.findOneAndUpdate({'room_service.maintenance':{$elemMatch:{_id:call_id}}},
      {$set:{'room_service.maintenance.$.is_handle': true}},
      (err, call)=>{
       if(err) return reject(err.message);
       else if(!call) return reject("no such call exist");
       return resolve(call);
      })
  });
}

exports.completeMaintenance = ({call_id}) => {
  return new Promise((resolve, reject) => {
    if(!call_id) return reject('call_id param is missing');

    Room.findOneAndUpdate({'room_service.maintenance':{$elemMatch:{_id:call_id}}},
      {$pull:{'room_service.maintenance':{_id:call_id}}},
      (err, call)=>{
       if(err) return reject(err.message);
       else if(!call) return reject("no such call exist");
       return resolve(call);
      })
  });
}

exports.addAlarmClock = ({room_id, date, time}) => {
  return new Promise((resolve, reject) => {
    if(!room_id || !time || !date) return reject('room_id || date || time params are missing');
   
    const regexTime = RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
    if(!Date.parse(date)) return reject("date param is illegal");
    else if(!regexTime.test(time)) return reject("time param is illegal. HH:MM format only");

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

exports.completeAlarmClock = ({room_id}) => {
  return new Promise((resolve, reject) => {
    if(!room_id) return reject('room_id param is missing');
    Room.findOneAndUpdate({_id: room_id}, {'room_service.alarmClock': null}, {new: true}).exec((err, room) => {
      if(err) return reject(err.message);
      else if(!room) return reject(`room ${room_id} is not exists`);
      resolve(room);
    });
  });
}

exports.addClean = ({room_id, date, time}) => {
  return new Promise((resolve, reject) => {
    if(!room_id || !time || !date) return reject('room_id || date || time params are missing');
    
    const regexTime = RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
    if(!Date.parse(date)) return reject("date param is illegal");
    else if(!regexTime.test(time)) return reject("time param is illegal. HH:MM format only");

    let datetime = new Date(date); 
    let timeArr = time.split(':');
    datetime.setHours(timeArr[0], timeArr[1]);

    Room.findOneAndUpdate({_id: room_id}, {'room_service.clean.date': datetime}, {new: true}).exec((err, room) => {
      if(err) return reject(err.message);
      else if(!room) return reject(`room ${room_id} is not exists`);
      resolve(room);
    });
  });
}

exports.handleClean = ({room_id}) => {
  return new Promise((resolve, reject) => {
    if(!room_id) return reject('room_id param is missing');
    console.log(room_id)
    Room.findByIdAndUpdate(room_id,{'room_service.clean.is_handle': true},
      (err, call)=>{
       if(err) return reject(err.message);
       else if(!call) return reject("no such call exist");
       return resolve(call);
      })
  });
}
