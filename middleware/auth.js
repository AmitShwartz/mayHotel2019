const jwt = require('jsonwebtoken');
const User = require('../schemas/user');

const auth = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token,'mayHotel2019');
  
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token}).populate('room').execPopulate();

        if(!user) throw new Error ();

        req.token = token;
        req.user = user;
        next();
    }catch(err){
        res.status(401).send({error: 'Please authenticate.'});
    }
}

module.exports = auth;