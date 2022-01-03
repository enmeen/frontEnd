export class Node {
	element: string;
	next: Node | null;
	previous: Node | null;
	constructor(element: string) {
		this.element = element;
		this.next = null;
		this.previous = null;
	}
}
