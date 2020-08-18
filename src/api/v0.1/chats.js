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
			invitees: {$slice: -2},
			name: 1,
			type: 1,
			creator: 1
		}
	}).toArray());
});


router.get('/:chatID', async (req, res) => {  // Get chat by id
	const db = await openDB('simply_message');

	const chats = db.collection('chats');
	res.json(await chats.findOne({_id: ObjectId(req.params.chatID)}, {
		projection: {
			messages: {$slice: -1}
		}
	}));
});


router.post('/', async (req, res) => {  // Create chat
	const db = await openDB('simply_message');
	let chat = {};

	switch (req.body.type) {
		case 'chat':
			if (!req.body.contact) {
				res.status(400).send('NO_CONTACT');
				return;
			}
			chat = {
				name: null,
				desc: null,
				invitees: [ObjectId(req.body.contact)]
			}
			chat.invitees.push(req.user._id);
			break;
		case 'group':
			if (!req.body.contacts) {
				res.status(400).send('NO_CONTACTS');
			}
			chat = {
				name: req.body.name,
				desc: req.body.desc,
				invitees: []
			}
			for (const contact of req.body.contacts) {
				chat.invitees.push(ObjectId(contact));
			}
			chat.invitees.push(req.user._id);
			break;
		case 'channel':
			chat = {
				name: req.body.name,
				desc: req.body.desc,
				invitees: [req.user._id]
			}
			break;
		default:
			res.status(400).send('WRONG_TYPE');
			return;
	}
	chat.creator = req.user._id;
	chat._id = ObjectId();
	chat.messages = [];
	chat.type = req.body.type;

	const chats = db.collection('chats');
	await chats.insertOne(chat);

	res.status(201).json(chat);
});


router.patch('/:chatID', async (req, res) => {  // Update chat
	const db = await openDB('simply_message')
	const chats = db.collection('chats');

	const r = await chats.updateOne({
		_id: ObjectId(req.params.chatID),
		type: {$ne: 'chat'}
	}, {
		$set: {name: req.body.name}
	});

	if (!r.result.n) {
		res.status(400).send('CANT_BE_MODIFIED');
		return;
	}

	const chat = await chats.findOne({_id: ObjectId(req.params.chatID)}, {
		projection: {
			messages: {$slice: -1}
		}
	});
	res.json(chat);
});


router.delete('/:chatID', async (req, res) => {  // Delete chat
	const db = await openDB('simply_message');

	db.collection('chats').deleteOne({_id: ObjectId(req.params.chatID)});
	res.sendStatus(200);
});


module.exports = router;
