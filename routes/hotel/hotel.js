const router = require('express').Router();
const {resError, resSuccess} = require("../../consts");
const ctrl = require('../../controllers/hotel/hotel');
const router_room     = require('./room/room');
const router_schedule = require('./schedule/schedule');
const router_table    = require("./table/table");
const router_meal     = require("./meal");
const router_therepist     = require("./therepist");

router.use('/room', router_room);
router.use("/schedule",router_schedule);
router.use("/table",router_table);
router.use("/meal",router_meal);
router.use("/therepist",router_therepist);

router.post('/getAvailableRooms', (req,res) => {
  ctrl.getAvailableRooms(req).then(rooms => resSuccess(res, rooms)).catch(err => resError(res, err));
});

router.post('/getTables', (req,res) => {
  ctrl.getTables(req).then(tables => resSuccess(res, tables)).catch(err => resError(res, err));
});

router.put('/addRooms', (req,res) => {
  ctrl.addRooms(req).then(str => resSuccess(res, str)).catch(err => resError(res, err));
});

router.put('/create', (req,res) => {
  ctrl.createHotel(req).then(hotel => resSuccess(res, hotel)).catch(err => resError(res, err));
});



module.exports = router;
