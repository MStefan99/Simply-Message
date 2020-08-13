'use strict';

const express = require('express')

const chatRouter = require('./chats');
const messageRouter = require('./messages');

const router = express.Router();


router.use('/chats', chatRouter);
router.use('/chats/:chatID/messages', messageRouter);


module.exports = router;
