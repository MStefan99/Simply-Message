'use strict';

import Jui from '/js/jui.js'


header = new Jui 'header'
	.remove()
footer = new Jui 'footer'
	.remove()

main = new Jui 'main'

chatContainer = new Jui '#chat-container'
messageContainer = new Jui '#message-container'

settingsButton = new Jui '#settings-button'
	.addEventListener 'click', () -> alert 'Settings'
myProfileButton = new Jui '#my-profile-button'
	.addEventListener 'click', () -> alert 'My Profile'
newChatButton = new Jui '#new-chat-button'
	.addEventListener 'click', () -> alert 'New chat'
newGroupButton = new Jui '#new-group-button'
	.addEventListener 'click', () -> alert 'New group'
backButton = new Jui '#back-button'
	.addEventListener 'click', () ->
		messageContainer.addClass 'd-none'
		chatContainer.removeClass 'd-none'
contactProfileButton = new Jui '#contact-profile-button'
	.addEventListener 'click', () -> alert 'Profile'
sendButton = new Jui '#send-button'
	.addEventListener 'click', () -> alert 'Send'


chats = new Jui '.chat'
	.addEventListener 'click', () ->
		if screen.width < 768
			messageContainer.removeClass 'd-none'
			chatContainer.addClass 'd-none'
	.addClass('p-3')

new Jui '.chat p'
	.addClass 'mb-0'

new Jui '.chat h4'
	.addClass 'mt-0'

new Jui '.message'
	.addClass 'my-2', 'px-3'
