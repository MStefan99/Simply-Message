'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;

const openDB = require('../../lib/db');
const middleware = require('../../lib/middleware');

const router = express.Router();

router.use(bodyParser.json());
router.use(middleware.redirectIfNotAuthorized());


router.get('/', async (req, res) => {  // Get all chats
	const db = await openDB('simply_message');

	const chats = db.collection('chats');
	res.json(await chats.find({}, {
		projection: {
			messages: {$slice: -1},  // TODO: rename to lastMessage
			invitees: 0,
			desc: 0,
			creatorID: 0
		}
	}).toArray());
});


router.get('/:chatID', async (req, res) => {  // Get chat by id
	const db = await openDB('simply_message');

	const chats = db.collection('chats');
	res.json(await chats.findOne(ObjectId(req.params.chatID)));
});


router.post('/', async (req, res) => {  // Create chat
	const db = await openDB('simply_message');

	const chats = db.collection('chats');
	const chat = {
		name: req.body.name || null,
		desc: req.body.desc || null,
		creatorID: req.user._id,
		invitees: [],
		messages: []
	}
	await chats.insertOne(chat);

	res.status(201).json(chat);
});


module.exports = router;
