const router = require('express').Router();
const {resError, resSuccess} = require("../../../consts");
const ctrl = require('../../../controllers/hotel/meal');

router.put('/', async (req, res) => {
  ctrl.addMeal(req).then(meal => resSuccess(res, meal)).catch(err => resError(res, err));
});

router.delete('/', async (req, res) => {
  ctrl.removeMeal(req.body).then(cb => resSuccess(res, cb)).catch(err => resError(res, err));
});

router.delete('/all', async (req, res) => {
  ctrl.removeAllMeals(req.body).then(cb => resSuccess(res, cb)).catch(err => resError(res, err));
});


router.post('/enter', (req,res) => {
  let {user_id} = req.body;
  ctrl.enter(req.body).then(cb => resSuccess(res, cb)).catch(err => resError(res, err));
});
router.post('/exit', (req,res) => {
  let {user_id} = req.body;
  ctrl.exit(req.body).then(cb => resSuccess(res, cb)).catch(err => resError(res, err));
});



module.exports = router;
