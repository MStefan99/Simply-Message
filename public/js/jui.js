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
			this.nodes = Array.from(new DOMParser()
				.parseFromString(query
					.replace(/^\s*|\s*$|(>)\s*|\s*(<)/g, '$1$2'),  // Removing whitespaces
					'text/html')
				.body
				.childNodes);
		} else {  // If query is a selector
			this.nodes = Array.from(document
				.querySelectorAll(query));
		}
	}


	append(element) {
		if (!(element instanceof Jui)) {
			element = new Jui(element);
		}
		if (!this.nodes.length) {
			throw new Error('Trying to append to an empty object')
		}
		element.nodes.forEach((node) => {
			this.nodes[this.nodes.length - 1].appendChild(node);
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
		this.nodes.forEach((node) => {
			target.nodes[target.nodes.length - 1].appendChild(node);
		});
		return this;
	}


	html(html) {
		if (html === undefined) {  // Get html
			let html = '';

			this.nodes.forEach((node) => {
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

			this.nodes.forEach((node) => {
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
		if (value === undefined) {  // Get css
			return this.nodes[0].style[property];
		} else {  // Set css
			this.nodes.forEach(node => {
				node.style[property] = value;
			});
			return this;
		}
	}


	prop(propertyName, value) {
		if (value === undefined) {  // Get property
			return this.nodes[0].getAttribute(propertyName);
		} else {  // Set property
			this.nodes.forEach(node => {
				node.setAttribute(propertyName, value);
			});
			return this;
		}
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


	addEventListener(events, handler) {
		this.nodes.forEach(node => {
			events.split(' ').forEach(event => {
				node.addEventListener(event, handler);
			});
		});
		return this;
	}


	removeEventListener(events, handler) {
		this.nodes.forEach(node => {
			events.split(' ').forEach(event => {
				node.removeEventListener(event, handler);
			});
		});
		return this;
	}


	remove() {
		this.nodes.forEach((node) => {
			remove(node);
		});
	}
}
