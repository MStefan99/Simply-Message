'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const middleware = require('../../lib/middleware');

const libUser = require('../../lib/user');

const router = express.Router();

router.use(bodyParser.json());
router.use(middleware.redirectIfNotAuthorized());


router.get('/', async (req, res) => {  // Get all contacts
	res.json(await req.user.getContacts());
});


router.post('/', async (req, res) => {  // Add contact
	const contact = await libUser.getUserByID(req.body.id);

	await req.user.addContact(contact);

	delete contact.passwordHash;
	delete contact.contacts;
	res.status(201).json(contact);
});


router.delete('/:contactID', async (req, res) => {  // Delete contact
	const contact = await libUser.getUserByID(req.params.contactID);

	await req.user.removeContact(contact);
	res.sendStatus(200);
});


module.exports = router;
