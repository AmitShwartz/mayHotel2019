const router = require('express').Router();
const {resError, resSuccess} = require("../../../../consts");

const ctrl = require('../../../../controllers/hotel/room/service/service');

router.post('/missing', (req,res) => {
  ctrl.addMissing(req.body)
  .then((room) => resSuccess(res, room))
  .catch(err => resError(res, err));
});

router.put('/missing', (req,res) => {
  ctrl.handleMissing(req.body)
  .then((room) => resSuccess(res, room))
  .catch(err => resError(res, err));
});

router.delete('/missing', (req,res) => {
  ctrl.completeMissing(req.body)
  .then((room) => resSuccess(res, room))
  .catch(err => resError(res, err));
});

router.post('/maintenance', (req,res) => {
  ctrl.addMaintenance(req.body)
  .then((room) => resSuccess(res, room))
  .catch(err => resError(res, err));
});

router.put('/maintenance', (req,res) => {
  ctrl.handleMaintenance(req.body)
  .then((room) => resSuccess(res, room))
  .catch(err => resError(res, err));
});

router.delete('/maintenance', (req,res) => {
  ctrl.completeMaintenance(req.body)
  .then((room) => resSuccess(res, room))
  .catch(err => resError(res, err));
});

router.post('/alarm', (req,res) => {
  ctrl.addAlarmClock(req.body)
  .then((room) => resSuccess(res, room))
  .catch(err => resError(res, err));
});
router.delete('/alarm', (req,res) => {
  ctrl.completeAlarmClock(req.body)
  .then((room) => resSuccess(res, room))
  .catch(err => resError(res, err));
});

router.post('/clean', (req,res) => {
  ctrl.addClean(req.body)
  .then((room) => resSuccess(res, room))
  .catch(err => resError(res, err));
});

router.put('/clean', (req,res) => {
  ctrl.handleClean(req.body)
  .then((room) => resSuccess(res, room))
  .catch(err => resError(res, err));
});

router.delete('/clean', (req,res) => {
  ctrl.completeClean(req.body)
  .then((room) => resSuccess(res, room))
  .catch(err => resError(res, err));
});

router.get('/:hotel_id', (req,res) => {
  ctrl.getOpenCalls(req.params)
  .then((calls) => resSuccess(res, calls))
  .catch(err => resError(res, err));
});
// get all ordered services (for employee to see all service calls that occupid)


module.exports = router;
