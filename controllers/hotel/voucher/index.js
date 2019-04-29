const Voucher = require('../../../schemas/voucher');
const {DATE_INT} = require('../../../consts');
const User = require('../../../schemas/user');
const _ = require('lodash');

exports.addVoucher = ({user, meal, date_of_use, value}) =>{ 
    return new Promise((resolve, reject) =>{
        if(!user|| !meal|| !date_of_use || !value) return reject('user|| meal|| date_of_use || value params are missing');

        Voucher.findOne({user, meal, date_of_use}, async (err, voucher) =>{
            if(err) return reject(err);
            else if(voucher) return reject('voucher already given for that meal');
            let newVoucher = new Voucher({user, meal, date_of_use, value});
            newVoucher.save((err, voucher)=>{
                if(err) return reject(err.massage);
                User.findByIdAndUpdate(user,{$push: {vouchers: {voucher_id: voucher.id}}}, err =>{
                    if(err) return reject(err);
                    console.log(3)
                    resolve(voucher);
                })  
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
            else if(!user) return reject(`user ${user} not exist`);
            resolve(user.vouchers);
        })
    });
}

exports.completeVoucher = ({voucher_id}) =>{ 
    return new Promise((resolve, reject) =>{
        if(!voucher_id) return reject('voucher param is missing');
        let date_of_use = DATE_INT(new Date());
        console.log(date_of_use)
        
        Voucher.findOneAndDelete({_id:voucher_id, date_of_use}, async (err, voucher) =>{
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