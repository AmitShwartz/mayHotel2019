const router = require('express').Router();
const router_roomService = require('./service/service');
const {resError, resSuccess} = require("../../../consts");

const ctrl = require('../../../controllers/hotel/room/room');

router.use('/services', router_roomService);

router.post('/', (req,res) => {
  ctrl.addRooms(req.body)
  .then(str => resSuccess(res, str))
  .catch(err => resError(res, err));
});

router.get('/all/:hotel_id', (req,res) => {
  ctrl.getAllRooms(req.params)
  .then(rooms => resSuccess(res, rooms))
  .catch(err => resError(res, err));
});

router.get('/available/:hotel_id', (req,res) => {
  ctrl.getAvailableRooms(req.params)
  .then(rooms => resSuccess(res, rooms))
  .catch(err => resError(res, err));
});

router.get('/:room_id', (req,res) => {
  ctrl.getRoom(req.params)
  .then(room => resSuccess(res, room))
  .catch(err => resError(res, err));
});

router.post('/checkOut', (req,res) => {
  ctrl.checkOut(req.body)
  .then(room => resSuccess(res, room))
  .catch(err => resError(res, err));
});

router.post('/checkIn', (req,res) => {
  ctrl.checkIn(req.body)
  .then(room => resSuccess(res, room))
  .catch(err => resError(res, err));
});

// edit room

module.exports = router;
