'use strict';

const express = require('express');

const openDB = require('../lib/db');
const middleware = require('../lib/middleware');

const router = express.Router();

router.use(middleware.redirectIfNotAuthorized());


router.get('/', (req, res) => {
	res.render('messenger/index');
});


router.post('/chats', async (req, res) => {
	const db = await openDB('simply_message');

	const chats = db.collection('chats');
	await chats.insertOne({
		name: req.body.name || null,
		desc: req.body.desc || null,
		creatorID: req.user._id,
		invitees: []
	});

	res.sendStatus(200);
});


module.exports = router;
