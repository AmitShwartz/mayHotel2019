const router = require('express').Router();
const {resError, resSuccess} = require("../../consts");

const ctrl = require('../../controllers/user/user');

router.put('/register', (req,res) => {
  ctrl.register(req.body).then(user => resSuccess(res, user)).catch(err => resError(res, err));
});

router.post('/edit', (req,res) => {
  ctrl.getUserByID(req.body).then(user => resSuccess(res, user)).catch(err => resError(res, err));
});

module.exports = router;
