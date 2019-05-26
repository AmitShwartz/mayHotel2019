const router = require('express').Router();
const {resSuccess} = require("../../consts");
const ctrl = require('../../controllers/user');
const auth = require('../../middleware/auth');

router.post('/', ctrl.signIn ); // Done
router.post('/login', ctrl.login ); // Done
router.post('/logout', auth, ctrl.logout ); // Done
router.post('/logoutAll', auth, ctrl.logoutAll ); // Done

router.get('/me', auth, (req,res) => resSuccess(res, req.user)); // Done
router.get('/me/vouchers', auth, ctrl.getVouchers); // Done
router.get('/me/events', auth, ctrl.getEvents); // Done

// Not done!
router.get('/me/spa', auth, ctrl.getAppointments);



router.put('/me', auth, ctrl.edit ); // Done

router.delete('/me', auth, ctrl.deleteUser ); // Done

module.exports = router;