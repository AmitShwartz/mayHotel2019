const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectID = Schema.Types.ObjectId;
const Meal = require('./meal');
const User = require('./user');

const VoucherSchema = new Schema({
    user_id: {type: String, ref:'User', required: true},
    meal_id: {type: objectID, ref:'Meal', required: true},
    date: {type: Number, required: true},//INT -> YYYYMMDD
    value: {type: String, required:true},
    qrcode: String
  },{collection: 'vouchers'});

VoucherSchema.index({ user_id: 1, meal_id: 1, date: 1}, { unique: true }); //(user, meal, date) = unique key

VoucherSchema.pre('save', function(next){
  User.findById(this.user_id).exec((err, user) => {
    if(err) next(err);
    else if(!user) next(new Error("user_id not exists"));
    
    Meal.findById(this.meal_id).exec((err, meal) => {
      if(err) next(err);
      else if(!meal) next(new Error("meal_id not exists"));
      next();
    })
  })
});

module.exports = mongoose.model('Voucher',VoucherSchema);