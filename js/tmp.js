console.log('script start')

async function async1() {
  await async2()
  console.log('async1 end')
}
async function async2() {
  console.log('async2 end')
}
async1()

setTimeout(function () {
  console.log('setTimeout')
}, 0)

new Promise(resolve => {
  console.log('Promise')
  resolve()
})
  .then(function () {
    console.log('promise1')
  })
  .then(function () {
    console.log('promise2')
  })

console.log('script end')
/******************************* */

console.log('script start');

function async1() {
  async2().then(()=>{
    console.log('async1 end') // 后面执行
  })
}

function async2() {
  return new Promise((resolve) => {
    console.log('async2 end')
    resolve();
  })
}
async1()

setTimeout(function () {
  console.log('setTimeout')
}, 0);

new Promise(resolve => {
  console.log('Promise')
  resolve()
})
  .then(function () {
    console.log('promise1')
  })
  .then(function () {
    console.log('promise2')
  })

console.log('script end')