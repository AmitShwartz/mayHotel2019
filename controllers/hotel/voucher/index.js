const mongoose = require('mongoose');
const ObjectId =  mongoose.Types.ObjectId;
const QRCode  = require('qrcode');
const Voucher = require('../../../schemas/voucher');
const {DATE_INT} = require('../../../consts');
const User = require('../../../schemas/user');
const _ = require('lodash');

exports.addVoucher = ({user_id, meal_id, date, value}) =>{ 
    return new Promise((resolve, reject) =>{
        if(!user_id|| !meal_id|| !date || !value) return reject('user_id|| meal_id|| date || value params are missing');

        Voucher.findOne({user_id, meal_id, date}, async (err, voucher) =>{
            if(err) return reject(err);
            else if(voucher) return reject('voucher already given for that meal_id');

            let _id = new ObjectId();
            let newVoucher = new Voucher({_id, user_id, meal_id, date, value});

            QRCode.toDataURL(`${_id}`, function (err, url) {
                if(err) reject(err);
                newVoucher.qrcode = url;

                newVoucher.save((err, voucher)=>{
                    if(err) return reject(err.massage);
                    User.findByIdAndUpdate(user_id,{$push: {vouchers: {voucher_id: voucher.id}}}, err =>{
                        if(err) return reject(err);
                        resolve(voucher);
                    })
               }); 
            }) 
        })
    });
}

exports.getVouchersByUser = ({user_id}) =>{ 
    return new Promise((resolve, reject) =>{
        if(!user_id) return reject('user param is missing');
        console.log(user_id)
        User.findById(user_id).populate('Voucher').exec((err, user) =>{
            if(err) return reject(err);
            else if(!user) return reject(`user ${user_id} not exist`);
            resolve(user.vouchers);
        })
    });
}

exports.completeVoucher = ({voucher_id}) =>{ 
    return new Promise((resolve, reject) =>{
        if(!voucher_id) return reject('voucher param is missing');
        let date = DATE_INT(new Date());
        
        Voucher.findOneAndDelete({_id:voucher_id, date}, async (err, voucher) =>{
            if(err) return reject(err);
            else if(!voucher) return reject('voucher not valid');
                
            User.findOneAndUpdate({'vouchers':{$elemMatch:{voucher_id}}},
            {$pull:{'vouchers':{voucher_id}}},
            (err, user)=>{
             if(err) return reject(err.message);
             else if(!user) return reject("voucher not found in user");
             return resolve({deleted: true, voucher_id});
            })
        })
    });
}