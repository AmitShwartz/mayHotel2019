const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const ReservationSchema = new Schema({
  qrcode: String,
  event: { type: ObjectId, ref: 'Event', required: true },
  user: { type: String, ref: 'User', required: true },
  amount: { type: Number, required: true, min: [1, 'at least 1 seat'] },
  counter: { type: Number, default: 0, min: [0, 'at least 0 seats taken'] }
}, { collection: 'reservations' });


// done  need checking
ReservationSchema.statics.addReservation = async (user, event, amount) => {
  const reservation = await Reservation.findOne({ user: user._id, event: event._id });
  if (!reservation) {
    const newReservation = new Reservation({ user: user._id, event: event._id, amount });
    await newReservation.save();

    event.reservations = await event.reservations.concat({ reservation: newReservation._id });
    event.counter += amount;
    await event.save();

    user.reservations = await user.reservations.concat({ reservation: newReservation._id });
    await user.save();
    const res = await newReservation.populate('user event').execPopulate();
    return res
  }
  const diff = user.room.guest_amount - reservation.amount;

  if (diff < amount) throw Error(`User ${user._id} can save only ${diff} seats.`);

  reservation.amount += amount;
  await reservation.save();

  event.counter += amount;
  await event.save();
  const res = await reservation.populate('user event').execPopulate()
  return res;
};

ReservationSchema.statics.removeReservation = async function (user, event, id) {
  const reservation = await Reservation.findById(id);
  if (!reservation) throw new Error('reservation not found in db');

  event.reservations = await event.reservations.filter(
    item => {
      if (item.reservation.toString() === id) {
        event.counter -= reservation.amount;
        return false;
      }
      return true;
    });
  await event.save();
  console.log(event.reservations)

  user.reservations = await user.reservations.filter(
    item => item.reservation.toString() !== id.toString()
  );
  await user.save();
  console.log(user.reservations)

  await reservation.remove();
  return reservation;
}

ReservationSchema.pre('save', async function (next) {
  const reservation = this;

  reservation.qrcode = await QRCode.toDataURL(reservation._id.toString());
  next()
});

const Reservation = mongoose.model('Reservation', ReservationSchema);
module.exports = Reservation;