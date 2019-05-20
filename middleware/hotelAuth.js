const jwt = require('jsonwebtoken');
const Hotel = require('../schemas/hotel');

const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token,'mayHotel2019');
  
        const hotel = await Hotel.findOne({_id: decoded._id, token});

        if(!hotel) throw new Error ();

        req.token = token;
        req.hotel = hotel;
        next();
    }catch(err){
        res.status(401).send({error: 'Please authenticate.'});
    }
}

module.exports = auth;