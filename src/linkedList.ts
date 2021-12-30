// 普通链表

/**
 * 节点类
 */
export class Node {
	element: string;
	next: Node | null;
	constructor(element: string) {
		this.element = element;
		this.next = null;
	}
}

export class LinkedList {
	head: Node;
	constructor() {
		this.head = new Node("head");
	}
	find(item: string): Node {
		let currNode = this.head;
		while (currNode.element !== item) {
			currNode = currNode.next as Node;
		}
		return currNode;
	}
	insert(newElement: Node, item: string) {
		let currNode = this.find(item);
		let currNodeNext = currNode.next;
		currNode.next = newElement;
		newElement.next = currNodeNext;
	}
	display() {
		let currNode = this.head;
		while (currNode.next) {
			console.log(currNode.next.element);
			currNode = currNode.next;
		}
	}
	findPrevious(item: string): Node {
		let currNode = this.head;
		while (!(currNode.next == null) && currNode.next?.element !== item) {
			currNode = currNode.next;
		}
		return currNode;
	}
	remove(item: string) {
		let previousNode = this.findPrevious(item);
		let currNode = this.find(item);
		let nextNode = currNode.next;
		previousNode.next = nextNode;
	}
}

// use it

// const linkedList = new LinkedList();
// let node1 = new Node("node1");
// let node2 = new Node("node2");
// let node3 = new Node("node3");

// linkedList.insert(node1, linkedList.head.element);
// linkedList.insert(node2, node1.element);
// linkedList.insert(node3, node2.element);
// linkedList.remove('node2')

// linkedList.display();