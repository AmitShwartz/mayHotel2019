const User = require('../../schemas/user');
const QRCode  = require('qrcode');
const _ = require('lodash');

exports.register = ({id, firstname, lastname, phone, address}) => {
  return new Promise((resolve, reject) => {
    if(!id || !firstname || !lastname || !phone || !address)
      reject('id || firstname || lastname || phone || address params are missing');
   
    let newUser = new User({
      _id: id,
      firstname, lastname, phone, address
    });
    QRCode.toDataURL(id, function (err, url) {
      if(err) reject(err);
      newUser.QRcode = url;
    });

    newUser.save((err, user) => {
      if (err) reject(err.message);
      resolve(user);
    });
  });
}

exports.getUserByID = ({id}) => {
  return new Promise((resolve, reject) => {
    if(!id) reject('id param is missing')
    User.findById(id, (err, user)=>{
      if(err) reject(err);
      resolve(user);
    });
  });
}
//continue
exports.edit = (req) => {

}
