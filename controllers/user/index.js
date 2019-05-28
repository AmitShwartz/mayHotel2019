const User = require('../../schemas/user');
const { resSuccess, resError } = require('../../consts')
const _ = require('lodash');

exports.signIn = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();

    const token = await newUser.generateAuthToken();
    resSuccess(res, { user: newUser, token });
  } catch (err) {
    resError(res, err.message);
  }
}

exports.login = async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    resSuccess(res, { user, token });
  } catch (err) {
    resError(res, err.message);
  }
}

exports.logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    resSuccess(res);
  } catch (err) {
    resError(res, err.message);
  }
}

exports.logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    resSuccess(res);
  } catch (err) {
    resError(res, err.message);
  }
}

exports.getEvents = async (req, res) => {
  try {
    const user = req.user;

    await user.populate('reservations.reservation').execPopulate();
    await user.populate({
      path: 'reservations.reservation.event',
      select: '-counter -reservations -_id'
    }).execPopulate();

    resSuccess(res, user.reservations);
  } catch (err) {
    resError(res, err.message);
  }
};

exports.getOrders = async (req, res) => {
  try {
    const user = req.user;
    await user.populate('orders.order').execPopulate();

    resSuccess(res, user.orders);
  } catch (err) {
    resError(res, err.message);
  }
};

exports.getVouchers = async (req, res) => {
  try {
    const user = req.user;
    await user.populate('vouchers.voucher').execPopulate();

    resSuccess(res, user.vouchers);
  } catch (err) {
    resError(res, err.message);
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const user = req.user;
    await user.populate('spa.appointment').execPopulate();

    resSuccess(res, user.spa);
  } catch (err) {
    resError(res, err.message);
  }
};

exports.edit = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['phone', 'email', 'password', 'address', 'avatar'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation)
    return res.status(400).send({ error: 'invalid updates' });

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    resSuccess(res, req.user);

  } catch (err) {
    resError(res, err.message);
  }
}

exports.deleteUser = async (req, res) => {
  try {
    await req.user.remove();
    resSuccess(res, req.user);
  } catch (err) {
    resError(res, err.message);
  }
}
