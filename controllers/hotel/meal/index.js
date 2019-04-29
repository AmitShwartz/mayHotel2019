const _      =  require('lodash');
const moment =  require('moment');
const {DATE_INT, TIME_INT}  =   require('../../../consts');
const User       =   require('../../../schemas/user');
const Meal        =   require('../../../schemas/meal');
const Table       =   require('../../../schemas/table');

exports.addMeal = async (req) => {
  return new Promise((resolve, reject) => {
    let body = _.pick(req.body, ['hotel', 'name', 'startTime', 'endTime']);
    if(_.size(body) !== 4) reject('hotel || name || startTime || endTime params are missing');

    let newMeal = new Meal(body);
    newMeal.save((err, meal) => {
      if(err) reject(err.message);
      resolve(meal);
    })
  });
};

exports.getMeals = ({hotel_id}) => {
  return new Promise((resolve, reject) => {
    if(!hotel_id) reject('hotel_id param is missing');

    Meal.find({hotel: hotel_id}).sort('int.startTime').exec((err, meals)=>{
      if(err) return reject(err.massage);
      else if(!meals || meals.length==0) return reject(`No meals added to hotel ${hotel}`)
      resolve(meals);
    });
  });
};

exports.removeMeal = async ({meal_id}) => {
  return new Promise((resolve, reject) => {
    if(!meal_id) reject("meal_id is missing");
    Meal.findByIdAndRemove(meal_id).exec((err, cb) => {
      if(err) return reject(err.message);
      resolve(cb);
    })
  });
};

exports.removeAllMeals = async ({hotel_id}) => {
  return new Promise((resolve, reject) => {
    if(!hotel_id) reject("hotel_id is missing");
    Meal.remove({hotel: hotel_id}).exec((err, cb) => {
      if(err) return reject(err.message);
      resolve(cb);
    })
  });
};

exports.exit = async ({hotel_id, user_id}) => {
  return new Promise((resolve, reject) => {
    if(!user_id || !hotel_id) reject('user_id || hotel_id are missing');
    Table.findOne({hotel: hotel_id, curr_user: user_id}).exec((err, table) => {
      if(err) return reject(err.message);
      else if(!table || table.length===0) return reject('user didnt enter');

      if(table.counter == 1) table.curr_user = null;
      
      table.counter -= 1;
      table.save((err, table) => {
        if(err) return reject(err.message);
        resolve({table:{number: table.number, counter: table.counter, status: 'close'}});
      })
    })
  });
};

exports.enter =  ({hotel_id, user_id}) => {
  return new Promise(async (resolve, reject) => {
    if(!user_id || !hotel_id) reject('user_id || hotel_id are missing');
    const params = {user_id, hotel_id, today_int: DATE_INT(new Date()), time_int: 1220} 
   // const params = {user_id, hotel_id, today_int: DATE_INT(new Date()), time_int: TIME_INT(moment().format('HH:mm'))} 
    
    await Meal.findOne({
      hotel: hotel_id,
      'int.startTime': {$lte: params.time_int},
      'int.endTime': {$gte: params.time_int}
    }).exec(async (err, curr_meal) => { //found which meal is it according to curr_date and curr_time  
      if(err) return reject(err.message);
      else if(!curr_meal) return reject('meal not available right now');

      params['curr_meal'] = curr_meal;
      const ignoreOrders  = (params.time_int>curr_meal.int.startTime+30) ? true : false; //after 30 minutes since meal started -> ignore orders. enter on base of available tables.

      await User.findById(user_id).populate('room').exec((err,user)=>{
        if(err) return reject(err.massage);
        else if(!user) return reject(`user ${user_id} not exists`);

        params['guest_amount'] = user.room.guest_amount;

        if(ignoreOrders)
          enterSpontanic(params)
          .then(order => resolve(order))
          .catch(err=>reject(err))
        else
          enterWithOrder(params)
          .then(order => resolve(order))
          .catch(err=> reject(err))
      });
    });
  });
}

// exports.enter = async ({hotel_id, user_id}) => {
//   return new Promise((resolve, reject) => {
//     if(!user_id || !hotel_id) reject('user_id || hotel_id are missing');

//     const params = {user_id, hotel_id, today_int: DATE_INT(new Date()), time_int: TIME_INT(moment().format('HH:mm'))} 

//     Meal.findOne({hotel: hotel_id, 'int.startTime': {$lte: params.time_int}, 'int.endTime': {$gte: params.time_int}}).exec((err, curr_meal) => {
//       //found which meal is it according to curr_date and curr_time
//       if(err) return reject(err.message);
//       if(!curr_meal) return reject('meal not available right now');

//       params['curr_meal'] = curr_meal;
//       const ignoreOrders  = (params.time_int>curr_meal.int.startTime+30) ? true : false; //after 30 minutes since meal started -> ignore orders. enter on base of available tables.

//       try{
//         if(ignoreOrders)
//           return resolve(enterSpontanic(params));
//         else
//           return resolve(enterWithOrder(params));
//       }catch(e) {
//         reject(e.message);
//       }
//     });
//   });
// }

const enterWithOrder = async (params) => {
  return new Promise(async (resolve, reject) => {
    Table.findOne({
      hotel: params.hotel_id,
      $or:[{orders: {
          $elemMatch: {
            at: params.today_int,
            meal: params.curr_meal._id,
            user: params.user_id
      }}},{curr_user: params.user_id}]     
    }).exec(async (err, table) => {
      if(err) return reject(err.message);
      else if(!table) {
        Table.find({ //check for available table
          hotel: params.hotel_id,
          curr_user: null,
          sits: {$gte: params.guest_amount},
          orders:{
            $not: {
              $elemMatch: {
                at: params.today_int,
                meal: params.curr_meal._id
              }
            }
          }
        }).sort('sits').exec(async (err, tables) => {
          if(err) return reject(err.message);
          else if(!tables || tables.length===0) return reject('not available spontanic table right now');
  
          let available_table = tables[0];
          available_table.curr_user = params.user_id;
          available_table.counter += 1;
        
          available_table.save((err, table) => { //connect table to user. in /exit the table.user will be set to null again.
            if(err) return reject(err.message);
            return resolve({table:{number: table.number, counter: table.counter, status: 'open'}}); //open door
          });
        });
      }
      else if(table.counter == params.guest_amount) return reject(`teble ${table.number} reached the count limit`);
      else if(table.curr_user == null) table.curr_user = params.user_id;
      
      table.counter += 1;
     
      table.save((err, table) => { //connect table to user. in /exit the table.user will be set to null again.
        if(err) return reject(err.message);
        return resolve({table:{number: table.number, counter: table.counter, status: 'open'}}); //open door
      });
    })
  })
}

const enterSpontanic = (params) => {
  return new Promise(async (resolve, reject) => {
    console.log(params)
    await Table.findOne({ //check if user not already sitted.
      hotel: params.hotel_id,
      curr_user: params.user_id
    }).exec(async (err, table) => {
      if(err) return reject(err.message);
      else if(!table){
        Table.find({ //check for available table
          hotel: params.hotel_id,
          curr_user: null,
          sits: {$gte: params.guest_amount}
        }).sort('sits').exec(async (err, tables) => {
          if(err) return reject(err.message);
          if(!tables || tables.length===0) return reject('not available spontanic table right now');
  
          let available_table = tables[0];
          available_table.curr_user = params.user_id;
          available_table.counter += 1;
        
          available_table.save((err, table) => { //connect table to user. in /exit the table.user will be set to null again.
            if(err) return reject(err.message);
            return resolve({table:{number: table.number, counter: table.counter, status: 'open'}}); //open door
          });
        });
      }
      else if(table.counter == params.guest_amount || table.counter == table.sits) return reject(`teble ${table.number} reached the count limit`);

      table.counter += 1;
      table.save((err, table) => { //connect table to user. in /exit the table.user will be set to null again.
        if(err) return reject(err.message);
        return resolve({table:{number: table.number, counter: table.counter, status: 'open'}}); //open door
      });
    });
  });
}

// const enterSpontanic = (params) => {
//   return new Promise((resolve, reject) => {
//      Table.findOne({ //check if user not already sitted.
//       hotel: params.hotel_id,
//       curr_user: params.user_id
//     }).exec(async (err, table) => {
//       if(err) return reject(err.message);
//       if(table) return reject(`user already sit on table: ${table.number}`);

//         Table.find({ //check for available table
//         hotel: params['hotel_id'],
//         curr_user: null,
//         sits: {$gte: params['guest_amount']}
//       }).sort('sits').exec(async (err, tables) => {
//         if(err) return reject(err.message);
//         if(!tables || tables.length===0) return reject('not available spontanic table right now');

//         let available_table = tables[0];
//         available_table['curr_user'] = params['user_id'];
//         available_table.save((err, table) => { //connect table to user. in /exit the table.user will be set to null again.
//           if(err) return reject(err.message);
//           console.log(1)
//           return resolve({table_number: table.number, status: 'open'}); //open door
//         });
//       });
//     });
//   });
// }
