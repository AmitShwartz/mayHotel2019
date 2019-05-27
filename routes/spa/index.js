const router = require('express').Router();
const ctrl = require('../../controllers/hotel/spa');
const auth = require('../../middleware/auth');

router.post('/', ctrl.addSpa );
router.post('/appointment', auth, ctrl.addAppointment );

router.get('/:hotel/available', ctrl.getSpaAvailable );
router.get('/:hotel/available/:date', ctrl.getSpaAvailableByDate);

// router.delete('/', ctrl.deleteSpaByDate );
 router.delete('/appointment/:appointment_id', auth, ctrl.cancelAppointment );

module.exports = router;