'use strict';

const openDB = require('./db');
const ObjectID = require('mongodb').ObjectID;


class Chat {
	_id = ObjectID();
	creator;
	name;
	desc;
	invitees;
	messages = [];
	type;


	// Chats
	static async createChat(options, user) {
		const chatObject = new Chat();
		const db = await openDB('simply_message');

		switch (options.type) {
			case 'chat':
				if (!options.contact) {
					throw new Error('NO_CONTACTS');
				}
				chatObject.name = null;
				chatObject.desc = null;
				chatObject.invitees = [user._id, ObjectID(options.contact)];
				chatObject.secure = options.secure;
				chatObject.aPubKey = options.secure? options.pubKey : undefined;
				break;
			case 'group':
				if (!options.contacts) {
					throw new Error('NO_CONTACTS');
				}
				chatObject.name = options.name;
				chatObject.desc = options.desc;
				chatObject.invitees = [user._id];
				for (const contact of options.contacts) {
					chatObject.invitees.push(ObjectID(contact));
				}
				break;
			case 'channel':
				chatObject.name = options.name;
				chatObject.desc = options.desc;
				chatObject.invitees = [user._id];
				break;
			default:
				throw new Error('WRONG_TYPE');
		}
		chatObject.creator = user._id;
		chatObject.type = options.type;

		const chats = db.collection('chats');
		await chats.insertOne(chatObject);

		return chatObject;
	}


	static async getChats() {
		const chatObjects = [];
		const db = await openDB('simply_message');

		const chats = db.collection('chats');
		const allChatData = await chats.find({}, {
			projection: {
				messages: {$slice: -1},  // TODO: rename to lastMessage
				invitees: {$slice: -2},
				name: 1,
				type: 1,
				creator: 1,
				secure: 1,
				aPubKey: 1,
				bPubKey: 1
			}
		}).toArray();

		for (const chatData of allChatData) {
			const chatObject = new Chat();

			Object.assign(chatObject, chatData);
			chatObjects.push(chatObject);
		}

		return chatObjects;
	}


	static async getChatByID(id) {
		const db = await openDB('simply_message');

		const chats = db.collection('chats');
		const chatData = await chats.findOne({_id: ObjectID(id)}, {
			projection: {
				messages: {$slice: -1}
			}
		});

		if (!chatData) {
			throw new Error('NO_CHAT');
		}

		const chatObject = new Chat();

		Object.assign(chatObject, chatData);
		return chatObject;
	}


	async rename(newName) {
		const db = await openDB('simply_message');
		const chats = db.collection('chats');

		if (this.type === 'chat') {
			throw new Error('CHAT_CANNOT_BE_RENAMED');
		}
		await chats.updateOne({_id: this._id}, {
			$set: {name: newName}
		});

		this.name = newName;
	}


	async setKeys(aPubKey, bPubKey) {
		const db = await openDB('simply_message');
		const chats = db.collection('chats');

		await chats.updateOne({_id: this._id}, {
			$set: {
				aPubKey: aPubKey,
				bPubKey: bPubKey
			}
		});

		this.aPubKey = aPubKey;
		this.bPubKey = bPubKey;
	}


	async remove() {
		const db = await openDB('simply_message');

		db.collection('chats').deleteOne({_id: this._id});
	}


	// Messages
	async addMessage(message) {

	}
}


module.exports = Chat;
