'use strict';

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url, {useUnifiedTopology: true});
const conn = client.connect();


async function openDB(name = 'simply_message') {
	return conn.then(conn => conn.db(name));
}

module.exports = openDB;
