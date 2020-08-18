'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;

const openDB = require('../../lib/db');
const middleware = require('../../lib/middleware');

const router = express.Router();

router.use(bodyParser.json());
router.use(middleware.redirectIfNotAuthorized());


router.get('/', async (req, res) => {  // Get all contacts
	const db = await openDB('simply_message');

	const users = db.collection('users');
	res.json(await users.aggregate([
		{$match: {_id: req.user._id}},
		{
			$lookup: {
				from: 'users',
				localField: 'contacts',
				foreignField: '_id',
				as: 'contacts'
			}
		},
		{$project: {
			'contacts.passwordHash': 0,
			'contacts.contacts': 0,
		}},
		{$unwind: '$contacts'},
		{$replaceRoot: {newRoot: '$contacts'}},
	]).toArray());
});


router.post('/', async (req, res) => {  // Add contact
	const db = await openDB('simply_message');

	const users = db.collection('users');
	users.updateOne({_id: req.user._id}, {
		$push: {contacts: ObjectId(req.body.id)}
	});

	res.status(201).json({_id: req.body.id});
});


router.delete('/:contactID', async (req, res) => {  // Delete contact
	const db = await openDB('simply_message');

	const users = db.collection('users');
	users.updateOne({_id: req.user._id}, {
		$pull: {contacts: ObjectId(req.params.contactID)}
	});
	res.sendStatus(200);
});


module.exports = router;
