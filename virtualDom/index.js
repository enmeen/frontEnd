// 1. Create a virtual representation of the DOM
// 2. Diff virtual DOM nodes
// 3. Apply a virtual DOM diff to an HTML element

// 虚拟DOM节点
const exampleButton = {
    tag: 'button',
    properties: {
        class: 'btn',
        type: 'button',
    },
    children: []
}

const exampleText = {
    text: 'hello world',
}

// 快速创建虚拟DOM节点的函数
const h = (tag, properties, children) => {
    return {
        tag,
        properties,
        children
    }
}

// 快速创建文本节点的函数
const text = (content) => {
    return {
        text: content
    }
}

const pauseScreen = h('div', {}, [
    h('h1', {}, 'Pause Screen'),
    h('p', {}, 'This is a pause screen'),
    h('button', {
        class: 'btn',
        type: 'button',
    }, 'Resume')
])



// diff 虚拟DOM节点

function diffOne(l, r) {
    const isText = l.text !== undefined;
    if (isText) {
        return r.text !== l.text ? { replace: r } : { noop: true };
    }

    if(l.tag !== r.tag) {
        return { replace: r }
    }

    const remove = [];
    for(const prop in l.properties){
        if(r[prop] === undefined){
            remove.push(prop);
        }
    }

    const set = {};
    for(const prop in r.properties){
        if(l.properties[prop] !== r.properties[prop]){
            set[prop] = r.properties[prop];
        }
    }

    const children = diffList(l.children, r.children)
    return {modify: {remove, set, children}}
}

function diffList(ls, rs){
    const len = Math.max(ls.length, rs.length);
    return Array.from({length: len}).map((_,i)=>{
        if(ls[i] === undefined){
            return {create: rs[i]}
        }
    })
}