/**
 * hash
 * 一般翻译做散列或者音译为哈希
 * 核心：是把任意长度的输入，通过“散列算法”变换成固定长度的输出，该输出就是散列值
 * 不同的输入可能会有相同的输出，所以不可能从散列值来确定唯一的输入值
 *
 * 主要是能够提高存储空间的利用率，可以提高数据的查询效率，或者做数字签名来保证数据传递的安全性（如http）
 *
 * 散列的重点知识在于 散列算法 以及 碰撞处理（开链法 和 线性探测法）
 *
 * 一、开链法
 * 实现原理👇
 * 如果碰到散列值相同，不是做覆盖，而是将底层数据结构转为数组，这样依然被保存在相同的位置（键）。同时将key 和 value都存进去
 * 伪代码如下：
 * 通过key转化成hash，做为索引。（需要散列函数，有不同的实现）
 * 然后将 key-value 配对放到对应索引下的数组中
 * 
 * 二、线性探测法
 * 
 */

class HashTable<T> {
	table: (number | string | Array<T>)[];
	constructor() {
		this.table = new Array(137); // 必须为质数（why）
	}
	simpleHash(data: string) {
		let total = 0;
		for (let i = 0; i < data.length; ++i) {
			total += data.charCodeAt(i);
		}
		return total % this.table.length;
	}
	betterHash(string: string, arr = this.table) {
		let total = 0;
		const H = 37;
		for (let i = 0; i < string.length; ++i) {
			total += H * total + string.charCodeAt(i);
		}
		total = total % arr.length;
		if (total < 0) {
			total += arr.length - 1;
		}
		return parseInt(String(total));
	}
	put(data: string) {
		let pos = this.betterHash(data);
		this.table[pos] = data;
	}
	showDistro() {
		let n = 0;
		for (let i = 0; i < this.table.length; ++i) {
			if (this.table[i] != undefined) {
				console.log(i + ": " + this.table[i]);
			}
		}
	}
	buildChain() {
		for (let i = 0; i < this.table.length; ++i) {
			this.table[i] = new Array();
		}
	}
}

let hashTable = new HashTable();
hashTable.buildChain();
hashTable.put("a");
hashTable.put("b");
hashTable.put("abc");
console.log(hashTable);
