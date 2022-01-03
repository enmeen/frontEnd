import { Node } from "./node";


// 普通链表
export class LinkedList {
	head: Node | null;
	size: number;
	constructor() {
		this.head = null;
		this.size = 0;
	}
	find(element: string, index: number = 0): Node | null {
		if (this.head) {
			let currNode = this.head;
			let count = 0;
			while (currNode.element !== element && count < this.size) {
				// 找到element的node
				currNode = currNode.next as Node;
				count++;
			}
			count = 0;
			while (count < index && currNode.next) {
				// 向后偏移index，如果是null，则返回最后的节点
				currNode = currNode.next;
			}
			return currNode;
		}
		return null;
	}
	/**
	 * 查找并返回最后一个节点
	 */
	findLast(): Node | null {
		if (this.head) {
			let currNode = this.head;
			while (currNode.next) {
				currNode = currNode.next;
			}
			return currNode;
		}
		return null;
	}
	/**
	 * 1. 如果是head节点，则返回null
	 * 2. 如果不是head节点，则返回上一个node
	 * @param element
	 * @returns
	 */
	findPrevious(element: string): Node | null {
		if (this.head) {
			if (this.head.element === element) {
				return null;
			}
			let count = 0;
			let currNode = this.head;
			while (currNode.next && currNode.next.element !== element && count < this.size) {
				currNode = currNode.next;
			}
			return currNode;
		}
		return null;
	}
	private insertHead(node: Node) {
		this.head = node;
		this.size++;
	}
	private insertLast(node: Node) {
		let lastNode = this.findLast() as Node;
		lastNode.next = node;
		this.size++;
	}
	private insertMiddle(node: Node, element: string) {
		let currNode = this.find(element) as Node;
		let nextNode = currNode.next;
		currNode.next = node;
		node.next = nextNode;
		this.size++;
	}
	/**
	 * 1. 如果没有head节点，则成为head
	 * 2. 如果没有element，则插入到最后一个节点
	 * 3. 如果有element，则插入到对应element的节点之后，如果没有搜索到，则不做insert处理
	 * @param node
	 * @param element
	 */
	insert(node: Node, element?: string) {
		if (this.head) {
			if (element) {
				let currNode = this.find(element);
				if (currNode) {
					this.insertMiddle(node, element);
				}
			} else {
				this.insertLast(node);
			}
		} else {
			this.insertHead(node);
		}
	}
	/**
	 * 1. 如果是head节点，则移除后重新下一个node为指定head
	 * 2. 如果没有查找到对应节点，则不做处理
	 * 3. 如果查找到对应节点，则移除对应节点
	 * @param element
	 * @param index
	 * @returns
	 */
	remove(element: string, index: number = 0): Node | null {
		let currNode = this.find(element, index);
		if (currNode) {
			let previousNode = this.findPrevious(element); //  TODO 当传入 head节点时，返回了错误的node1
			let nextNode = currNode.next;
			if (previousNode) {
				previousNode.next = nextNode;
			} else {
				// 如果没有上一个node，则必为head
				this.head = nextNode;
			}
			this.size--;
		}
		return null;
	}
	display(): void {
		let content = "";
		let currNode = this.head;
		if (currNode) {
			while (currNode.next) {
				content += ` ${currNode.element}`;
				currNode = currNode.next;
			}
			content += ` ${currNode.element}`;
		}
		console.log(content);
	}
}
