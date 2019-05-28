const router = require('express').Router();
const { resError, resSuccess } = require("../../../../consts");
const ctrl = require('../../../../controllers/hotel/table/order');
const router_voucher = require('../../voucher');
const auth = require('../../../../middleware/auth')
const hotelAuth = require('../../../../middleware/hotelAuth')

router.use('/vouchers', router_voucher);

router.post('/', auth, ctrl.addOrder);

router.delete('/:order_id', auth, ctrl.deleteOrder);

router.get('/', hotelAuth, ctrl.getAllOrders);

// router.post('/', async (req, res) => { //add Meal Order
//   ctrl.addOrder(req.body).then(order => resSuccess(res, order)).catch(err => resError(res, err));
// });

// router.delete('/', async (req, res) => { 
//   ctrl.deleteOrder(req.body).then(order => resSuccess(res, order)).catch(err => resError(res, err));
// });

module.exports = router;
