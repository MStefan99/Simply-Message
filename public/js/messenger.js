'use strict';


import Jui from '/js/jui.js';


let currentChat;

const header = new Jui('header').remove();
const footer = new Jui('footer').remove();
const main = new Jui('main')
	.on('click contextmenu', mainEvent => {
		if (!mainEvent.handled) {  // Close context menus if needed
			new Jui('.menu').remove();
		}
	});
const settingsPanel = new Jui('#settings-panel');
const chatPanel = new Jui('#chat-panel');
const messagePanel = new Jui('#message-panel');
const detailsPanel = new Jui('#details-panel');
const chatContainer = new Jui('#chat-container');
const messageContainer = new Jui('#message-container');
const messageInput = new Jui('#message-input');


function arrayBufferToBase64(buffer) {
	let binary = '';
	let bytes = new Uint8Array(buffer);
	let len = bytes.byteLength;
	for (let i = 0; i < len; ++i) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}


function base64ToArrayBuffer(base64) {
	let binary_string = window.atob(base64);
	let len = binary_string.length;
	let bytes = new Uint8Array(len);
	for (let i = 0; i < len; ++i) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
}


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
		.appendTo(main);
}


function closePopup() {
	pageBlocker.addClass('d-none');
	new Jui('.popup').remove();
}


function openPanel(panel) {
	switch (panel) {
		case 'message':
			messagePanel.removeClass('d-none');
			settingsPanel.addClass('d-none');
			detailsPanel.addClass('d-none');
			break;
		case 'settings':
			settingsPanel.removeClass('d-none');
			detailsPanel.addClass('d-none');
			break;
		case 'details':
			detailsPanel.removeClass('d-none');
			messagePanel.addClass('d-none');
			settingsPanel.addClass('d-none');
			break;
		default:
			throw new Error('No such panel');
			break;
	}
	chatPanel.addClass('d-none');
}


function closePanel(panel) {
	switch (panel) {
		case 'message':
			messagePanel.addClass('d-none');
			detailsPanel.addClass('d-none');
			chatPanel.removeClass('d-none');
			break;
		case 'settings':
			settingsPanel.addClass('d-none');
			chatPanel.removeClass('d-none');
			break;
		case 'details':
			detailsPanel.addClass('d-none');
			messagePanel.removeClass('d-none');
			break;
		default:
			throw new Error('No such panel');
			break;
	}
}


async function openChat(chat) {
	new Jui('.message').remove();
	new Jui('#contact-info h4').text('Loading chat...');
	const messageInput = new Jui('#message-input');
	const sendButton = new Jui('#send-button');

	const res = await fetch(`/api/v0.1/chats/${chat._id}/messages/`);

	if (!res.ok) {
		alert('Could not download messages');
	} else {
		if (currentChat.secure) {
			if (!localStorage.getItem(currentChat._id + '_secret')) {
				messageInput
					.attr('disabled', true)
					.val('Waiting for another user to accept...');
				sendButton
					.attr('disabled', true);
			}
		} else {
			messageInput
				.removeAttr('disabled', false)
				.val(null);
			sendButton
				.removeAttr('disabled');
		}

		for (const message of await res.json()) {
			addMessage(message, currentChat);
		}

		new Jui('#chat-name').text(chat.name);
		const lastSeen = new Jui('#last-seen');
		if (chat.type !== 'chat') {
			lastSeen.text('');
		} else {
			lastSeen.text('Last seen at');
		}
	}
}


async function addChat(chat) {
	const lastMessage = chat.messages[0];
	if (chat.secure && !localStorage.getItem(chat._id + '_secret')) {
		console.warn('Encryption key for chat', chat._id, 'lost!');
		return;
	}

	if (chat.type === 'chat') {
		const userID = chat.invitees[0] === getSession().userID?
			chat.invitees[1] : chat.invitees[0];
		chat.name = getContacts().find(contact => contact._id === userID).name;
	}
	if (lastMessage && chat.secure) {
		const key =
			await crypto.subtle.importKey('jwk',
				JSON.parse(localStorage.getItem(chat._id + '_secret')),
				{
					name: 'AES-GCM',
					length: 256
				},
				true,
				['decrypt']
			);

		lastMessage.text = new TextDecoder().decode(
			await crypto.subtle.decrypt(
				{
					name: 'AES-GCM',
					iv: base64ToArrayBuffer(lastMessage.iv)
				},
				key,
				base64ToArrayBuffer(lastMessage.text)
			));
	}
	const chatElement = new Jui(`
		<div class="chat clickable border-bottom user-select-none p-3">
			<div class="chat-line chat-line-1 mb-3">
				<h4 class="chat-name my-0">
					${chat.name}
				</h4>
				<span class="chat-type text-muted">
					${chat.secure? 'secure' : ''} ${chat.type}
				</span>
			</div>
			<div class="chat-line chat-line-2">
				<p class="chat-last-message m-0">
					${chat.messages[0]? chat.messages[0].text : '<i>No messages yet</i>'}
				</p>
				<span class="chat-time ml-2">
					${chat.messages[0]? new Date(chat.messages[0].time).toLocaleString() : ''}
				</span>
			</div>
		</div>
		`)
		.attr('data-id', chat._id)
		.appendTo(chatContainer)
		.on('click', () => openPanel('message'))
		.on('click', e => {
			if (!currentChat || currentChat._id !== chat._id) {
				openChat(chat);
			}
		})
		.on('click', chatEvent => currentChat = chat);
	chatElement.on('contextmenu', chatEvent => {
		chatEvent.preventDefault();
		chatEvent.handled = true;
		const menu = createMenu(chatEvent);
		if (chat.creator === getSession().userID) {
			if (chat.type !== 'chat') {
				menu.append(new Jui('<div class="menu-element">Rename chat</div>')
					.on('click', menuEvent => {
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
								.on('submit', async formEvent => {
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
									closePopup();

									if (res.ok) {
										new Jui(`.chat[data-id='${chat._id}'] .chat-name`)
											.text(name);
									}
								}));
					})
				);
			}
			menu.append(new Jui('<div class="menu-element">Delete chat</div>')
				.on('click', async menuEvent => {
					const res = await fetch('/api/v0.1/chats/' + chat._id + '/', {
						method: 'delete'
					});

					if (res.ok) {
						remove(chatEvent.target.closest('.chat'));
					}
				})
			);
		}
	});
}


async function addMessage(message, chat) {
	if (chat.secure) {
		const key =
			await crypto.subtle.importKey('jwk',
				JSON.parse(localStorage.getItem(currentChat._id + '_secret')),
				{
					name: 'AES-GCM',
					length: 256
				},
				true,
				['decrypt']
			);

		message.text = new TextDecoder().decode(
			await crypto.subtle.decrypt(
				{
					name: 'AES-GCM',
					iv: base64ToArrayBuffer(message.iv)
				},
				key,
				base64ToArrayBuffer(message.text)
			));
	}

	new Jui(`
		<div class="message m-3 p-2 user-select-none
			${message.author === getSession().userID? 'align-self-end' : ''}">
		<p class="message-text mt-2">
			${message.text}
		</p>
		<span class="message-time text-muted">
			${new Date(message.time).toLocaleString()}
		</span>
		<span class="message-edited text-muted">${message.edited? ', edited' : ''}</span>
		</div>
	`)
		.attr('data-id', message._id)
		.appendTo(messageContainer)
		.on('click contextmenu', messageEvent => {
				messageEvent.handled = true;
				messageEvent.preventDefault();
				const menu = createMenu(messageEvent);

				if (message.author === getSession().userID) {
					menu.append(new Jui(`<div class="menu-element">Edit message</div>`)
						.on('click', async menuEvent => {
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
									.on('submit', async formEvent => {
										formEvent.preventDefault();
										const text = new Jui('#edit-message-text').val();
										let content = text;

										if (chat.secure) {
											const key = await crypto.subtle.importKey('jwk',
												JSON.parse(localStorage.getItem(currentChat._id + '_secret')),
												{
													name: 'AES-GCM',
													length: 256
												},
												true,
												['encrypt', 'decrypt']
											);

											content = arrayBufferToBase64(
												await crypto.subtle.encrypt(
													{
														name: 'AES-GCM',
														iv: base64ToArrayBuffer(message.iv)
													},
													key,
													new TextEncoder().encode(text)
												));
										}

										const res = await fetch('/api/v0.1/chats/' + currentChat._id
											+ '/messages/' + message._id + '/', {
											method: 'PUT',
											headers: {
												'Content-Type': 'application/json'
											},
											body: JSON.stringify({
												text: content
											})
										});

										if (res.ok) {
											new Jui(`.message[data-id='${message._id}'] .message-text`)
												.text(text);
											new Jui(`.message[data-id='${message._id}'] .message-edited`)
												.text(', edited');
										}
										closePopup();
									}));
						})
					);
					menu.append(new Jui(`<div class="menu-element">Delete message</div>`)
						.on('click', async menuEvent => {
							const res = await fetch('/api/v0.1/chats/' + currentChat._id
								+ '/messages/' + message._id + '/', {
								method: 'delete'
							});

							if (res.ok) {
								remove(messageEvent.target.closest('.message'));
							}
						})
					);
				}
			}
		);
}


// Setting up page blocker
const pageBlocker = new Jui('#page-blocker')
	.on('click', blockerEvent => {
		blockerEvent.currentTarget.classList.add('d-none');
		new Jui('.popup').remove();
	});


// Setting up Settings button
const settingsButton = new Jui('#settings-button')
	.on('click', buttonEvent => {
		openPanel('settings');
	});


// Setting up My Profile button
const myProfileButton = new Jui('#my-profile-button')
	.on('click', buttonEvent => {
		alert('My Profile');
	});


// Setting up New Chat button
const newButton = new Jui('#new-button')
	.on('click', newButtonEvent => {
		newButtonEvent.handled = true;
		createMenu(newButtonEvent)
			.append(new Jui('<div class="menu-element">New chat</div>')
				.on('click', async menuEvent => {
					createPopup()
						.append(new Jui(`
			<form>
				<h2>New chat</h2>
				<div class="form-group">
					<label for="new-chat-contact">Select contact</label>
					<select id="new-chat-contact"></select>
				</div>
				<div class="form-check">
					<input id="new-chat-secure" type="checkbox"></input>
					<label for="new-chat-secure">Secure</label>
				</div>
				<input type="submit" class="btn btn-success" value="Create">
			</form>
		`).on('submit', async formEvent => {
							formEvent.preventDefault();
							const contactID = document.querySelector('#new-chat-contact')
								.selectedOptions[0].value;
							const secure = document.getElementById('new-chat-secure').checked;

							let keys;
							if (secure) {
								keys = await window.crypto.subtle.generateKey(
									{
										name: 'ECDH',
										namedCurve: 'P-384'
									},
									true,
									['deriveKey']
								);
							}

							const res = await fetch('/api/v0.1/chats/', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({
									type: 'chat',
									contact: contactID,
									secure,
									pubKey: secure? await crypto.subtle.exportKey('jwk', keys.publicKey) : undefined
								})
							});
							const chat = await res.json();
							addChat(chat);
							if (secure) {
								localStorage.setItem(chat._id + '_privKey',
									JSON.stringify(await crypto.subtle.exportKey('jwk', keys.privateKey)));
							}

							closePopup();
						}));
					const contactSelect = new Jui('#new-chat-contact');
					for (const contact of getContacts()) {
						contactSelect.append(new Jui(`
				<option value="${contact._id}">
					${contact.name}
				</option>`));
					}
				}))
			.append(new Jui('<div class="menu-element">New group</div>')
				.on('click', menuEvent => {
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

						.on('submit', async (event) => {
							event.preventDefault();
							const name = new Jui('#new-group-name').val();
							const contacts = [];
							const options = document.querySelector('#new-group-contacts')
								.selectedOptions;
							for (let i = 0; i < options.length; ++i) {
								contacts.push(options[i].value);
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
			.append(new Jui('<div class="menu-element">New channel</div>'));
	});


// Setting up Back buttons
new Jui('#settings-back-button')
	.on('click', backEvent => {
		closePanel('settings');
	});
new Jui('#message-back-button')
	.on('click', backEvent => {
		closePanel('message');
	});
new Jui('#details-back-button')
	.on('click', backEvent => {
		closePanel('details');
	});


// Setting up Profile button
const detailsButton = new Jui('#details-button')
	.on('click', buttonEvent => {
		openPanel('details');
	});


// Setting up Send form
const newMessageForm = new Jui('#new-message-form')
	.on('submit', async formEvent => {
		formEvent.preventDefault();
		let text = messageInput.val();
		const iv = window.crypto.getRandomValues(new Uint8Array(12));

		if (currentChat.secure && localStorage.getItem(currentChat._id + '_secret')) {
			const key = await crypto.subtle.importKey('jwk',
				JSON.parse(localStorage.getItem(currentChat._id + '_secret')),
				{
					name: 'AES-GCM',
					length: 256
				},
				true,
				['encrypt', 'decrypt']
			);

			text = arrayBufferToBase64(
				await crypto.subtle.encrypt(
					{
						name: 'AES-GCM',
						iv: iv
					},
					key,
					new TextEncoder().encode(messageInput.val())
				));
		}
		const res = await fetch(`/api/v0.1/chats/${currentChat._id}/messages/`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				text: text,
				iv: currentChat.secure? arrayBufferToBase64(iv) : undefined
			})
		});

		new Jui(`.chat[data-id='${currentChat._id}'] p.chat-last-message`)
			.text(messageInput.val());
		new Jui(`.chat[data-id='${currentChat._id}'] span.chat-time`)
			.text(new Date().toLocaleString());
		messageInput.val('');
		addMessage(await res.json(), currentChat);
	});


addEventListener('load', async e => {
	{
		const res = await fetch('/api/v0.1/contacts');
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

				if (chat.aPubKey && chat.creator !== getSession().userID) {
					const keys = await window.crypto.subtle.generateKey(
						{
							name: 'ECDH',
							namedCurve: 'P-384'
						},
						true,
						['deriveKey']
					);

					const secret = await crypto.subtle.deriveKey(
						{
							name: 'ECDH',
							public: await crypto.subtle.importKey('jwk',
								chat.aPubKey,
								{
									name: 'ECDH',
									namedCurve: 'P-384'
								},
								false,
								[]
							)
						},
						keys.privateKey,
						{
							name: 'AES-GCM',
							length: 256
						},
						true,
						['encrypt', 'decrypt']
					);
					localStorage.setItem(chat._id + '_secret', JSON.stringify(await crypto.subtle
						.exportKey('jwk', secret)));

					fetch(`/api/v0.1/chats/${chat._id}`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							bPubKey: await crypto.subtle.exportKey('jwk', keys.publicKey)
						})
					});
				} else if (chat.bPubKey && chat.creator === getSession().userID) {
					const secret = await crypto.subtle.deriveKey(
						{
							name: 'ECDH',
							public: await crypto.subtle.importKey('jwk',
								chat.bPubKey,
								{
									name: 'ECDH',
									namedCurve: 'P-384'
								},
								false,
								[]
							)
						},
						await crypto.subtle.importKey('jwk',
							JSON.parse(localStorage.getItem(chat._id + '_privKey')),
							{
								name: 'ECDH',
								namedCurve: 'P-384'
							},
							false,
							['deriveKey']
						),
						{
							name: 'AES-GCM',
							length: 256
						},
						true,
						['encrypt', 'decrypt']
					);
					localStorage.removeItem(chat._id + '_privKey');
					localStorage.setItem(chat._id + '_secret', JSON.stringify(await crypto.subtle
						.exportKey('jwk', secret)));

					fetch(`/api/v0.1/chats/${chat._id}`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							noPubKey: true
						})
					});
				}
			}
		}
	}
});
