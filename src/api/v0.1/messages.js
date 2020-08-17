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
	res.json((await chats.findOne(ObjectId(req.params.chatID), {
		projection: {
			messages: 1
		}
	})).messages);
});


router.post('/', async (req, res) => {  // Create message
	const db = await openDB('simply_message');

	const chats = db.collection('chats');
	const message = {
		_id: ObjectId(),
		author: req.user._id,
		text: req.body.text,
		time: Date.now(),
		edited: false
	}
	await chats.updateOne({_id: ObjectId(req.params.chatID)}, {
		$push: {messages: message}
	});

	res.status(201).json(message);
});


router.put('/:messageID', async (req, res) => {  // Update message
	const db = await openDB('simply_message');

	const chats = db.collection('chats')
	const query = {
		_id: ObjectId(req.params.chatID),
		'messages._id': ObjectId(req.params.messageID)
	};
	await chats.findOneAndUpdate(
		query,
		{
			$set: {
				'messages.$.text': req.body.text,
				'messages.$.edited': true
			}
		}
	);

	const message = (await chats.findOne(query, {
		projection: {'messages.$': 1},
	})).messages[0];
	res.json(message);
});


router.delete('/:messageID', async (req, res) => {  // Delete message
	const db = await openDB('simply_message')

	db.collection('chats').updateOne({_id: ObjectId(req.params.chatID)}, {
		$pull: {messages: {_id: ObjectId(req.params.messageID)}}
	});
	res.sendStatus(200);
});


module.exports = router;
