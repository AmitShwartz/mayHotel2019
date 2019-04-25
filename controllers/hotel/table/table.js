const Hotel = require('../../../schemas/hotel');
const Table = require('../../../schemas/table');
const _ = require('lodash');

exports.addTable = (req) => { // PUT  /hotel/table
  return new Promise((resolve, reject) => {
    let body = _.pick(req.body, ['hotel', 'number', 'sits']);
    if(_.size(body) != 3) reject('hotel || number || sits params are missing');
    let newTable = new Table(body);
    newTable.save((err, table) => {
      if(err) reject(err.message);
      resolve(table);
    })
  });
}

exports.getAllTables = ({hotel_id}) => {
  return new Promise((resolve, reject) => {
    if(!hotel_id) return reject('hotel_id param is missing');

    Hotel.findById(hotel_id).exec((err, hotel) => {
        if(err) return reject(err.message);
        else if(!hotel) return reject(`hotel: ${hotel_id} not exists`);

        Table.find({
          hotel: hotel_id
        }).select(`number sits`).sort('number').exec((err, tables) => {
          if(err) return reject(err.message);

          resolve(tables);
        });
    });
  });
}

exports.getTable = ({table_id}) => { // GET /hotel/table/:table_id
  return new Promise((resolve, reject) => {
    if(!table_id) reject('table_id param is missing');

    Table.findById(table_id).exec((err, table) => {
      if(err) reject(err.message);
      if(!table) reject("table_id not found");
      resolve(table);
    })
  });
};

exports.editTable = (req) => { // PATCH /hotel/table
  return new Promise((resolve, reject) => {
    let {table_id, number, sits} = req.body;
    if(!table_id || !number || !sits) reject('table_id || number || sits params are missing');

    Table.findOneAndUpdate({'_id': table_id}, { '$set': {number,sits}}, {new:true}).exec((err, table) => {
      if(err) reject(err.message);
      if(!table) reject("table_id not exists");
      resolve(table);
    });
  })
}

exports.deleteTable = (req) => { //DELETE /hotel/table
  return new Promise((resolve, reject) => {
    let {table_id} = req.body;
    if(!table_id) reject('table_id param is missin');

    Table.findOneAndRemove({'_id': table_id}).exec((err, table) => {
      if(err) reject(err.message);
      if(!table) reject("table_id not exists");
      resolve(table);
    });
  })
}

exports.clearOrders = ({table_id}) => {
  return new Promise((resolve, reject) => {
    if(!table_id) reject('table_id param is missing');
    Table.clearOrders(table_id).then((table) => {
      resolve(table);
    }).catch(e => reject(e.message));
  })
}
