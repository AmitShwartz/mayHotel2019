const router = require('express').Router();
const hotelAuth = require('../../middleware/hotelAuth');
const ctrl = require('../../controllers/hotel/hotel');

const router_room = require('./room/room');
const router_table = require("./table/table");
const router_meal = require("./meal");
const eventRouter = require('../event');
const spaRouter = require('../spa');

router.use('/rooms', router_room);
router.use("/tables", router_table);
router.use("/meals", router_meal);
router.use("/events", eventRouter);
router.use("/spa", spaRouter);

router.post('/', ctrl.createHotel);
router.post('/login', ctrl.login);
router.post('/logout', hotelAuth, ctrl.logout);
router.post('/logoutAll', hotelAuth, ctrl.logoutAll);

router.get('/:hotel_id', ctrl.getHotel);

module.exports = router;
