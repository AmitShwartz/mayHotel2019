const router = require('express').Router();
const {resError, resSuccess} = require("../../../consts");
const router_order = require('./order');
const ctrl = require('../../../controllers/hotel/table/table');

router.use('/order', router_order);

router.put('/', (req, res) => {
  ctrl.addTable(req).then((table) => resSuccess(res, table)).catch(err => resError(res, err));
});

router.get('/:table_id', (req, res) => {
  ctrl.getTable(req).then((table) => resSuccess(res, table)).catch(err => resError(res, err));
});

router.patch('/', (req, res) => {
  ctrl.editTable(req).then(table => resSuccess(res, table)).catch(err => resError(res, err));
});

router.delete('/', (req, res) => {
  ctrl.deleteTable(req).then(table => resSuccess(res, table)).catch(err => resError(res, err));
});

router.delete("/clearOrders", (req,res) => {
  ctrl.clearOrders(req.body).then(table => resSuccess(res, table)).catch(err => resError(res, err));
})


module.exports = router;
