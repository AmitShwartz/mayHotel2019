const Table = require('../../../schemas/table');
const { resError, resSuccess } = require('../../../consts')

exports.addTables = async (req, res) => { //amount, seats
  try {
    const { amount, seats } = req.body;
    const tableCollection = await Table.find({ hotel: req.hotel._id })
    const count = tableCollection.length + 1;

    console.log(count)
    for (let i = count; i < (count + amount); i++) {
      let newTable = new Table({
        hotel: req.hotel._id,
        number: i,
        seats
      });
      await newTable.save();
    }
    const tables = await Table.find({ hotel: req.hotel._id });
    resSuccess(res, tables);
  } catch (err) {
    resError(res, err.message);
  }
}

exports.getAllTables = async (req, res) => {
  try {
    const tables = await Table.find({ hotel: req.hotel._id }).sort('number');
    resSuccess(res, tables);
  } catch (err) {
    resError(res, err.message);
  }
}

exports.getTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.table_id);
    if (!table) throw new Error('invalid table_id')
    resSuccess(res, table);
  } catch (err) {
    resError(res, err.message);
  }
};

exports.editTable = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['number', 'seats'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation)
    return res.status(400).send({ error: 'invalid updates' });

  try {
    const table = await Table.findById(req.params.table_id);
    if (!table) throw new Error('invalid table_id');

    updates.forEach(update => table[update] = req.body[update]);
    await table.save();
    resSuccess(res, table);

  } catch (err) {
    resError(res, err.message);
  }
}

exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.table_id);
    if (!table) throw new Error('invalid table_id');
    deleted = await table.remove();

    resSuccess(res, deleted);
  } catch (err) {
    resError(res, err.message);
  }
}


// exports.addTable = ({hotel_id, number, seats}) => { // PUT  /hotel/table
//   return new Promise((resolve, reject) => {
//     if(!hotel_id || !number || !seats) reject('hotel_id || number || seats params are missing');
//     let newTable = new Table({'hotel': hotel_id, number, seats});
//     newTable.save((err, table) => {
//       if(err) reject(err.message);
//       resolve(table);
//     })
//   });
// }

// exports.getAllTables = ({ hotel_id }) => {
//   return new Promise((resolve, reject) => {
//     if (!hotel_id) return reject('hotel_id param is missing');

//     Hotel.findById(hotel_id).exec((err, hotel) => {
//       if (err) return reject(err.message);
//       else if (!hotel) return reject(`hotel: ${hotel_id} not exists`);

//       Table.find({
//         hotel: hotel_id
//       }).select(`number seats`).sort('number').exec((err, tables) => {
//         if (err) return reject(err.message);

//         resolve(tables);
//       });
//     });
//   });
// }

// exports.getTable = ({ table_id }) => { // GET /hotel/table/:table_id
//   return new Promise((resolve, reject) => {
//     if (!table_id) reject('table_id param is missing');

//     Table.findById(table_id).exec((err, table) => {
//       if (err) reject(err.message);
//       if (!table) reject("table_id not found");
//       resolve(table);
//     })
//   });
// };

// exports.editTable = (req) => { // PATCH /hotel/table
//   return new Promise((resolve, reject) => {
//     let { table_id, number, seats } = req.body;
//     if (!table_id || !number || !seats) reject('table_id || number || seats params are missing');

//     Table.findOneAndUpdate({ '_id': table_id }, { '$set': { number, seats } }, { new: true }).exec((err, table) => {
//       if (err) reject(err.message);
//       if (!table) reject("table_id not exists");
//       resolve(table);
//     });
//   })
// }

// exports.deleteTable = ({ table_id }) => { //DELETE /hotel/table
//   return new Promise((resolve, reject) => {
//     if (!table_id) reject('table_id param is missin');

//     Table.findByIdAndDelete(table_id).exec((err, table) => {
//       if (err) reject(err.message);
//       if (!table) reject("table_id not exists");
//       resolve(table);
//     });
//   })
// }

// exports.clearOrders = ({ table_id }) => {
//   return new Promise((resolve, reject) => {
//     if (!table_id) reject('table_id param is missing');
//     Table.clearOrders(table_id).then((table) => {
//       resolve(table);
//     }).catch(e => reject(e.message));
//   })
// }
