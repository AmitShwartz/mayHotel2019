const router = require('express').Router();
const {resError, resSuccess} = require("../../consts");
const ctrl = require('../../controllers/hotel/hotel');
const router_room     = require('./room/room');
const router_schedule = require('./schedule/schedule');
const router_table    = require("./table/table");
const router_meal     = require("./meal");
const router_therepist     = require("./therepist");

router.use('/rooms', router_room);
router.use("/schedule",router_schedule);
router.use("/tables",router_table);
router.use("/meals",router_meal);
router.use("/therepist",router_therepist);

router.post('/', (req,res) => {
  ctrl.createHotel(req.body).then(hotel => resSuccess(res, hotel)).catch(err => resError(res, err));
});

module.exports = router;
