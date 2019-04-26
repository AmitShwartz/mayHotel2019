const User = require('../../schemas/user');
const QRCode  = require('qrcode');
const _ = require('lodash');

exports.register = async ({user_id, firstname, lastname, phone, address}) => {
  return new Promise((resolve, reject) => {
    if(!user_id || !firstname || !lastname || !phone || !address)
      reject('user_id || firstname || lastname || phone || address params are missing');
   
    let newUser = new User({
      _id: user_id,
      firstname, lastname, phone, address, 
    });
    
    QRCode.toDataURL(user_id, function (err, url) {
      if(err) reject(err);
      newUser.QRcode = url;
    });

    newUser.save((err, user) => {
      if (err) reject(err.message);
      resolve(user);
    });
  })
}

exports.getUserByID = ({user_id}) => {
  return new Promise((resolve, reject) => {
    if(!user_id) reject('user_id param is missing')
    User.findById(user_id ).populate('room').exec((err, user)=>{
      if(err) reject(err);
      resolve(user);
    });
  });
}

//continue
exports.edit = async (body) => {
  return new Promise((resolve, reject) => {
    if(!body.user_id) reject('user_id param is missing')
    toUpdate = _.pick(body,['phone' , 'address'])
    User.findByIdAndUpdate(body.user_id, toUpdate, (err, user)=>{
      if(err) reject(err);
      resolve(`User (id: ${user._id}) updated.`);
    });
  });
}
