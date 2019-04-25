const router = require('express').Router();
const {resError, resSuccess} = require("../../../consts");
const ctrl = require('../../../controllers/hotel/event');

//add event
router.put('/', async (req, res) => {
    ctrl.addEvent(req)
    .then(event => resSuccess(res, event))
    .catch(err => resError(res, err));
  });
  //delete event
  router.delete('/', async (req, res) => {
    ctrl.removeEvent(req.body)
    .then(cb => resSuccess(res, cb))
    .catch(err => resError(res, err));
  });
  //edit event
  router.patch('/all', async (req, res) => {
    ctrl.editEvent(req.body)
    .then(cb => resSuccess(res, cb))
    .catch(err => resError(res, err));
  });
//get event
  router.post('/', (req,res) => {
    ctrl.getEvent(req.body)
    .then(cb => resSuccess(res, cb))
    .catch(err => resError(res, err));
  });
//get all events by category
  router.post('/category', (req,res) => {
    ctrl.getByCategory(req.body)
    .then(cb => resSuccess(res, cb))
    .catch(err => resError(res, err));
  });
//get all events
  router.post('/all', (req,res) => {
    ctrl.getAllEvents(req.body)
    .then(cb => resSuccess(res, cb))
    .catch(err => resError(res, err));
  });
//reservation
  router.put('/reservation', async (req, res) => {
  ctrl.addReservation(req.body)
  .then(reservation => resSuccess(res, reservation))
  .catch(err => resError(res, err));
});
//delete reservation
router.delete('/reservation', async (req, res) => {
  ctrl.deleteReservation(req.body)
  .then(cb => resSuccess(res, cb))
  .catch((err) => resError(res, err));
});
 //enter(spontanic && ordered) 
  router.post('/enter', (req,res) => {
    ctrl.enter(req.body)
    .then(cb => resSuccess(res, cb))
    .catch(err => resError(res, err));
  });
  //exit
  router.post('/exit', (req,res) => {
    ctrl.exit(req.body)
    .then(cb => resSuccess(res, cb))
    .catch(err => resError(res, err));
  });

  module.exports = router;