const router = require('express').Router();
const {resError, resSuccess} = require("../../../consts");
const ctrl = require('../../../controllers/hotel/schedule/schedule');

// router.get('/:hotel_id/:day', (req, res) => {
//   ctrl.getScehduleByDay(req).then(hotel => resSuccess(res, hotel)).catch(err => resError(res, err));
// });

router.post('/', (req,res) => { // PUT /hotel/scehdule
  ctrl.addSchedule(req.body).then(hotel => resSuccess(res, hotel)).catch(err => resError(res, err));
});

router.post('/spa', (req,res) => { // PUT /hotel/scehdule
  ctrl.addSpaSchedule(req.body).then(hotel => resSuccess(res, hotel)).catch(err => resError(res, err));
});

router.post('/event', (req,res) => { // PUT /hotel/scehdule
  ctrl.addEventSchedule(req.body).then(hotel => resSuccess(res, hotel)).catch(err => resError(res, err));
});

router.put('/spa/add', (req,res) => { // PUT /hotel/scehdule
  ctrl.addAppointment(req.body).then(hotel => resSuccess(res, hotel)).catch(err => resError(res, err));
});

router.put('/spa/cancel', (req,res) => { // PUT /hotel/scehdule
  ctrl.cancelAppointment(req.body).then(hotel => resSuccess(res, hotel)).catch(err => resError(res, err));
});

router.get('/:hotel', (req,res) => { // PUT /hotel/scehdule
  ctrl.getScheduleByHotel(req.params).then(hotel => resSuccess(res, hotel)).catch(err => resError(res, err));
});

router.get('/spa/:hotel', (req,res) => { 
  ctrl.getSpaAvailable(req.params).then(hotel => resSuccess(res, hotel)).catch(err => resError(res, err));
});

router.get('/spa/by_date/:hotel/:date', (req,res) => { 
  ctrl.getSpaAvailableByDate(req.params).then(hotel => resSuccess(res, hotel)).catch(err => resError(res, err));
});


router.delete('/', (req, res) => {
  ctrl.deletePast().then(cb => resSuccess(res, cb)).catch(err => resError(res, err));
});


router.get('/me/:hotel_id/:schedule_id',(req,res) => {
  ctrl.getSchedule(req).then(schedule => resSuccess(res, schedule)).catch(err => resError(res, err));
});

module.exports = router;
