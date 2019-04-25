const _      =  require('lodash');
const Hotel       =   require('../../../schemas/hotel');
const Therepist        =   require('../../../schemas/therepist');
const {DATE_INT, TIME_INT}   =   require('../../../consts');

exports.addTherepist = async (req) => {
  return new Promise((resolve, reject) => {
    let body = _.pick(req.body, ['hotel', 'name']);
    if(_.size(body) !== 2) return reject('hotel || name params are missing');
    let schedule = _.pick(req.body, ['startDate','endDate', 'dayOff', 'startTime', 'endTime']);
    if(_.size(schedule) !== 5) return reject('startDate || endDate || startTime || endTime params are missing');
    schedule.startDate = DATE_INT(schedule.startDate);
    schedule.endDate = DATE_INT(schedule.endDate);
    schedule.dayOff = DATE_INT(schedule.dayOff);
    let newTherepist = new Therepist(body);
    newTherepist.schedule = schedule;
    newTherepist.save((err, therepist) => {
      if(err) return reject(err.message);
      resolve(therepist);
    })
  });
};

exports.addAppointment = ({time, user, date, treatment, hotel}) => new Promise((resolve, reject)=>{
    if (!hotel || !time || !user || !date || !treatment)
      return reject('user || time || date || treatment || hotel params are missing');
    
    time = TIME_INT(time);
    date = DATE_INT(new Date(date));
    const now = DATE_INT(new Date());
    if(now > date) return reject('date illegal. already passed');
    
    Hotel.findById(hotel, (err, hotel) => { //check if hotel exists
      if(err) return reject(err.message);
      else if(!hotel) return reject('hotel not exists');
      console.log(`${user}, ${date}, ${time}, ${treatment}`);
      Therepist.find({hotel, appointments: {$elemMatch: {user, date, time, treatment}}},
        (err, therepists) =>{ //check if user not already ordered therepist for that treatment
        if(err) return reject(err.message);
        else if(therepists.length>0) return reject('user already ordered therepist for that treatment');
        
        Therepist.find({ //find available therepist for that treatment
            hotel,
            "schedule.int.endTime":   {$gt: time},
            "schedule.int.startTime": {$lte: time},
            "schedule.endDate":   {$gte: date},
            "schedule.startDate": {$lte: date},
            "schedule.dayOff": {$not: {$eq: date}},
            appointments:{
              $not:{
                $elemMatch:{
                  "date": {$eq: date},
                  "time": {$eq: time}
                }
              }
            }           
        }).sort({numOfApp: 1}).exec((err, therepists) => {
          console.log(therepists.length)
          if(err) return reject(err.message);
          else if(!therepists || therepists.length===0) return reject('therepist not available for that treatment');
         
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


exports.getAllTherepists = ({hotel_id}) => new Promise((resolve, reject) => {
    if(!hotel_id) return reject("hotel_id is missing");
    Hotel.findById(hotel_id, (err, hotel) => {
      if(err) return reject(err.message);
      else if(!hotel) return reject(`hotel: ${hotel_id} not exists`);
      
      Therepist.find({hotel: hotel_id}, (err, therepists) => {
        if(err) return reject(err.message);
        resolve(therepists);
      }).populate('hotel');
    });
  });

exports.removeTherepist = ({therepist_id}) => new Promise((resolve, reject) => {
  if(!therepist_id) return reject("therepist_id is missing");
  Therepist.findById(therepist_id, (err, therepist) => {
    if(err) return reject(err.message);
    else if(therepist.appointments.length !== 0) return reject("therepist to delete still have appointments");
    resolve(therepist_id);
  });
}).then((therepist_id) => new Promise((resolve, reject) => {
    Therepist.findByIdAndRemove(therepist_id, (err, therepist) => {
      if(err) return reject(err.message);
      resolve(`${therepist.name} deleted from therepists database`);
    });
  })
);


exports.removeAllTherepists = ({hotel_id}) => new Promise((resolve, reject) => {
  if (!hotel_id) return reject("hotel_id is missing");
  Therepist.find({ hotel: hotel_id }, (err, therepists) => {
    if (err) return reject(err.message);
    therepists.forEach(therepist => {
      if (therepist.numOfApp !== 0)
        return reject(`Can not delete, therepist(${therepist._id}) still have appointments.`);
    });
    resolve(`${hotel_id}`);
  });
}).then(hotel_id => new Promise((resolve, reject) => {
    Therepist.remove({ hotel: hotel_id }, (err, cb) => {
      if (err) return reject(err.message);
      resolve(`deleted all therepists from database.`);
    });
  })
);

exports.deleteAppointment = ({appointment_id}) => new Promise((resolve, reject) => {
  Therepist.findOne({ 'appointments._id': appointment_id }, (err, therepist) => {
    if (err) return reject(err.message);
    else if (!therepist || therepist.length === 0) return reject('appointment_id not exists');
    therepist.numOfApp = therepist.numOfApp - 1;
    therepist.appointments = _.filter(therepist.appointments, (appointment) => appointment.id !== appointment_id); //remove appointment_id from appointments
    therepist.save((err, therepist) => {
      if (err) return reject(err.message);
      resolve(therepist);
    });
  });
});
