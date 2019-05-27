// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// const ObjectId = Schema.Types.ObjectId;

// const OrderSchema = new Schema({
//   user: { type: String, ref: 'User', required: true },
//   meal: { type: ObjectId, ref: 'Meal', required: true },
//   Table: { type: ObjectId, ref: 'Table', required: true },
//   date: { type: Date, required: true },
//   string: {
//     date: String,
//     time: String
//   }
// }, { collation: 'orders' });

// OrderSchema.index({ user: 1, meal: 1, date: 1 }, { unique: true });

// OrderSchema.pre.save();