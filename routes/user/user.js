const router = require('express').Router();
const {resError, resSuccess} = require("../../consts");
const ctrl = require('../../controllers/user/user');

router.post('/', (req,res) => {
  ctrl.register(req.body)
  .then(user => resSuccess(res, user))
  .catch(err => resError(res, err));
});

router.get('/:user_id', (req,res) => {
  ctrl.getUserByID(req.params)
  .then(user => resSuccess(res, user))
  .catch(err => resError(res, err));
});

router.put('/', (req,res) => {
  ctrl.edit(req.body)
  .then(user => resSuccess(res, user))
  .catch(err => resError(res, err));
});

module.exports = router;
