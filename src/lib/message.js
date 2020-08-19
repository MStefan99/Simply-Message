'use strict';

const openDB = require('./db');
const ObjectID = require('mongodb').ObjectID;


class Message {
	_id = ObjectID();
	_chat;
	author;
	text;
	time = Date.now();
	edited = false;


	static async createMessage(chat, options, user) {
		const messageObject = new Message();
		const db = await openDB('simply_message');

		messageObject.author = user._id;
		messageObject.text = options.text;
		messageObject._chat = chat._id;

		const chats = db.collection('chats')
		await chats.updateOne({_id: chat._id}, {
			$push: {messages: messageObject}
		});

		return messageObject;
	}


	static async getChatMessages(chat) {
		const messageObjects = [];
		const db = await openDB('simply_message');

		const chats = db.collection('chats');
		const chatData = await chats.findOne({_id: chat._id}, {
			projection: {
				messages: 1
			}
		});

		for (const messageData of chatData.messages) {
			const messageObject = new Message();

			Object.assign(messageObject, messageData);
			messageObject._chat = chat._id;
			messageObjects.push(messageObject);
		}
		return messageObjects;
	}


	static async getMessageByID(chat, id) {
		const messageObject = new Message();
		const db = await openDB('simply_message');

		const chats = db.collection('chats');
		const chatData = await chats.findOne({
			_id: chat._id,
			'messages._id': ObjectID(id)
		}, {
			projection: {
				'messages.$': 1
			}
		});

		if (!chatData) {
			throw new Error('NO_CHAT');
		} else if (!chatData.messages.length) {
			throw new Error('NO_MESSAGE');
		}

		Object.assign(messageObject, chatData.messages[0]);
		return messageObject;
	}


	async setText(newText) {
		const db = await openDB('simply_message');

		const chats = db.collection('chats')
		await chats.findOneAndUpdate({
			_id: this._chat,
				'messages._id': this._id
			},
			{
				$set: {
					'messages.$.text': newText,
					'messages.$.edited': true
				}
			}
		);
		this.text = newText;
		this.edited = true;
	}


	async remove() {
		const db = await openDB('simply_message')

		const chats = db.collection('chats');
		await chats.updateOne({_id: this._chat}, {
			$pull: {messages: {_id: this._id}}
		});
	}
}


module.exports = Message;
