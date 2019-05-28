const router = require('express').Router();
const {resError, resSuccess} = require("../../../consts");
const ctrl = require('../../../controllers/hotel/meal');
const orderRouter = require('../table/order/index')
const hotelAuth = require('../../../middleware/hotelAuth')

router.use('/orders', orderRouter);

router.post('/', hotelAuth,ctrl.addMeal);

router.get('/:hotel_id', ctrl.getMeals);

router.delete('/:meal_id', ctrl.removeMeal);

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
