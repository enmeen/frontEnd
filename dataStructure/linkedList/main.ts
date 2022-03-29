import { LinkedList } from "./linkedList";
import { Node } from "./node";

let linkedList = new LinkedList();
let node0 = new Node("node0");
let node1 = new Node("node1");
linkedList.insert(node0);
linkedList.insert(node1);
console.log(linkedList.size === 2);

linkedList.remove(node0.element);
console.log(linkedList.size === 1);
linkedList.display();
linkedList.remove(node1.element);
console.log(linkedList);
