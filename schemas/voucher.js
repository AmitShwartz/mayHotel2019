const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectID = Schema.Types.ObjectId;
const Meal = require('./meal');
const User = require('./user');

const VoucherSchema = new Schema({
    user: {type: String, ref:'User', required: true},
    meal: {type: objectID, ref:'Meal', required: true},
    date_of_use: {type: Number, required: true},//INT -> YYYYMMDD
    value: {type: String, required:true}
  },{collection: 'vouchers'});

VoucherSchema.index({ user: 1, meal: 1, date_of_use: 1}, { unique: true }); //(user, meal, date_of_use) = unique key

VoucherSchema.pre('save', function(next){
  User.findById(this.user).exec((err, user) => {
    if(err) next(err);
    else if(!user) next(new Error("user_id not exists"));
    
    Meal.findById(this.meal).exec((err, meal) => {
      if(err) next(err);
      else if(!meal) next(new Error("meal_id not exists"));
      next();
    })
  })
});

module.exports = mongoose.model('Voucher',VoucherSchema);