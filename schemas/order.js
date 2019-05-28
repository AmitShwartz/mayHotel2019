const mongoose = require('mongoose');
const QRCode = require('qrcode');
const moment = require('moment-timezone')
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


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

OrderSchema.statics.createOrder = async function (user, meal, date, tables, amount) {
  const existingOrder = await Order.find({
    meal: meal._id,
    user: user._id,
    date
  });

  if (existingOrder.length > 0) {
    total = 0;
    await existingOrder.forEach(order => {
      total += order.amount;
    })
    const diff = user.room.guest_amount - total;
    if (diff == 0) throw new Error(`The guest reached maximum orders capacity`);
    else if (amount > diff) throw new Error(`User ${user._id} can save only ${diff} seats`);
  }

  tables = await tables.filter(async(table) => {
    await table.orders.forEach(order => {
      if (order.order.meal.toString() == meal._id.toString() && order.order.date.toString() == date.toString()){
        console.log(false)
        return false;
      }
    });
    return true
  });
  console.log(tables)
  if(tables.length ===0) return { voucher: { meal_id, date, user_id: user._id } };

  const newOrder = new Order({
    meal: meal._id,
    user: user._id,
    table: tables[0]._id,
    date,
    amount
  });
  await newOrder.save();

  tables[0].orders = await tables[0].orders.concat({ order: newOrder._id });
  await tables[0].save();

  user.orders = await user.orders.concat({ order: newOrder._id });
  await user.save();

  return newOrder;
}

OrderSchema.statics.removeOrder = async (user, table, order_id) => {
  const order = await Order.findById(order_id);

  user.orders = await user.orders.filter(order => order.toString() == order_id.toString())
  await user.save();

  table.orders = await table.orders.filter(order => order.toString() == order_id.toString())
  await table.save();

  const deleted = await order.remove();
  return deleted;
}

OrderSchema.pre('save', async function (next) {
  const order = this;

  if (order.isModified('date')) {
    order.string.date = await moment(order.date).format('DD/MM/YYYY');
  }
  order.qrcode = await QRCode.toDataURL(order._id.toString());
  next()
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;