'use strict';

const ObjectID = require('mongodb').ObjectID;
const crypto = require('crypto');

const openDB = require('./db');

const secret = 'Simply Message very secret key!';


class User {
	_id = ObjectID();
	name;
	email;
	username;
	passwordHash;
	contacts;


	static async createUser(options) {
		const userObject = new User();

		const db = await openDB('simply_message');
		const users = db.collection('users');
		const hmac = crypto.createHmac('sha256', secret);

		userObject.username = options.username;
		userObject.email = options.email;
		userObject.name = options.name;
		userObject.passwordHash = hmac
		.update(options.password)
		.digest('hex')

		await users.insertOne(userObject);
		return userObject;
	}


	static async getUserByID(id) {
		const userObject = new User();

		const db = await openDB('simply_message');
		const users = db.collection('users');

		const userData = await users.findOne({_id: ObjectID(id)});

		if (!userData) {
			throw new Error('NO_USER');
		}

		Object.assign(userObject, userData);
		return userObject;
	}


	static async getUserByUsername(username) {
		const userObject = new User();

		const db = await openDB('simply_message');
		const users = db.collection('users');

		const userData = await users.findOne({username: username});

		if (!userData) {
			throw new Error('NO_USER');
		}

		Object.assign(userObject, userData);
		return userObject;
	}


	verifyPassword(password) {
		const hmac = crypto.createHmac('sha256', secret);

		return this.passwordHash === hmac
		.update(password)
		.digest('hex');
	}


	async setPassword(newPassword) {
		throw new Error('NOT_IMPLEMENTED');
	}


	async getContacts() {
		const db = await openDB('simply_message');

		const users = db.collection('users');
		return await users.aggregate([
			{$match: {_id: this._id}},
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
		]).toArray()
	}


	async addContact(user) {
		const db = await openDB('simply_message');

		const users = db.collection('users');
		users.updateOne({_id: this._id}, {
			$push: {contacts: user._id}
		});
	}


	async removeContact(user) {
		const db = await openDB('simply_message');

		const users = db.collection('users');
		users.updateOne({_id: this._id}, {
			$pull: {contacts: user._id}
		});

		throw new Error('NOT_IMPLEMENTED');
	}


	async remove() {
		throw new Error('NOT_IMPLEMENTED');
	}
}


module.exports = User;
