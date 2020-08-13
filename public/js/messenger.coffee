'use strict';

import Jui from '/js/jui.js'


header = new Jui 'header'
	.remove()
footer = new Jui 'footer'
	.remove()

main = new Jui 'main'

chatPanel = new Jui '#chat-panel'
messagePanel = new Jui '#message-panel'
chatContainer = new Jui '#chat-container'
messageContainer = new Jui '#message-container'
dock = new Jui '.dock'

settingsButton = new Jui '#settings-button'
	.addEventListener 'click', -> alert 'Settings'
myProfileButton = new Jui '#my-profile-button'
	.addEventListener 'click', -> alert 'My Profile'
newChatButton = new Jui '#new-chat-button'
	.addEventListener 'click', -> alert 'New chat'
newGroupButton = new Jui '#new-group-button'
	.addEventListener 'click', -> alert 'New group'
backButton = new Jui '#back-button'
	.addEventListener 'click', ->
		messagePanel.addClass 'd-none'
		chatPanel.removeClass 'd-none'
contactProfileButton = new Jui '#contact-profile-button'
	.addEventListener 'click', -> alert 'Profile'
sendButton = new Jui '#send-button'
	.addEventListener 'click', -> alert 'Send'


addChat = (chat) ->
	new Jui "
					<div class='chat clickable border-bottom p-3'>
						<h4 class='chat-name mt-0'>
							#{chat.name}
						</h4>
						<span class='chat-time float-right ml-2'>
							#{if chat.messages[0] then chat.messages[0].time else ''}
						</span>
						<p class='mb-0'>
							#{if chat.messages[0] then chat.messages[0].text else 'No messages yet'}
						</p>
					</div>"
		.appendTo chatContainer
		.addEventListener 'click', ->
			res = await fetch "/api/v0.1/chats/#{chat._id}/messages/"

			messagePanel.removeClass 'd-none'
			chatPanel.addClass 'd-none'

			if not res.ok
				alert 'Could not download messages'
			else
				new Jui '.message'
					.remove()

				for message in await res.json()
					addMessage message
				new Jui '#contact-info h4'
					.text(chat.name)
				new Jui '#message-panel .header'
					.removeClass 'd-none'


addMessage = (message) ->
	new Jui "
		<div class='message my-2 px-3'>
			<p>
				#{message.text}
			</p>
			<span>
				#{message.time}
			</span>
		</div>"
		.appendTo messageContainer


addEventListener 'load', ->
	res = await fetch '/api/v0.1/chats/'

	if not res.ok
		alert 'Failed to download chats'
	else
		for chat in await res.json()
			addChat chat
