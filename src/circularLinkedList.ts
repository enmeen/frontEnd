// 循环链表

/**
 * 由于循环链表的很多操作，需要有 head 头部节点，但是remove操作会存在删除head的情况，
 * 所以这里需要做特判，在删除head时，需要重新指定新的head
 */
export class Node {
	element: string;
	next: Node | null;
	constructor(element: string) {
		this.element = element;
		this.next = null;
	}
}

export class Cllist {
	head: Node;
	size: number;
	constructor() {
		this.head = new Node("0");
		this.head.next = this.head; // 将头指向尾
		this.size = 1;
	}
	find(item: string, beginNode = this.head): Node {
		let currNode = beginNode;
		let count = 0; // 防止陷入死循环，设置最大次数
		while (currNode.element !== item && count < this.size) {
			currNode = currNode.next as Node;
			count++;
		}
		return currNode;
	}
	insert(newElement: Node, item: string = this.head.element) {
		let currNode = this.find(item);
		let nextNode = currNode.next;
		currNode.next = newElement;
		newElement.next = nextNode;
		console.log("this.head", this.head);
		this.size++;
	}
	display() {
		let currNode = this.head;
		let count = 0;
		let printContent = `${currNode.element}`;
		while (!(currNode.next === null) && !(currNode.next === this.head) && count < this.size) {
			count++;
			// 要注意 head 有可能被移除，因为在循环链表里，其实没有head的说法了，所以最好是通过 size 去控制
			// console.log(currNode.next.element);
			printContent += ` ${currNode.next.element}`;
			currNode = currNode.next;
		}
		console.log(printContent);
	}
	findPrevious(item: string): Node {
		let currNode = this.head;
		while (!(currNode.next == null) && currNode.next?.element !== item) {
			currNode = currNode.next;
		}
		return currNode;
	}
	/**
	 * 移除item之后第index个节点
	 * @param item
	 * @param index
	 */
	remove(item: string, index: number = 0): Node {
		let currNode = this.find(item);
		let count = 0;
		while (count < index) {
			currNode = currNode.next as Node;
			count++;
		}
		let previousNode = this.findPrevious(currNode.element);
		let nextNode = currNode.next as Node;
		previousNode.next = nextNode;
		if (currNode === this.head) {
			// 核心代码：重新指定head
			this.head = nextNode;
		}
		this.size--;
		return nextNode;
	}
}

function solvePro() {
	let cllist = new Cllist();
	let n = 40; // 总人数n
    let m = 2; // 第m个人
    let left = 2; // 留下left个
	let item = "0";

	for (let i = 1; i < n; i++) {
		let previousNodeElement = `${i - 1}`;
		if (i - 1 < 0) {
			previousNodeElement = cllist.head.element;
		}
		cllist.insert(new Node(`${i}`), previousNodeElement);
	}

    // 总计n个人，开始 kill 每隔m个人，直至留下left个人
	while (cllist.size > left) {
		let nextNode = cllist.remove(item, m);
		item = nextNode.element;
		cllist.display();
	}
}

solvePro(cllist);
