'use strict';

const express = require('express');
const crypto = require('crypto');
const MongoClient = require('mongodb').MongoClient;

const sign = require('../lib/sign');

const url = 'mongodb://localhost:27017';
const secret = 'Simply Message very secret key!';
const sessionSecret = 'Simply Message session secret key';

const client = new MongoClient(url, {useUnifiedTopology: true});


async function openDB(name) {
	const conn = await client.connect();
	return conn.db(name);
}


(async function init() {
	const db = await openDB('simply_message');
	const collections = await db.listCollections().toArray();

	if (!collections.some(collection => collection.name === 'users')) {
		const users = db.collection('users');
		users.createIndex('username');
		users.createIndex('email');
	}
})()


const router = express.Router();


router.get('/register', (req, res) => {
	res.render('auth/register');
});


router.post('/register', async (req, res) => {
	const db = await openDB('simply_message');
	const users = db.collection('users');
	const hmac = crypto.createHmac('sha256', secret);

	await users.insertOne({
		username: req.body.username,
		email: req.body.email,
		passwordHash: hmac.update(req.body.password).digest('hex')
	});
	res.send('Success!');
});


router.get('/login', (req, res) => {
	res.render('auth/login');
});


router.post('/login', async (req, res) => {
	const db = await openDB('simply_message');
	const users = db.collection('users');
	const user = await users.find({username: req.body.username}).next();
	const hmac = crypto.createHmac('sha256', secret);

	if (!user) {
		res.send('Not found');
	} else if (user.passwordHash !== hmac
		.update(req.body.password)
		.digest('hex')) {
		res.send('Wrong password');
	} else {
		const session = {
			user: user._id,
			time: Date.now(),
			ip: req.ip,
			ua: req.get('User-Agent'),
		};

		res.cookie('Session', sign.sign(session));
		res.redirect(303, '/messages/');
	}
});


module.exports = router;
