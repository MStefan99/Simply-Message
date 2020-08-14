'use strict';


import Jui from '/js/jui.js';


const header = new Jui('header').remove();
const footer = new Jui('footer').remove();
const main = new Jui('main');

const chatPanel = new Jui('#chat-panel');
const messagePanel = new Jui('#message-panel');
const chatContainer = new Jui('#chat-container');
const messageContainer = new Jui('#message-container');

const settingsButton = new Jui('#settings-button')
	.addEventListener('click', () => {
		alert('Settings');
	});
const myProfileButton = new Jui('#my-profile-button')
	.addEventListener('click', () => {
		alert('My Profile');
	});
const newChatButton = new Jui('#new-chat-button')
	.addEventListener('click', () => {
		alert('New chat');
	});
const newGroupButton = new Jui('#new-group-button')
	.addEventListener('click', () => {
		alert('New group');
	});
const backButton = new Jui('#back-button')
	.addEventListener('click', () => {
		messagePanel.addClass('d-none');
		chatPanel.removeClass('d-none');
	});
const contactProfileButton = new Jui('#contact-profile-button')
	.addEventListener('click', () => {
		alert('Profile');
	});
const sendButton = new Jui('#send-button')
	.addEventListener('click', () => {
		alert('Send');
	});


function addChat(chat) {
	new Jui(`
		<div class='chat clickable border-bottom p-3'>
			<h4 class='chat-name mt-0'>
				${chat.name}
			</h4>
			<span class='chat-time float-right ml-2'>
				${chat.messages[0] ? new Date(chat.messages[0].time).toLocaleString() : ''}
			</span>
			<p class='mb-0'>
				${chat.messages[0] ? chat.messages[0].text : 'No messages yet'}
			</p>
		</div>`)
		.appendTo(chatContainer)
		.addEventListener('click', () => {
			messagePanel.removeClass('d-none');
			chatPanel.addClass('d-none');

			new Jui('.message').remove();
			new Jui('#contact-info h4').text('Loading chat...');
			messageContainer.addClass('d-md-flex');
		})
		.addEventListener('click', async () => {
			const res = await fetch(`/api/v0.1/chats/${chat._id}/messages/`);

			if (!res.ok) {
				alert('Could not download messages');
			} else {
				for (const message of await res.json()) {
					addMessage(message);
				}

				new Jui('#contact-info h4').text(chat.name);
			}
		});
}


function addMessage(message) {
	new Jui(`
		<div class='message my-2 px-3'>
			<p>
				${message.text}
			</p>
			<span>
				${new Date(message.time).toLocaleString()}
			</span>
		</div>`)
		.appendTo(messageContainer);
}


addEventListener('load', async () => {
	const res = await fetch('/api/v0.1/chats/');
	if (!res.ok) {
		alert('Failed to download chats');
	} else {
		for (const chat of await res.json()) {
			addChat(chat);
		}
	}
});
