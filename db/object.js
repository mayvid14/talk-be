const mongoose = require('mongoose');
const _ = require("lodash");
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json'));

const connection = mongoose.createConnection(_.get(config, "DB_PATH", "") + "/" + _.get(config, "DB_NAME", ""), { useNewUrlParser: true, useFindAndModify: false });

module.exports = { mongoose, connection };