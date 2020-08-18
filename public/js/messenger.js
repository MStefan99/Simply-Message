'use strict';


import Jui from '/js/jui.js';


let currentChat;

const header = new Jui('header').remove();
const footer = new Jui('footer').remove();
const main = new Jui('main')
.addEventListener('click contextmenu', mainEvent => {
	if (!mainEvent.handled) {  // Close context menus if needed
		new Jui('.menu').remove();
	}
});
const chatPanel = new Jui('#chat-panel');
const messagePanel = new Jui('#message-panel');
const chatContainer = new Jui('#chat-container');
const messageContainer = new Jui('#message-container');
const messageInput = new Jui('#message-input');


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


function getContacts() {
	return JSON.parse(window.localStorage.getItem('contacts'));
}


function remove(node) {
	node.parentNode.removeChild(node);
}


function createMenu(event) {
	new Jui('.menu').remove();  // Close open menus

	return new Jui(`<div class="menu shadow"></div>`)
	.css('left', `${event.clientX}px`)
	.css('top', `${event.clientY}px`)
	.appendTo(main);
}


function createPopup() {
	pageBlocker.removeClass('d-none');
	return new Jui('<div class="popup"></div>')
	.appendTo(main)
}


function closePopup() {
	pageBlocker.addClass('d-none');
	new Jui('.popup').remove();
}


function openMessagePanel() {
	messagePanel.removeClass('d-none');
	chatPanel.addClass('d-none');
}


function closeMessagePanel() {
	messagePanel.addClass('d-none');
	chatPanel.removeClass('d-none');
}


async function openChat(chat) {
	new Jui('.message').remove();
	new Jui('#contact-info h4').text('Loading chat...');

	const res = await fetch(`/api/v0.1/chats/${chat._id}/messages/`);

	if (!res.ok) {
		alert('Could not download messages');
	} else {
		for (const message of await res.json()) {
			addMessage(message);
		}

		new Jui('#contact-info h4').text(chat.name);
	}
}


function addChat(chat) {
	if (chat.type === 'chat') {
		const userID = chat.invitees[0] === getSession().userID ?
			chat.invitees[1] : chat.invitees[0];
		chat.name = getContacts().find(contact => contact._id === userID).name;
	}
	const chatElement = new Jui(`
		<div class="chat clickable border-bottom user-select-none p-3">
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
	.prop('data-id', chat._id)
	.appendTo(chatContainer)
	.addEventListener('click', openMessagePanel)
	.addEventListener('click', e => {
		if (!currentChat || currentChat._id !== chat._id) {
			openChat(chat)
		}
	})
	.addEventListener('click', chatEvent => currentChat = chat)
	chatElement.addEventListener('contextmenu', chatEvent => {
		chatEvent.preventDefault();
		chatEvent.handled = true;
		const menu = createMenu(chatEvent)
		if (chat.creator === getSession().userID) {
			menu.append(new Jui('<div class="menu-element">Delete chat</div>')
				.addEventListener('click', async menuEvent => {
					const res = await fetch('/api/v0.1/chats/' + chat._id + '/', {
						method: 'delete'
					});

					if (res.ok) {
						remove(chatEvent.target.closest('.chat'));
					}
				})
			);
			if (chat.type !== 'chat') {
				menu.append(new Jui('<div class="menu-element">Rename chat</div>')
					.addEventListener('click', menuEvent => {
						createPopup()
						.append(new Jui(`
						<form>
							<h2>Rename chat</h2>
							<label for="rename-chat-name">New chat name</label>
							<input id="rename-chat-name" type="text" autocomplete="off"
							 value="${chat.name}" placeholder="New name">
							<input type="submit" class="btn btn-success" value="Rename">
						</form>
					`)
						.addEventListener('submit', async formEvent => {
							formEvent.preventDefault();

							const name = new Jui('#rename-chat-name').val();
							const res = await fetch('/api/v0.1/chats/' + chat._id, {
								method: 'PATCH',
								headers: {
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({
									name: name
								})
							});

							if (!res.ok) {
								alert('Failed to update chat')
							} else {
								closePopup();
							}
						}))
					})
				)
			}
		}
	});

}


function addMessage(message) {
	new Jui(`
		<div class="message m-3 p-2 user-select-none
			${message.author === getSession().userID ? 'align-self-end' : ''}">
		<p class="message-text mt-2">
			${message.text}
		</p>
		<span class="message-time text-muted">
			${new Date(message.time).toLocaleString()}
		</span>
		<span class="message-edited text-muted">${message.edited ? ', edited' : ''}</span>
		</div>
	`)
	.prop('data-id', message._id)
	.appendTo(messageContainer)
	.addEventListener('click contextmenu', messageEvent => {
			messageEvent.handled = true;
			messageEvent.preventDefault();
			const menu = createMenu(messageEvent)

			if (message.author === getSession().userID) {
				menu.append(new Jui(`<div class="menu-element">Edit message</div>`)
					.addEventListener('click', async menuEvent => {
						createPopup()
						.append(new Jui(`
					<form>
						<h2>Edit message</h2>
						<label for="edit-message-text">New message</label>
						<input id="edit-message-text" type="text" autocomplete="off"
						 placeholder="New message" value="${message.text}">
						<input type="submit" class="btn btn-success" value="Update">
					</form>
				`)
						.addEventListener('submit', async formEvent => {
							formEvent.preventDefault();
							const text = new Jui('#edit-message-text').val();

							const res = await fetch('/api/v0.1/chats/' + currentChat._id
								+ '/messages/' + message._id + '/', {
								method: 'PUT',
								headers: {
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({
									text: text
								})
							})

							if (res.ok) {
								new Jui(`.message[data-id='${message._id}'] .message-text`)
								.text(text);
								new Jui(`.message[data-id='${message._id}'] .message-edited`)
								.text(', edited')
							}
							closePopup();
						}))
					})
				)
				menu.append(new Jui(`<div class="menu-element">Delete message</div>`)
					.addEventListener('click', async menuEvent => {
						const res = await fetch('/api/v0.1/chats/' + currentChat._id
							+ '/messages/' + message._id + '/', {
							method: 'delete'
						})

						if (res.ok) {
							remove(messageEvent.target.closest('.message'));
						}
					})
				)
			}
		}
	);
}


// Setting up page blocker
const pageBlocker = new Jui('#page-blocker')
.addEventListener('click', blockerEvent => {
	blockerEvent.currentTarget.classList.add('d-none');
	new Jui('.popup').remove();
});


// Setting up Settings button
const settingsButton = new Jui('#settings-button')
.addEventListener('click', buttonEvent => {
	alert('Settings');
});


// Setting up My Profile button
const myProfileButton = new Jui('#my-profile-button')
.addEventListener('click', buttonEvent => {
	alert('My Profile');
});


// Setting up New Chat button
const newButton = new Jui('#new-button')
.addEventListener('click', newButtonEvent => {
	newButtonEvent.handled = true;
	createMenu(newButtonEvent)
	.append(new Jui('<div class="menu-element">New chat</div>')
	.addEventListener('click', async menuEvent => {
		createPopup()
		.append(new Jui(`
			<form>
				<h2>New chat</h2>
				<label for="new-chat-contact">Select contact</label>
				<select id="new-chat-contact"></select>
				<input type="submit" class="btn btn-success" value="Create">
			</form>
		`).addEventListener('submit', async formEvent => {
			formEvent.preventDefault();
			const contactID = document.querySelector('#new-chat-contact')
				.selectedOptions[0].value

			const res = await fetch('/api/v0.1/chats/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					type: 'chat',
					contact: contactID
				})
			})

			closePopup();
		}))
		const contactSelect = new Jui('#new-chat-contact')
		for (const contact of getContacts()) {
			contactSelect.append(new Jui(`
				<option value="${contact._id}">
					${contact.name}
				</option>`))
		}
	}))
	.append(new Jui('<div class="menu-element">New group</div>')
		.addEventListener('click', menuEvent => {
			const popup = createPopup()
			.append(new Jui(`
				<form id="new-chat-form">
					<h2>Create new chat</h2>
					<label for="new-chat-name-input">New chat name</label>
					<input type="text" id="new-group-name" name="name" autocomplete="off">
					<label for="new-group-contacts">Select contacts</label>
					<select name="contact" id="new-group-contacts" multiple></select>
					<input type="submit" class="btn btn-success" value="Create">
				</form>
			`))

			.addEventListener('submit', async (event) => {
				event.preventDefault();
				const name = new Jui('#new-group-name').val();
				const contacts = [];
				const options = document.querySelector('#new-group-contacts')
					.selectedOptions
				for (let i = 0; i < options.length; ++i) {
					contacts.push(options[i].value)
				}
				if (!name) {
					alert('Chat name cannot be empty!');
				} else {
					const res = await fetch('/api/v0.1/chats/', {
						method: 'post',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							name: name,
							type: 'group',
							contacts: contacts
						})
					});
					addChat(await res.json());

					closePopup();
				}
			});
			for (const contact of getContacts()) {
				new Jui(`<option value="${contact._id}">${contact.name}</option>`)
				.appendTo('#new-group-contacts');
			}
		})
	)
	.append(new Jui('<div class="menu-element">New channel</div>'))
});


// Setting up Back button
const backButton = new Jui('#back-button')
.addEventListener('click', backEvent => {
	closeMessagePanel();
});


// Setting up Profile button
const contactProfileButton = new Jui('#contact-profile-button')
.addEventListener('click', buttonEvent => {
	alert('Profile');
});


// Setting up Send form
const newMessageForm = new Jui('#new-message-form')
.addEventListener('submit', async formEvent => {
	formEvent.preventDefault();
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


addEventListener('load', async e => {
	{
		const res = await fetch('/api/v0.1/contacts')
		if (res.ok) {
			window.localStorage.setItem('contacts', await res.text());
		}
	}

	{
		const res = await fetch('/api/v0.1/chats/');
		if (!res.ok) {
			alert('Failed to download chats');
		} else {
			for (const chat of await res.json()) {
				addChat(chat);
			}
		}
	}
});
