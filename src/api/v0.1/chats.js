'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const middleware = require('../../lib/middleware');
const libChat = require('../../lib/chat');

const router = express.Router();

router.use(bodyParser.json());
router.use(middleware.redirectIfNotAuthorized());


router.get('/', async (req, res) => {  // Get all chats
	res.json(await libChat.getChats());
});


router.get('/:chatID', async (req, res) => {  // Get chat by id
	res.json(await libChat.getChatByID(req.params.chatID));
});


router.post('/', async (req, res) => {  // Create chat
	try {
		const chat = await libChat.createChat(req.body, req.user);

		res.status(201).json(chat);
	} catch (e) {
		res.status(400).send(e.message);
	}
});


router.patch('/:chatID', async (req, res) => {  // Rename chat
	try {
		const chat = await libChat.getChatByID(req.params.chatID);

		if (req.body.noPubKey === true) {
			await chat.setKeys(undefined, undefined);
			res.status(200).json(chat);
		} else if (req.body.bPubKey) {
			await chat.setKeys(undefined, req.body.bPubKey);
			res.status(200).json(chat);
		} else if (!chat.creator.equals(req.user._id)) {
			res.status(403).send('NOT_ALLOWED');
		} else if (req.body.name) {
			await chat.rename(req.body.name);
			res.status(200).json(chat);
		}
	} catch (e) {
		res.status(400).send(e.message);
	}
});


router.delete('/:chatID', async (req, res) => {  // Delete chat
	try {
		const chat = await libChat.getChatByID(req.params.chatID);

		if (!chat.creator.equals(req.user._id)) {
			res.status(403).send('NOT_ALLOWED');
		} else {
			await chat.remove();

			res.sendStatus(200);
		}
	} catch (e) {
		res.status(400).send(e.message);
	}
});


module.exports = router;
