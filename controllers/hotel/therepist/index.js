const _      =  require('lodash');
const Hotel       =   require('../../../schemas/hotel');
const Therepist        =   require('../../../schemas/therepist');
const {DATE_INT, TIME_INT}   =   require('../../../consts');

exports.addTherepist = async (req) => {
  return new Promise((resolve, reject) => {
    let body = _.pick(req.body, ['hotel', 'name']);
    if(_.size(body) !== 2) reject('hotel || name params are missing');
    let schedule = _.pick(req.body, ['startDate','endDate', 'dayOff', 'startTime', 'endTime']);
    if(_.size(schedule) < 4) reject('startDate || endDate || startTime || endTime params are missing');
    schedule.startDate = DATE_INT(schedule.startDate);
    schedule.endDate = DATE_INT(schedule.endDate);
    schedule.dayOff = DATE_INT(schedule.dayOff);
    let newTherepist = new Therepist(body);
    newTherepist.schedule = schedule;
    newTherepist.save((err, therepist) => {
      if(err) reject(err.message);
      resolve(therepist);
    })
  });
};

exports.addAppointment = async ({time, user, date, treatment, hotel}) =>{
  return new Promise((resolve, reject)=>{
    if (!hotel || !time || !user || !date || !treatment)
      reject('user || time || date || treatment || hotel params are missing');
    
    time = TIME_INT(time);
    date = DATE_INT(new Date(date));
    let now = DATE_INT(new Date());
    if(now > date) reject('date illegal. already passed');
    
    Hotel.findById(hotel).exec((err, hotel) => { //check if hotel exists
      if(err)   return reject(err.message);
      if(!hotel) return reject('hotel not exists');
      console.log(`${user}, ${date}, ${time}, ${treatment}`);
      Therepist.find({hotel, appointments: {$elemMatch: {user, date, time, treatment}}})
      .exec((err, therepists) =>{ //check if user not already ordered therepist for that treatment
        if(err)     return reject(err.message);
        if(therepists.length>0)  return reject('user already ordered therepist for that treatment');
        
        Therepist.find({ //find available therepist for that treatment
          hotel,
          "schedule.int.endTime":   {$gt: time},
          "schedule.int.startTime": {$lte: time},
          "schedule.endDate":   {$gte: date},
          "schedule.startDate": {$lte: date},
          "schedule.dayOff": {$not: {$eq: date}},
          appointments: { //find all therepist.appointments NOT CONTAINS: {treatment,date, time}
            $not: {
              $elemMatch: {
                treatment,
                date,
                time
              }
            }
          }
        }).sort('numOfApp').exec((err, therepists) => {
          if(err) return reject(err.message);
          if(!therepists || therepists.length===0) return reject('therepist not available for that treatment');
          
          let newAppointment = {time, user, date, treatment};
          let availableTherepist = therepists[0];
          availableTherepist.numOfApp = availableTherepist.numOfApp + 1;
          availableTherepist.appointments.push(newAppointment);
          availableTherepist.save((err, availableTherepist) => {
            if(err) return reject(err.message);
            resolve({
              appointment_id:_.last(availableTherepist.appointments)._id,
              name: availableTherepist.name
            });
          });
        });
      });
    });
  });
};

exports.getAllTherepists = async (req) => {
  return new Promise((resolve, reject) => {
    let {hotel_id} = req.body;
    if(!hotel_id) reject("hotel_id is missing");

    Hotel.findById(hotel_id).exec((err, hotel) => {
      if(err) return reject(err.message);
      else if(!hotel) return reject(`hotel: ${hotel_id} not exists`);
      
      Therepist.find({hotel: hotel_id}).exec((err, therepists) => {
        if(err) return reject(err.message);
        resolve(therepists);
      })
    });
  });
};

// exports.removeTherepist = async ({therepist_id}) => {
//   return new Promise((resolve, reject) => {
//     if(!therepist_id) reject("therepist_id is missing");
//     Therepist.findById(therepist_id).exec((err, therepist) => {
//       if(err) return reject(err.message);
//       if(therepist.appointments.length !== 0) return reject("therepist to delete still have appointments");
    
//       Therepist.findByIdAndRemove(therepist_id).exec((err, therepist) => {
//         if(err) return reject(err.message);
//         resolve(therepist);
//       });
//     });
//   });
// };

exports.removeTherepist = async (therepist_id) =>{
  return new Promise((resolve, reject) => {
    Therepist.findByIdAndRemove(therepist_id, (err, therepist) => {
      if(err) reject(err.message);
      resolve(therepist);
    });
  });
};

exports.findAndCheck = async ({therepist_id}) => {
  return new Promise((resolve, reject) => {
    if(!therepist_id) reject("therepist_id is missing");
    Therepist.findById(therepist_id, (err, therepist) => {
      if(err) reject(err.message);
      if(therepist.appointments.length !== 0) reject("therepist to delete still have appointments");
      resolve(therepist_id);
    });
  });
};

exports.removeAllTherepists = async ({hotel_id}) => {
  return new Promise((resolve, reject) => {
     if(!hotel_id) reject("hotel_id is missing");
     return "test"; //t
     //   Therepist.find({hotel: hotel_id}).exec((err, therepists)=>{
    //     if(err) reject(err.message);
    //    therepists.forEach(therepist=> {
    //      if(therepist.numOfApp !== 0)  throw new Error("one of therepist to delete still have appointments");
    //    });
    //    Therepist.remove({hotel: hotel_id}).exec((err, cb) => {
    //      if(err)  reject(err.message);
    //      resolve(cb);
    //    })
    //  });
  }).then((e)=>{resolve(e+"1")});
};

exports.deleteAppointment = async ({appointment_id}) => {
  return new Promise((resolve, reject) => {
    Therepist.findOne({'appointments._id': appointment_id}).exec((err,therepist) => {
      if(err) return reject(err.message);
      if(!therepist || therepist.length===0) return reject('appointment_id not exists');

      therepist.numOfApp = therepist.numOfApp -1;
      therepist.appointments = _.filter(therepist.appointments, (appointment) => appointment.id!==appointment_id); //remove appointment_id from appointments
      therepist.save((err, therepist) => {
        if(err) return reject(err.message);
        resolve(therepist);
      })
    })
  }); //end promise
};
