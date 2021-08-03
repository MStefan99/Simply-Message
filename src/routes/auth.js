'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const sign = require('../lib/sign');
const openDB = require('../lib/db');
const {sessionCookie} = require('../lib/cookie');
const flash = require('express-flash');
const libUser = require('../lib/user');


(async function init() {
	const db = await openDB('simply_message');
	const collections = await db.listCollections().toArray();

	if (!collections.some(collection => collection.name === 'users')) {
		const users = db.collection('users');
		users.createIndex('username');
		users.createIndex('email');
	}
})();


const router = express.Router();
router.use(bodyParser.urlencoded({extended: true}));
router.use(flash());


router.get('/register', (req, res) => {
	res.render('auth/register');
});


router.post('/register', async (req, res) => {
	const user = await libUser.createUser({
		username: req.body.username,
		email: req.body.email,
		name: req.body.email,
		password: req.body.password
	});

	res.flash({title: 'Registration successful!'})
		.redirect(303, '/');
});


router.get('/login', (req, res) => {
	res.render('auth/login');
});


router.post('/login', async (req, res) => {
	const user = await libUser.getUserByUsername(req.body.username);

	if (!user.verifyPassword(req.body.password)) {
		res.send('Wrong password');
	} else {
		const session = {
			userID: user._id,
			time: Date.now(),
			ip: req.ip,
			ua: req.get('User-Agent')
		};

		res.cookie(sessionCookie.cookieName, sign.sign(session),
			sessionCookie.options);
		res.redirect(303, '/messenger/');
	}
});


router.get('/logout', (req, res) => {
	res.clearCookie(sessionCookie.cookieName,
		sessionCookie.options);
	res.redirect(303, '/');
});


module.exports = router;
