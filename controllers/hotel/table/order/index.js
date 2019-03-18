const _ = require('lodash');
const moment = require('moment');
const {DATE_INT}   =   require('../../../../consts');

const Hotel   =   require('../../../../schemas/hotel');
const Meal    =   require('../../../../schemas/meal');
const Table   =   require('../../../../schemas/table');

exports.addOrder = async ({meal, user, date, sits}) => {
  return new Promise((resolve, reject) => {
    const at    =   DATE_INT(new Date(date));
    const today =   DATE_INT(new Date());

    if(!meal || !user || !date || !sits)
      reject('user || meal || date || sits params are missing');
    if(at < today)
      reject('date illegal. already passed');

    Meal.findById(meal).exec((err, meal) => { //check if meal exists
      if(err)   return reject(err.message);
      if(!meal) return reject('meal not exists');
      const hotel = meal.hotel;

      Table.find({hotel, orders: {$elemMatch: {meal,user,at}}})
       .exec((err, tables) =>{ //check if user not already ordered table for that meal
        if(err)     return reject(err.message);
        if(tables.length>0)  return reject('user already ordered table for that meal');

        Table.find({ //find available table for that meal
          hotel,
          orders: { //find all table.orders NOT CONTAINS: {meal,at}
            $not: {
              $elemMatch: {
                meal,
                at
              }
            }
          },
          sits: {$gte: sits}
        }).sort('sits').exec((err, tables) => {
          if(err) return reject(err.message);
          if(!tables || tables.length===0) return reject('table not available for that meal');

          let newOrder = {user, meal, at};
          let availableTable = tables[0];

          availableTable.orders.push(newOrder);
          availableTable.save((err, availableTable) => {
             if(err) return reject(err.message);
             resolve({
               order_id:_.last(availableTable.orders)._id,
               number: availableTable.number
             });
          });
        })
      });
    })
  }); //promise end
};

exports.deleteOrder = async ({order_id}) => {
  return new Promise((resolve, reject) => {
    Table.findOne({'orders._id': order_id}).exec((err,table) => {
      if(err) return reject(err.message);
      if(!table || table.length===0) return reject('order_id not exists');

      table.orders = _.filter(table.orders, (order) => order.id!==order_id); //remove order_id from orders
      table.save((err, table) => {
        if(err) return reject(err.message);
        resolve();
      })
    })
  }); //end promise
};
