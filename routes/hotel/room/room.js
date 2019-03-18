const router = require('express').Router();
const mongoose = require('mongoose');
const router_roomService = require('./service/service');
const {resError, resSuccess} = require("../../../consts");

const ctrl = require('../../../controllers/hotel/room/room');

router.use('/service', router_roomService);

router.post('/checkOut', (req,res) => {
  ctrl.checkOut(req).then(room => resSuccess(res, room)).catch(err => resError(res, err));
});

router.post('/checkIn', (req,res) => {
  ctrl.checkIn(req).then(room => resSuccess(res, room)).catch(err => resError(res, err));
});

router.post('/getRoom', (req,res) => {
  ctrl.getRoom(req).then(room => resSuccess(res, room)).catch(err => resError(res, err));
});

module.exports = router;
