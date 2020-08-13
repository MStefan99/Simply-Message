'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectID;

const openDB = require('../../lib/db');
const middleware = require('../../lib/middleware');

const router = express.Router({mergeParams: true});

router.use(bodyParser.json());
router.use(middleware.redirectIfNotAuthorized());


router.get('/', async (req, res) => {  // Get all messages
	const db = await openDB('simply_message');

	const chats = db.collection('chats');
	res.json((await chats.findOne(ObjectId(req.params.chatID),
		{projection: {messages: 1}})).messages);
});


router.post('/', async (req, res) => {  // Create message
	const db = await openDB('simply_message');

	const chats = db.collection('chats');
	const message = {author: req.user._id, text: req.body.text}
	await chats.updateOne({_id: ObjectId(req.params.chatID)}, {
		$push: {messages: message}
	});

	res.status(201).json(message);
});


module.exports = router;
