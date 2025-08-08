const patch = (oldVNode, newVNode, container, anchor)=>{
    // 打补丁，主要是属性、text等
    // 当 oldVNode === null 时，表示新增 newVNode，到 anchor 之前
}

const unmount = (vnode) => {
    // 卸载该节点，主要是移除节点，执行unmounted事件等
}

/**
 * 将 el 移动到 anchor 之前
 * 1. 如果 el 在 parent 子元素中已经存在，则变为移动操作
 * 2. 如果 anchor 为 null，则代表插入到末尾
 * 3. 比较早的API，兼容性比较好
 * @param {*} el 
 * @param {*} parent 
 * @param {*} anchor 
 */
const insert = (el, parent, anchor = null) => {
    parent.insertBefore(el, anchor)
}



/**
 * 第一种：简单diff算法
 * 相比最暴利的直接移除再生成有一定的优化，加入了通过移动复用dom的逻辑。
 * 但是移动的次数多，空间复杂度为 O(n^2)
 * @param {*} oldList 
 * @param {*} newList 
 * @param {*} container 
 */
function simpleDiff(oldList, newList, container) {
    // 要点：设置lastIndex用来存储遇到的最大值（已经处理过的元素中，在旧列表中位置最靠后的那个索引）
    // 如果出现更大的则不移动，出现更小的，则需要移动
    let lastIndex = 0;

    for(let i = 0; i < newList.length; i++) {
        const newVNode = newList[i];
        let isFound = false; 
        for(let j = 0; j < oldList.length; j++){
            const oldVNode = oldList[j];
            if(newVNode.key === oldVNode.key){
                patch(oldVNode, newVNode, container)
                // 需要移动
                if(j < lastIndex){
                    // 要点：如何移动呢？
                    // newList数组是我们需要的顺序。oldList数组是原来的顺序
                    // 我们已经知道了当前需要移动的元素为 newList[i];
                    // 把 newList[i] 插入到 newList[i-1] 后面即可
                    // 要注意是移动，所以可以用insertBefore方法
                    const prevVNode = newList[i - 1];
                    if(prevVNode){
                        const anchor = prevVNode.el.nextSibling;
                        insert(newVNode.el, container, anchor)
                    }else{
                        // 说明第一个，则不需要移动
                    }    
                } 
                // 不需要移动
                else {      
                    lastIndex = j
                }
                isFound = true;
                // 剩余的就跳过了，因为已经找到了
                break; 
            }
        }

        if(isFound){
            // TODO 新增元素
            patch(null, newVNode, container)
        }
    }
    // 删除多余的节点
    // 遍历oldList判断是否在newList存在，不存在则执行unmount移除
    for(let i = 0; i < oldList.length; i++){
        const oldVNode = oldList[i];
        const has = newList.find(vnode => vnode.key === oldVNode)
        if(!has){
            unmount(oldVNode)
        }
    }

}

/**
 * 第二种：双端diff算法
 */

const doubleEndedDiff = (oldList, newList, container) => {
    // 4个指针，分别指向新老数组的首和尾
    let oldStartIdx = 0, oldEndIdx = oldList.length - 1;
    let newStartIdx = 0, newEndIdx = newList.length - 1;
    
    let oldStartVNode = oldList[oldStartIdx]
    let oldEndVNode = oldList[oldEndIdx]
    let newStartVNode = oldList[newStartIdx]
    let newEndVNode = oldList[oldStartIdx]

    // 当 首部指针 越过了 尾部指针 时，则说明已经遍历完了
    while(oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx){
        if(!oldStartVNode){
            // 遇到undefined了，则跳过即可
            oldStartIdx ++
            oldStartVNode = oldStartVNode[oldStartIdx]
        }else if(oldStartVNode.key === newStartVNode.key){
            // 首首相等，复用只是不移动
            patch(oldStartVNode, newStartVNode, container)

            // 更新索引
            oldStartIdx ++
            newStartIdx ++
            oldStartVNode = oldList[oldStartIdx]
            newStartVNode = newList[newStartIdx]

        }else if(oldEndVNode.key === newEndVNode.key){
            // 尾尾相等，只是不移动
            patch(oldEndVNode, newEndVNode, container)

            // 更新索引
            oldEndIdx --
            newEndIdx --
            oldEndVNode = oldList[oldEndIdx]
            newEndVNode = newList[newEndIdx]

        }else if(oldStartVNode.key === newEndVNode.key){
            // 首尾相等，则将oldStartVNode移动到 newEndVNode的下一个兄弟元素之上
            patch(oldStartVNode, newEndVNode, container)
            // 移动到处理范围的最后面
            insert(oldStartVNode.el, container, newEndVNode.el.nextSibling)

            // 更新索引
            oldStartIdx ++
            newEndIdx --
            oldStartVNode = oldList[oldStartIdx]
            newEndVNode = newList[newEndIdx]

        }else if(oldEndVNode.key === newStartVNode.key){
            // 尾首相等，则将oldEndVNode移动到 newStartVNode的前面
            patch(oldEndVNode, newStartVNode, container)
            // 移动到处理范围的最前面
            insert(oldEndVNode.el, container, oldStartVNode.el)

            // 更新索引
            oldEndIdx --
            newStartIdx ++
            oldEndVNode = oldList[oldEndIdx]
            newStartVNode = newList[newStartIdx]

        }else {
            // 非理想情况 
            
            let idxInOld = -1;
            // 拿一个新数组的startVNode，去老数组遍历，看是否有可复用的
            for(let i = oldStartIdx; i < oldList.length; i++){
                if(newStartVNode.key === oldList[i].key){
                    idxInOld = i;
                }
            }
            if(idxInOld > -1){
                // 说明找到可复用的节点了
                patch(oldList[idxInOld], newStartVNode)

                insert(oldList[idxInOld].el, container, oldStartVNode.el)

                // 由于是for循环遍历找到的，所以不能直接移动指针，所以设置为undefined，表示移动过
                oldList[idxInOld] = undefined;
            }else{
                // 没找到，则为新增
                patch(null, newVNode, container, oldStartVNode.el)
            }
            
            // newStartIdx 指针往下走
            newStartIdx ++
            newStartVNode = newList[newStartIdx]

        }


        
    }

    // 双端遍历完了，处理剩余的。 假设新数组比旧数组多很多，那么双端diff完成后，就会剩下一部分的数据，要单独处理
    if(oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx){
        // 新增节点
        // 为什么while内部已经有新增处理了，外面还会需要写一个呢？因为有些场景下，走不到while内部的新增逻辑，这部分
        for(let i = newStartIdx; i <= newEndIdx; i++){
            patch(null, newList[i], container, oldStartVNode.el)
        }
    }else if(newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx){
        // 移除多余的老节点
        // 新数组都遍历完了，老数组有多的，则都移除
        for(let i = oldStartIdx; i <= oldEndIdx; i++){
            unmount(oldList[i])
        }
    }

}