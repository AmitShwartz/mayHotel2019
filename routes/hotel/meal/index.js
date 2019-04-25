const router = require('express').Router();
const {resError, resSuccess} = require("../../../consts");
const ctrl = require('../../../controllers/hotel/meal');

router.post('/', async (req, res) => {
  ctrl.addMeal(req)
  .then(meal => resSuccess(res, meal))
  .catch(err => resError(res, err));
});

router.delete('/', async (req, res) => {
  ctrl.removeMeal(req.body)
  .then(cb => resSuccess(res, cb))
  .catch(err => resError(res, err));
});

router.delete('/all', async (req, res) => {
  ctrl.removeAllMeals(req.body)
  .then(cb => resSuccess(res, cb))
  .catch(err => resError(res, err));
});


router.post('/enter', (req,res) => {
  ctrl.enter(req.body)
  .then(cb => resSuccess(res, cb))
  .catch(err => resError(res, err));
});
router.post('/exit', (req,res) => {
  ctrl.exit(req.body)
  .then(cb => resSuccess(res, cb))
  .catch(err => resError(res, err));
});

//get all orders for next meal by hotel(return a list of all orders in specific hotel to the nearest meal by date)



module.exports = router;
