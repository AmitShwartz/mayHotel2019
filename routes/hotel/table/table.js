const router = require('express').Router();
const {resError, resSuccess} = require("../../../consts");
const router_order = require('./order');
const ctrl = require('../../../controllers/hotel/table/table');

router.use('/orders', router_order);

router.post('/', (req, res) => {
  ctrl.addTable(req.body)
  .then((table) => resSuccess(res, table))
  .catch(err => resError(res, err));
});

router.get('/:table_id', (req, res) => {
  ctrl.getTable(req.params)
  .then((table) => resSuccess(res, table))
  .catch(err => resError(res, err));
});

router.get('/all/:hotel_id', (req,res) => {
  ctrl.getAllTables(req.params)
  .then(tables => resSuccess(res, tables))
  .catch(err => resError(res, err));
});

router.put('/', (req, res) => {
  ctrl.editTable(req.body)
  .then(table => resSuccess(res, table))
  .catch(err => resError(res, err));
});

router.delete('/', (req, res) => {
  ctrl.deleteTable(req.body)
  .then(table => resSuccess(res, table))
  .catch(err => resError(res, err));
});

router.delete("/clearOrders", (req,res) => {
  ctrl.clearOrders(req.body)
  .then(table => resSuccess(res, table))
  .catch(err => resError(res, err));
})


module.exports = router;
