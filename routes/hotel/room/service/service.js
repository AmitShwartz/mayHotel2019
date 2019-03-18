const router = require('express').Router();
const mongoose = require('mongoose');
const {resError, resSuccess} = require("../../../../consts");

const ctrl = require('../../../../controllers/hotel/room/service/service');

router.put('/missing', (req,res) => {
  ctrl.addMissing(req).then((room) => resSuccess(res, room)).catch(err => resError(res, err));
});
router.delete('/missing', (req,res) => {
  ctrl.completeMissing(req).then((room) => resSuccess(res, room)).catch(err => resError(res, err));
});

router.put('/maintenance', (req,res) => {
  ctrl.addMaintenance(req).then((room) => resSuccess(res, room)).catch(err => resError(res, err));
});
router.delete('/maintenance', (req,res) => {
  ctrl.completeMaintenance(req).then((room) => resSuccess(res, room)).catch(err => resError(res, err));
});

router.put('/alarmClock', (req,res) => {
  ctrl.addAlarmClock(req).then((room) => resSuccess(res, room)).catch(err => resError(res, err));
});
router.delete('/alarmClock', (req,res) => {
  ctrl.completeAlarmClock(req).then((room) => resSuccess(res, room)).catch(err => resError(res, err));
});

router.put('/setCleanable', (req,res) => {
  ctrl.setCleanable(req).then((room) => resSuccess(res, room)).catch(err => resError(res, err));
});


module.exports = router;
