'use strict';

function remove(node) {
	node.parentNode.removeChild(node);
}


export default class Jui {
	constructor(query) {
		if (!this) {
			throw new Error('Please call Jui constructor with the new keyword');
		}

		if (query instanceof Node) {
			this.nodes = [query];
		} else if (query instanceof NodeList) {
			this.nodes = Array.from(query);
		} else if (query.match(/^\s*<.*>\s*$/s)) {
			this.nodes = Array.from(new DOMParser()
				.parseFromString(query, 'text/html')
				.body
				.childNodes);
		} else {
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
		if (!html) {  // Get html
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
		if (!text) {  // Get text
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
		if (!value) {  // Get css
			return this.nodes[0].style[property];
		} else {  // Set css
			this.nodes.forEach(node => {
				node.style[property] = value;
			});
			return this;
		}
	}


	prop(propertyName, value) {
		if (!value) {  // Get property
			return this.nodes[0].getAttribute(propertyName);
		} else {  // Set property
			this.nodes.forEach(node => {
				node.setAttribute(propertyName, value);
			});
			return this;
		}
	}


	val(value) {
		if (!value) {  // Get value
			return this.nodes[0].value;
		} else {  // Set value
			this.nodes.forEach(node => {
				node.value = value;
			});
			return this;
		}
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


	addEventListener(type, handler) {
		this.nodes.forEach(node => {
			node.addEventListener(type, handler);
		});
		return this;
	}


	removeEventListener(type, handler) {
		this.nodes.forEach(node => {
			node.removeEventListener(type, handler);
		});
		return this;
	}


	remove() {
		this.nodes.forEach((node) => {
			remove(node);
		});
	}
}
