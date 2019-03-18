const router = require('express').Router();
const {resError, resSuccess} = require("../../../consts");
const ctrl = require('../../../controllers/hotel/therepist');

router.put('/', async (req, res) => {
  ctrl.addTherepist(req)
  .then(therepist => resSuccess(res, therepist))
  .catch(err => resError(res, err));
});

router.put('/appointment', async (req, res) => {
  ctrl.addAppointment(req.body)
  .then(appointment => resSuccess(res, appointment))
  .catch(err => resError(res, err));
});

router.delete('/appointment', async (req, res) => {
  ctrl.deleteAppointment(req.body)
  .then(cb => resSuccess(res, cb))
  .catch((err) => resError(res, err));
});

router.post('/', (req,res) => {
  ctrl.getAllTherepists(req)
  .then(therepists => resSuccess(res, therepists))
  .catch(err => resError(res, err));
});

router.delete('/', async (req, res) => {
  ctrl.findAndCheck(req.body)
  .then(id => ctrl.removeTherepist(id))
  .then(therepist => resSuccess(res, therepist))
  .catch(e => resError(res, e));
});

router.delete('/all', async (req, res) => {
  ctrl.removeAllTherepists(req.body)
  .then(cb => resSuccess(res, cb))
  .catch(err => resError(res, err));
});

module.exports = router;