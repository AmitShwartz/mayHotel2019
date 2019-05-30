const router = require('express').Router();
const serviceRouter = require('./service/service');
const {resError, resSuccess} = require("../../../consts");
const hotelAuth = require('../../../middleware/hotelAuth')

const ctrl = require('../../../controllers/hotel/room/room');

router.use('/services', serviceRouter);

router.post('/',hotelAuth, ctrl.addRooms);
router.post('/checkIn',hotelAuth,  ctrl.checkIn);

router.get('/all',hotelAuth, ctrl.getAllRooms);
router.get('/available',hotelAuth,ctrl.getAvailableRooms)
router.get('/:room_id', ctrl.getRoom);

router.delete('/checkOut/:room_id',hotelAuth, ctrl.checkOut);


// edit room

module.exports = router;
