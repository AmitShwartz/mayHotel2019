const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const QRCode  = require('qrcode');
const Schema = mongoose.Schema;
const objectID = Schema.Types.ObjectId;


///not finished
const UserSchema = new Schema({
  _id: {
    type:String,
    required: true,
    validate(value) {
      if(!validator.isNumeric(value))
        throw new Error('ID is invalid')
    }
  },
  firstname: {
    type:String,
    required: true,
    trim: true,
    validate(value) {
      if(!validator.isAlpha(value))
        throw new Error('First name is invalid')
    }
  },
  lastname: {
    type:String,
    required: true,
    trim: true,
    validate(value) {
      if(!validator.isAlpha(value))
        throw new Error('Last name is invalid')
    }
  },
  avatar: {
    type: String,
     default:"https://www.google.com/url?sa=i&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwixoPbft6riAhXRZ1AKHS5WAVAQjRx6BAgBEAU&url=http%3A%2F%2Fwww.iconarchive.com%2Fshow%2Fpapirus-status-icons-by-papirus-team%2Favatar-default-icon.html&psig=AOvVaw1vRvWyJiMUk0hpjTwMX1pg&ust=1558452937788493"
    },
  phone: {
    type:String,
    required: true,
    trim: true,
    validate(value) {
      if(!validator.isNumeric(value))
        throw new Error('Phone is invalid')
    }
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if(!validator.isEmail(value))
        throw new Error('Email is invalid')
    } 
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8
  },
  hotel: {
    type: objectID ,
    ref : 'Hotel',
    default: null
  },
  room: {
    type: objectID,
    ref : 'Room',
    default: null
  },
  vouchers: [{
    voucher: {type: objectID,
      ref: 'Voucher',
      required: true
    },
    _id: false
  }],
  reservations: [{
    reservation: {
      type: objectID,
      ref: 'Reservation',
      required: true
    },
    _id: false
  }],
  spa: [{
    appointment: {
      type: objectID,
      ref: 'Spa',
      required: true
    },
    _id: false
  }],
  tokens: [{
    token: {type: String, required: true}
  }],
  qrcode: {type: String, default: null}
},{collection: 'users'});

UserSchema.index({email:1}, {unique: true});

UserSchema.statics.findByCredentials = async (email, password) => {

  const user = await User.findOne({email});
  if(!user) throw Error('Unable to login');

  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) throw Error('Unable to login');

  return user;
}

UserSchema.methods.generateAuthToken = async function (){
  const user = this;
  const token = jwt.sign({_id: user._id.toString()},'mayHotel2019');
  
  user.tokens = user.tokens.concat({token});
  await user.save();

  return token;
}

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
}

UserSchema.methods.listEvent = async function(reservation_id){
  const user = this;

  user.events = await user.events.concat({reservation: reservation_id});
  await user.save();
}

UserSchema.pre('save', async function (next) {
  const user = this;
  if(user.qrcode == null)
    user.qrcode = await QRCode.toDataURL(user._id);
  
  if(user.isModified('password'))
    user.password = await bcrypt.hash(user.password, 8);
  
  next();
})

const User = mongoose.model('User',UserSchema);

module.exports = User;