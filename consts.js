const moment = require('moment');

module.exports = {
  PORT: process.env.PORT || 8000,
  DB_URI: 'mongodb://mayhotel:mayhotel2019@ds357955.mlab.com:57955/mayhotel',
  //DB_URI: 'mongodb://db_user:db_pass123@ds051665.mlab.com:51665/my_hotel', //mongodb://db_user:db_pass123@ds159661.mlab.com:59661/my_hotel
  //DB_URI: 'mongodb://localhost:27017/my_hotel',
  resError: (res, err) => {
    return res.status(500).json({status: false, err});
  },
  resSuccess: (res, data) => {
    return res.json({status: true, data});
  },
  DATE_INT: (date) => {
    return Number(moment(new Date(date)).format('YYYYMMDD'));
  },
  TIME_INT: (time_str) => {
    return Number(time_str.replace(':',''));
  }
}
