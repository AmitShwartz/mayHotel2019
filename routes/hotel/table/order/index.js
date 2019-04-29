const router = require('express').Router();
const {resError, resSuccess} = require("../../../../consts");
const ctrl = require('../../../../controllers/hotel/table/order');
const router_voucher = require('../../voucher');

router.use('/vouchers', router_voucher);

router.post('/', async (req, res) => { //add Meal Order
  ctrl.addOrder(req.body).then(order => resSuccess(res, order)).catch(err => resError(res, err));
});

router.delete('/', async (req, res) => { 
  ctrl.deleteOrder(req.body).then(order => resSuccess(res, order)).catch(err => resError(res, err));
});

module.exports = router;
