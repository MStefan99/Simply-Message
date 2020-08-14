'use strict';


import Jui from '/js/jui.js';


let currentChat;
let currentSession;


function getCookie(name) {
	const cookies = document.cookie.split('; ');

	const re = new RegExp(`^${name}=`);
	return cookies.find(row => re.test(row))
		.replace(/^.*=/, '');
}


function getSession() {
	const signature = getCookie('Session');

	const session = signature.replace(/\..*$/, '');
	return JSON.parse(
		atob(decodeURIComponent(session)));
}


function remove(node) {
	node.parentNode.removeChild(node);
}


function openMessagePanel() {
	messagePanel.removeClass('d-none');
	chatPanel.addClass('d-none');

	new Jui('.message').remove();
	new Jui('#contact-info h4').text('Loading chat...');
	messageContainer.addClass('d-md-flex');
}


async function downloadMessages() {
	const res = await fetch(`/api/v0.1/chats/${currentChat._id}/messages/`);

	if (!res.ok) {
		alert('Could not download messages');
	} else {
		for (const message of await res.json()) {
			addMessage(message);
		}

		new Jui('#contact-info h4').text(currentChat.name);
	}
}


const header = new Jui('header').remove();
const footer = new Jui('footer').remove();
const main = new Jui('main');
const chatPanel = new Jui('#chat-panel');
const messagePanel = new Jui('#message-panel');
const chatContainer = new Jui('#chat-container');
const messageContainer = new Jui('#message-container');
const messageInput = new Jui('#message-input');


// Setting up page blocker
const pageBlocker = new Jui('#page-blocker')
	.addEventListener('click', e => {
		e.currentTarget.classList.add('d-none');
		new Jui('.popup').remove();
	});


// Setting up Settings button
const settingsButton = new Jui('#settings-button')
	.addEventListener('click', () => {
		alert('Settings');
	});


// Setting up My Profile button
const myProfileButton = new Jui('#my-profile-button')
	.addEventListener('click', () => {
		alert('My Profile');
	});


// Setting up New Chat button
const newChatButton = new Jui('#new-chat-button')
	.addEventListener('click', () => {
		const popup = new Jui(`
		<div class="popup">
			<form id="new-chat-form">
				<h2>New chat</h2>
				<label for="new-chat-name-input">New chat name</label>
				<input type="text" id="new-chat-name-input" name="name" autocomplete="off">
				<input type="submit" class="btn btn-success" value="Create"></input>
			</form>
		</div>
		`)
			.appendTo(main);

		new Jui('#new-chat-form')
			.addEventListener('submit', async (event) => {
				event.preventDefault();
				const name = new Jui('#new-chat-name-input').val();
				if (!name) {
					alert('Chat name cannot be empty!');
				} else {
					const res = await fetch('/api/v0.1/chats/', {
						method: 'post',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							name: name
						})
					});
					addChat(await res.json());

					popup.remove();
					pageBlocker.addClass('d-none');
				}
			});
		pageBlocker.removeClass('d-none');
	});


// Setting up New Channel button
const newGroupButton = new Jui('#new-channel-button')
	.addEventListener('click', () => {
		alert('New group');
	});


// Setting up Back button
const backButton = new Jui('#back-button')
	.addEventListener('click', () => {
		messagePanel.addClass('d-none');
		chatPanel.removeClass('d-none');
	});


// Setting up Profile button
const contactProfileButton = new Jui('#contact-profile-button')
	.addEventListener('click', () => {
		alert('Profile');
	});


// Setting up Send form
const newMessageForm = new Jui('#new-message-form')
	.addEventListener('submit', async (event) => {
		event.preventDefault();
		const res = await fetch(`/api/v0.1/chats/${currentChat._id}/messages/`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				text: messageInput.val()
			})
		});

		new Jui(`.chat[data-id='${currentChat._id}'] p.chat-last-message`)
			.text(messageInput.val())
		new Jui(`.chat[data-id='${currentChat._id}'] span.chat-time`)
			.text(new Date().toLocaleString())
		messageInput.val('');
		addMessage(await res.json());
	});


function addChat(chat) {
	new Jui(`
		<div class="chat clickable border-bottom user-select-none p-3" data-id="${chat._id}">
			<h4 class="chat-name mt-0">
				${chat.name}
			</h4>
			<span class="chat-time float-right ml-2">
				${chat.messages[0] ? new Date(chat.messages[0].time).toLocaleString() : ""}
			</span>
			<p class="chat-last-message mb-0">
				${chat.messages[0] ? chat.messages[0].text : '<i>No messages yet</i>'}
			</p>
		</div>
		`)
		.appendTo(chatContainer)
		.addEventListener('click', () => currentChat = chat)
		.addEventListener('click', openMessagePanel)
		.addEventListener('click', downloadMessages);
}


function addMessage(message) {
	new Jui(`
		<div class="message m-3 p-2 ${message.author === currentSession.userID? 'align-self-end' : ''}">
		<p class="message-text mt-2">
			${message.text}
		</p>
		<span class="message-time text-muted ${message.author === currentSession.userID? 'float-right' : ''}">
			${new Date(message.time).toLocaleString()}
		</span>
		</div>
	`)
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

	currentSession = getSession();
});
