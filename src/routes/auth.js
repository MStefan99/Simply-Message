'use strict';

const express = require('express');
const crypto = require('crypto');

const sign = require('../lib/sign');
const openDB = require('../lib/db');
const {sessionCookie} = require('../lib/cookie');

const secret = 'Simply Message very secret key!';


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
	const user = await users.findOne({username: req.body.username});
	const hmac = crypto.createHmac('sha256', secret);

	if (!user) {
		res.send('Not found');
	} else if (user.passwordHash !== hmac
		.update(req.body.password)
		.digest('hex')) {
		res.send('Wrong password');
	} else {
		const session = {
			userID: user._id,
			time: Date.now(),
			ip: req.ip,
			ua: req.get('User-Agent'),
		};

		res.cookie(sessionCookie.cookieName, sign.sign(session),
			sessionCookie.options);
		res.redirect(303, '/messenger/');
	}
});


router.get('/logout', (req, res) => {
	res.clearCookie(sessionCookie.cookieName, sessionCookie.options)
	res.redirect(303, '/');
});


module.exports = router;
