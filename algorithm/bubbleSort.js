/**
 * 冒泡排序
 * 原理
 * 1. 依次比较2个相邻的数，如果不符合排序规则，则调换顺序。一遍下来，就能保证最小（大）的数排在最后
 * 2. 再对最后一位之外的数组，重复上面的过程
 * 复杂度
 * 
 * @param {*} arr 
 */
function bubbleSort(arr) {
    let len = arr.length;

    for (let i = 0; i < len; i++) {
        for (let j = 0, stop = len - 1 - i; j < stop; j++) {
            // 每次都减少最后一位遍历
            if (arr[j] > arr[j + 1]) {
                swap(arr, j, j + 1);
            }
        }
    }
}
/**
 * 交换arr中 p1 和 p2 的位置
 * @param {*} arr 
 * @param {*} p1 
 * @param {*} p2 
 */
function swap(arr, p1, p2) {
    let tmp = arr[p1];
    arr[p1] = arr[p2];
    arr[p2] = tmp;
}