const _      =  require('lodash');
const Hotel       =   require('../../../schemas/hotel');
const Event        =   require('../../../schemas/event');
const {DATE_INT, TIME_INT}   =   require('../../../consts');

// not finished


exports.addEvent = async (req) => new Promise((resolve, reject) => {
    let body = _.pick(req.body, ['hotel', 'name', 'time', 'date','content','capcity','category','location']);
    if(_.size(body) !== 8) reject('hotel || name || time || date || content || category || location || capacity params are missing');
    
    body.date = DATE_INT(body.date);
    let newEvent = new Event(body);
    newEvent.save((err, event) => {
    if(err) reject(err.message);
    resolve(event);
    })
});
  
exports.removeEvent = async ({event_id}) =>  new Promise((resolve, reject) => {
    if(!event_id) reject("event_id is missing");
    Event.findByIdAndRemove(event_id,(err, cb) => {
    if(err) return reject(err.message);
    resolve(cb);
    })
});


exports.exit = async ({event_id, user_id}) => new Promise((resolve, reject) => {
    if(!user_id || !event_id) reject('user_id || event_id are missing');
    Event.find({_id: event_id, arrived: {$elemMatch: {_id: user_id}}},
        (err, event) => {
        if(err) return reject(err.message);
        else if(!event || event.length===0) return reject('user didnt enter');

        event.arrived = _.filter(event.arrived, (user) => user.id !== user_id);
        event.save((err, event) => {
            if(err) return reject(err.message);
            resolve(`${user_id} left the event`);
         })
    })
});

  
exports.enter = async ({hotel_id, user_id}) => new Promise((resolve, reject) => {
    if(!user_id || !hotel_id) reject('user_id || hotel_id are missing');

    const params = {user_id, hotel_id, today_int: DATE_INT(new Date()), time_int: TIME_INT(moment().format('HH:mm'))} 

    Meal.findOne({hotel: hotel_id, 'int.startTime': {$lte: params.time_int}, 'int.endTime': {$gte: params.time_int}}).exec((err, curr_meal) => {
    //found which meal is it according to curr_date and curr_time
    if(err) return reject(err.message);
    if(!curr_meal) return reject('meal not available right now');

    params['curr_meal'] = curr_meal;
    const ignoreOrders  =   (params.time_int>curr_meal.int.startTime+30) ? true : false; //after 30 minutes since meal started -> ignore orders. enter on base of available tables.

    try{
        if(ignoreOrders)
        return resolve(enterSpontanic(params));
        else
        return resolve(enterWithOrder(params));
    }catch(e) {
        reject(e.message);
    }
    });
});

  
  const enterWithOrder = async (params) => {
    return new Promise((reject, resolve) => {
      Table.findOne({
        'hotel': params.hotel_id,
        orders: {$elemMatch: {at: params['today_int'], meal: params.curr_meal['_id'], user: params['user_id']}},
        curr_user: null
      }).exec((err, table) => {
        //found if the user already has a valid order. (for: today, meal)
        if(err) return reject(err.message);
        if(!table) return reject('order not exists');
  
        table['curr_user'] = params['user_id'];
        table.orders = _.reject(table.orders, {at: params['today_int'], meal: params['curr_meal']['_id'], user: params['user_id']}); //remove order from table
        table.save((err, table) => { //connect table to user. in /exit the table.user will be set to null again.
          if(err) return reject(err.message);
          return resolve({table_number: table.number, status: 'open'}); //open door
        });
      })
    })
  }
  const enterSpontanic = (params) => {
    return new Promise((reject, resolve) => {
      Table.findOne({ //check if user not already sitted.
        hotel: params['hotel_id'],
        curr_user: params['user_id']
      }).exec((err, table) => {
        if(err) return reject(err.message);
        if(table) return reject(`user already sit on table: ${table.number}`);
  
        Table.find({ //check for available table
          hotel: params['hotel_id'],
          curr_user: null
        }).exec((err, tables) => {
          if(err) return reject(err.message);
          if(!tables || tables.length===0) return reject('not available spontanic table right now');
  
          let available_table = tables[0];
          available_table['curr_user'] = params['user_id'];
          available_table.save((err, table) => { //connect table to user. in /exit the table.user will be set to null again.
            if(err) return reject(err.message);
            return resolve({table_number: table.number, status: 'open'}); //open door
          });
        });
      });
    });
  }
  