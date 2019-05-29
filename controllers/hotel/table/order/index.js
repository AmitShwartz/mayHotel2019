const { DATE_INT, resError, resSuccess } = require('../../../../consts');
const moment = require('moment-timezone');
const Meal = require('../../../../schemas/meal');
const Table = require('../../../../schemas/table');
const Order = require('../../../../schemas/order');

exports.addOrder = async (req, res) => {
  try {
    const { meal_id, amount } = req.body;
    const date = new Date(req.body.date)
    const user = await req.user.populate('room').execPopulate();

    if (user.room.guest_amount < amount || amount <= 0) throw Error('Invalid amount.');

    const meal = await Meal.findById(meal_id);
    if (!meal) throw new Error('invalid meal');
    console.log(meal)
    var tables = await Table.find({
      hotel: user.hotel,
      seats: { $gte: amount }
    }).populate('orders.order').sort('seats');

    let order = await Order.createOrder(user, meal_id, date, tables, amount);
    if (order !== null) await order.populate('table meal').execPopulate();
    else order = { voucher: { meal_id: meal._id, date: DATE_INT(date), user_id: user._id } }
    resSuccess(res, order);
  } catch (err) {
    resError(res, err.message);
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const table = await Table.findOne({ 'orders.order': order_id });
    if (!table) throw new Error('order not exist');
    const deleted = await Order.removeOrder(req.user, table, order_id)

    resSuccess(res, deleted);
  } catch (err) {
    resError(res, err.message);
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    let tables = await Table.find({ hotel: req.hotel._id }).populate('orders.order');
    if (tables.length === 0) resSuccess(res, orders);

    resSuccess(res, tables);
  } catch (err) {
    resError(res, err.message);
  }
}


// const _ = require('lodash');
// const moment = require('moment');
// const {DATE_INT}   =   require('../../../../consts');

// const User   =   require('../../../../schemas/user');
// const Meal    =   require('../../../../schemas/meal');
// const Table   =   require('../../../../schemas/table');

// exports.addOrder = ({meal, user, date, seats}) => {
//   return new Promise(async (resolve, reject) => {
//     if(!meal || !user || !date || !seats)
//       reject('user || meal || date || seats params are missing');

//     const at    =   DATE_INT(new Date(date));
//     const today =   DATE_INT(new Date());
//     if(at < today)
//       reject('date illegal. already passed');

//     Meal.findById(meal).exec(async (err, meal) => { //check if meal exists
//       if(err)   return reject(err.message);
//       else if(!meal) return reject('meal not exists');
//       const hotel = meal.hotel;

//       await User.findById(user).populate('room')
//       .then(check =>{
//         if(!check) return reject('user not exists');
//         else if(check.room == null) return reject('user not a guest in hotel ');
//         else if(`${check.room.hotel}` !== `${hotel}`) return reject('user not a guest in hotel ');
//       }).catch(err => {if(err) return reject(err.message)})

//       Table.find({hotel, orders: {$elemMatch: {meal,user,at}}})
//        .exec((err, tables) =>{ //check if user not already ordered table for that meal
//         if(err)     return reject(err.message);
//         else if(tables.length>0)  return reject('user already ordered table for that meal');

//         Table.find({ //find available table for that meal
//           hotel,
//           orders: { //find all table.orders NOT CONTAINS: {meal,at}
//             $not: {
//               $elemMatch: {
//                 meal,
//                 at
//               }
//             }
//           },
//           seats: {$gte: seats}
//         }).sort('seats').exec((err, tables) => {
//           if(err) return reject(err.message);
//           //static function add user to coupon list
//           else if(!tables || tables.length===0) return resolve({'meal_id':meal.id,'user_id': user, 'date': at});

//           let newOrder = {user, meal, at};
//           let availableTable = tables[0];

//           availableTable.orders.push(newOrder);
//           availableTable.save((err, availableTable) => {
//              if(err) return reject(err.message);
//              resolve({
//                order_id:_.last(availableTable.orders)._id,
//                number: availableTable.number
//              });
//           });
//         })
//       });
//     })
//   }); //promise end
// };

// exports.deleteOrder = async ({order_id}) => {
//   return new Promise((resolve, reject) => {
//     Table.findOne({'orders._id': order_id}).exec((err,table) => {
//       if(err) return reject(err.message);
//       if(!table || table.length===0) return reject('order_id not exists');

//       table.orders = _.filter(table.orders, (order) => order.id!==order_id); //remove order_id from orders
//       table.save((err, table) => {
//         if(err) return reject(err.message);
//         resolve();
//       })
//     })
//   }); //end promise
// };
