const mongoose = require('mongoose');
const QRCode = require('qrcode');
const _ = require('lodash');
const moment = require('moment-timezone')
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const { DATE_INT } = require('../consts')


const OrderSchema = new Schema({
  user: { type: String, ref: 'User', required: true },
  meal: { type: ObjectId, ref: 'Meal', required: true },
  table: { type: ObjectId, ref: 'Table', required: true },
  date: { type: Date, required: true },
  string: {
    date: String,
    time: String
  },
  amount: { type: Number, required: true, min: [1, 'at least 1 seat'] },
  counter: { type: Number, default: 0, min: [0, 'at least 0 seats taken'] },
  qrcode: String
}, { collation: 'orders' });

OrderSchema.index({ user: 1, meal: 1, date: 1 }, { unique: true });

findTable = async (tables, meal_id, date) => {
  var flag = true
  for (let i = 0; i < tables.length; i++) {
    for (let j = 0; j < tables[i].orders.length; j++) {
      if(tables[i].orders[j].order==null) continue;
      if (tables[i].orders[j].order.meal.toString() === meal_id && tables[i].orders[j].order.date.toString() === date.toString()) {
        flag = false;
      }
    }
    if (flag) {
      return tables[i];
    }
    flag = true;
  }
  console.log('1')
  return null;
}

OrderSchema.statics.createOrder = async function (user, meal_id, date, tables, amount) {
  const existingOrders = await Order.find({
    meal: meal_id,
    user: user._id,
    date
  });

  if (existingOrders.length > 0) {
    total = 0;
    await existingOrders.forEach(order => {
      total += order.amount;
    })
    const diff = user.room.guest_amount - total;
    if (diff == 0) throw new Error(`The guest reached maximum orders capacity`);
    else if (amount > diff) throw new Error(`User ${user._id} can save only ${diff} seats`);
  }
  console.log('2')
  tableToOrder = await findTable(tables, meal_id, date);
  if (tableToOrder == null) return null;

  const newOrder = new Order({
    meal: meal_id,
    user: user._id,
    table: tableToOrder._id,
    date,
    amount
  });
  await newOrder.save();

  tableToOrder.orders = await tableToOrder.orders.concat({ order: newOrder._id });
  await tableToOrder.save();

  user.orders = await user.orders.concat({ order: newOrder._id });
  await user.save();

  return newOrder;
}

OrderSchema.statics.removeOrder = async (user, table, order_id) => {
  const order = await Order.findById(order_id);

  user.orders = await user.orders.filter(order => order.order.toString() !== order_id.toString())
  await user.save();

  table.orders = await table.orders.filter(order => order.order.toString() !== order_id.toString())
  await table.save();

  const deleted = await order.remove();
  return deleted;
}

OrderSchema.pre('save', async function (next) {
  const order = this;

  if (order.isModified('date')) {
    order.string.date = await moment.utc(order.date).format('DD/MM/YYYY');
  }
  order.qrcode = await QRCode.toDataURL(order._id.toString());
  next()
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;