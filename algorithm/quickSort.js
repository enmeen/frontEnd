/**
 * 快速排序
 * 
 * 复杂度
 * 平均和最好O(nlogn) 
 * 最坏O(n^2)
 * 
 * 原理
 * 1. 从数组中“取出”一个基准（这样数组才会越来越少）
 * 2. 所有小于该基准的放到一边，大于该基准的放到另外一边
 * 3. 对于划分好的2边再次执行上述逻辑，直至子集中只包含一个元素时停止（递归和停止条件）
 * 
 * 思想
 * 1. 指针
 * 2. 分治思想
 * 3. 递归
 * 
 * 递推公式
 * f(nums)为返回排好序的nums数组
 * f(Left)为返回排好序的左边数据
 * 
 * f(nums) = f(Left).concat([midValue], f(Right))
 */

function quickSort(nums) {
    if (nums && nums.length <= 1) {
        return nums;
    }
    let mid = Math.floor(nums.length / 2);
    let midValue = nums.splice(mid, 1)[0]; 
    let L = [];
    let R = [];
    for (let i = 0; i < nums.length; i++) {
        let curr = nums[i];
        if (curr < midValue) {
            L.push(curr);
        } else {
            R.push(curr);
        }
    }
    return quickSort(L).concat([midValue], quickSort(R));
}

let testCase = [2, 3, 4, 1, 2, 3];

console.log(quickSort(testCase))