const router = require('express').Router();
const ctrl = require('../../controllers/hotel/event');
const auth = require('../../middleware/auth');
const hotelAuth = require('../../middleware/hotelAuth');

router.post('/', hotelAuth, ctrl.addEvent);
router.post('/reservation', auth, ctrl.addReservation);

router.get('/one/:event_id', ctrl.getEvent);
router.get('/reservations/:event_id', hotelAuth, ctrl.getReservations);
router.get('/:hotel_id', ctrl.getByHotel);

router.delete('/:event_id', hotelAuth, ctrl.deleteEvent);
router.delete('/reservation/:reservation_id', auth, ctrl.cancelReservation);

module.exports = router;