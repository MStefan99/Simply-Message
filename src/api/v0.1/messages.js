'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const middleware = require('../../lib/middleware');
const libChat = require('../../lib/chat');
const libMessage = require('../../lib/message');

const router = express.Router({mergeParams: true});

router.use(bodyParser.json());
router.use(middleware.redirectIfNotAuthorized());


router.get('/', async (req, res) => {  // Get all messages
	try {
		const chat = await libChat.getChatByID(req.params.chatID);
		const messages = await libMessage.getChatMessages(chat);

		res.json(messages);
	} catch (e) {
		res.status(400).send(e.message);
	}
});


router.post('/', async (req, res) => {  // Create message
	try {
		const chat = await libChat.getChatByID(req.params.chatID);
		const message = await libMessage
		.createMessage(chat, req.body, req.user);

		res.json(message);
	} catch (e) {
		res.status(400).send(e.message);
	}
});


router.put('/:messageID', async (req, res) => {  // Update message
	try {
		const chat = await libChat.getChatByID(req.params.chatID);
		const message = await libMessage
		.getMessageByID(chat, req.params.messageID);

		if (!message.author.equals(req.user._id)) {
			res.status(403).send('NOT_ALLOWED');
		} else {
			await message.setText(req.body.text);

			res.json(message);
		}
	} catch (e) {
		res.status(400).send(e.message);
	}
});


router.delete('/:messageID', async (req, res) => {  // Delete message
	try {
		const chat = await libChat.getChatByID(req.params.chatID);
		const message = await libMessage
		.getMessageByID(chat, req.params.messageID);

		if (!message.author.equals(req.user._id)) {
			res.status(403).send('NOT_ALLOWED');
		} else {
			await message.remove();

			res.sendStatus(200);
		}
	} catch (e) {
		res.status(400).send(e.messages);
	}
});


module.exports = router;
