// Shared library by MStefan99

'use strict';


function remove(node) {
	node.parentNode.removeChild(node);
}


export default class Jui {
	constructor(query) {
		if (!this) {
			throw new Error('Please call Jui constructor with the new keyword');
		}

		if (query === null || query === undefined) {
			this.nodes = [];
		} else if (query instanceof Node) {  // If query is a node
			this.nodes = [query];
		} else if (query instanceof NodeList) {  // If query is a node list
			this.nodes = Array.from(query);
		} else if (query.match(/^\s*<.*>\s*$/s)) {  // If query is an HTML string
			query = query  // Removing whitespaces
			.replace(/^\s*|\s*$/g, '')
			.replace(/>\s*</g, '><')
			.replace(/[\t\n]+|\\ /g, ' ');

			if (query.match(/<tr|<td/)) {
				const table = document.createElement('table');
				table.innerHTML = query;

				if (query.match(/<tbody/)) {  // If query includes an html table
					this.nodes = Array.from(table.childNodes);  // Get table elements
				} else if (query.match(/<tr/)) {
					this.nodes = Array.from(table.childNodes[0].childNodes);  // Get tbody elements
				} else {
					this.nodes = Array.from(table.childNodes[0].childNodes[0].childNodes);  // Get first tr elements
				}
			} else {
				const div = document.createElement('div');
				div.innerHTML = query;

				this.nodes = Array.from(div.childNodes);
			}
		} else {  // If query is a selector
			this.nodes = Array.from(document.querySelectorAll(query));
		}
	}


	append(element) {
		if (!(element instanceof Jui)) {
			element = new Jui(element);
		}
		if (!this.nodes.length) {
			throw new Error('Trying to append to an empty object')
		}
		element.nodes.forEach(node => {
			this.nodes[0].appendChild(node);
		});
		return this;
	}


	appendTo(target) {
		if (!(target instanceof Jui)) {
			target = new Jui(target);
		}
		if (!target.nodes.length) {
			throw new Error('Trying to append to an empty object')
		}
		this.nodes.forEach(node => {
			target.nodes[0].appendChild(node);
		});
		return this;
	}


	replaceWith(newContent) {
		if (!(newContent instanceof Jui)) {
			newContent = new Jui(newContent);
		}
		if (!this.nodes.length) {
			throw new Error('Trying to append to an empty object')
		}
		this.nodes[0].replaceWith(newContent.nodes[0]);
		for (let i = 1; i < newContent.nodes.length; ++i) {
			this.nodes[0].parentNode.appendChild(newContent.nodes[i]);
		}
		return this;
	}


	html(html) {
		if (html === undefined) {  // Get html
			let html = '';

			this.nodes.forEach(node => {
				html += node.innerHTML;
			});
			return html;
		} else {  // Set html
			this.nodes.forEach(node => {
				node.innerHTML = html;
			});
			return this;
		}
	}


	text(text) {
		if (text === undefined) {  // Get text
			let text = '';

			this.nodes.forEach(node => {
				text += node.innerText;
			});
			return text;
		} else {  // Set text
			this.nodes.forEach(node => {
				node.innerText = text;
			});
			return this;
		}
	}


	css(property, value) {
		if (value === undefined) {  // Get style
			return this.nodes[0].style[property];
		} else {  // Set style
			this.nodes.forEach(node => {
				node.style[property] = value;
			});
			return this;
		}
	}


	attr(attributeName, value) {
		if (value === undefined) {  // Get attribute
			return this.nodes[0].getAttribute(attributeName);
		} else {  // Set attribute
			this.nodes.forEach(node => {
				node.setAttribute(attributeName, value);
			});
			return this;
		}
	}


	removeAttr(attributeName) {
		this.nodes.forEach(node => {
			node.removeAttribute(attributeName);
		});
		return this;
	}


	prop(propertyName, value) {
		if (value === undefined) {  // Get property
			return this.nodes[0][propertyName];
		} else {  // Set property
			this.nodes.forEach(node => {
				node[propertyName] = value;
			});
			return this;
		}
	}


	removeProp(propertyName) {
		this.nodes.forEach(node => {
			node[propertyName] = undefined;
		});
		return this;
	}


	val(value) {
		if (value === undefined) {  // Get value
			return this.nodes[0].value;
		} else {  // Set value
			this.nodes.forEach(node => {
				node.value = value;
			});
			return this;
		}
	}


	closest(selector) {
		const elements = new Jui();

		this.nodes.forEach(node => {
			const closest = node.closest(selector);

			if (closest) {
				elements.nodes.push(closest);
			}
		});
		return elements;
	}


	addClass(...classNames) {
		this.nodes.forEach(node => {
			node.classList.add(...classNames);
		});
		return this;
	}


	hasClass(className) {
		this.nodes.forEach(node => {
			if (node.classList.contains(className)) {
				return true;
			}
		});
		return false;
	}


	toggleClass(className) {
		this.nodes.forEach(node => {
			node.classList.toggle(className);
		});
		return this;
	}


	removeClass(...classNames) {
		this.nodes.forEach(node => {
			node.classList.remove(...classNames);
		});
		return this;
	}


	forEach(predicate) {
		this.nodes.forEach(node => predicate(node));
	}


	if(condition, ifTrue, ifFalse) {
		if (condition) {
			if (ifTrue) {
				return ifTrue(this);
			} else {
				return this;
			}
		} else {
			if (ifFalse) {
				return ifFalse(this);
			} else {
				return this;
			}
		}
	}


	on(events, handler) {
		this.nodes.forEach(node => {
			events.split(' ').forEach(event => {
				node.addEventListener(event, handler);
			});
		});
		return this;
	}


	off(events, handler) {
		this.nodes.forEach(node => {
			events.split(' ').forEach(event => {
				node.removeEventListener(event, handler);
			});
		});
		return this;
	}


	toString() {
		let html = '';
		this.nodes.forEach(node => html += node.innerHTML);
		return html;
	}


	remove() {
		this.nodes.forEach(node => {
			remove(node);
		});
	}
}
