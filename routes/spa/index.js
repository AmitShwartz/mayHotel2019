const router = require('express').Router();
const ctrl = require('../../controllers/hotel/spa');
const auth = require('../../middleware/auth');

router.post('/', ctrl.addSpa );
router.post('/appointment', auth, ctrl.addAppointment );

// router.get('/one/:spa_id', ctrl.getSpa );
router.get('/available/:hotel/:date', ctrl.getSpaAvailableByDate);

// router.delete('/', ctrl.deleteSpaByDate );
 router.delete('/appointment/:appointment_id', auth, ctrl.cancelAppointment );

module.exports = router;