const router = require('express').Router();
const {resError, resSuccess} = require("../../../consts");
const ctrl = require('../../../controllers/hotel/schedule/schedule');

router.get('/:hotel_id/:day', (req, res) => {
  ctrl.getScehduleByDay(req).then(hotel => resSuccess(res, hotel)).catch(err => resError(res, err));
});

router.put('/', (req,res) => { // PUT /hotel/scehdule
  ctrl.addScheduleItem(req).then(hotel => resSuccess(res, hotel)).catch(err => resError(res, err));
});

router.patch('/', (req, res) => {
  ctrl.editSchedule(req).then(cb => resSuccess(res, cb)).catch(err => resError(res, err));
});

router.delete('/', (req, res) => {
  ctrl.deleteSchedule(req).then(cb => resSuccess(res, cb)).catch(err => resError(res, err));
});

router.get('/me/:hotel_id/:schedule_id',(req,res) => {
  ctrl.getSchedule(req).then(schedule => resSuccess(res, schedule)).catch(err => resError(res, err));
});

module.exports = router;
