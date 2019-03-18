const router = require('express').Router();
const {resError, resSuccess} = require("../../../../consts");
const ctrl = require('../../../../controllers/hotel/table/order');

router.put('/', async (req, res) => { //add Meal Order
  ctrl.addOrder(req.body).then(order => resSuccess(res, order)).catch(err => resError(res, err));
});

router.delete('/:order_id', async (req, res) => { //add Meal Order
  ctrl.deleteOrder(req.params).then(order => resSuccess(res, order)).catch(err => resError(res, err));
});

module.exports = router;
