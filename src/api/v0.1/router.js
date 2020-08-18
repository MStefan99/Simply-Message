'use strict';

const express = require('express')

const chatRouter = require('./chats');
const messageRouter = require('./messages');
const contactRouter = require('./contacts');

const router = express.Router();


router.use('/chats', chatRouter);
router.use('/chats/:chatID/messages', messageRouter);
router.use('/contacts/', contactRouter);

router.get('/', (req, res) => {
	res.send('Welcome to Simply Chat API v0.1!');
});


module.exports = router;
