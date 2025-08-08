// mini-pinia.js
import { ref, reactive, computed, inject, effectScope } from 'vue'

// 用于提供Pinia实例的key
const piniaSymbol = Symbol('pinia')

// 创建全局store容器
export function createPinia() {
    // 使用ref创建响应式的state存储
    const state = ref({})

    // 创建一个存储所有store的Map
    const _stores = new Map()

    // 创建effectScope用于管理响应式效果
    const scope = effectScope(true)

    // 创建pinia实例
    const pinia = {
        state,
        _stores,
        _scope: scope,

        // Vue插件安装方法
        install(app) {
            // 提供pinia实例给应用中的所有组件
            app.provide(piniaSymbol, pinia)
        }
    }

    return pinia
}

// 定义store
export function defineStore(id, options) {
    // 返回一个函数，用于在组件中使用store
    return function useStore() {
        // 获取当前组件注入的pinia实例
        const pinia = inject(piniaSymbol)
        if (!pinia) throw new Error('请先通过 app.use(pinia) 安装 pinia')

        // 如果store已经存在，直接返回
        if (pinia._stores.has(id)) {
            return pinia._stores.get(id)
        }

        // 解构选项
        const { state: stateFn, getters, actions } = options

        // 创建store的状态
        function initState() {
            // 如果pinia中没有该store的状态，初始化它
            if (!pinia.state.value[id]) {
                pinia.state.value[id] = stateFn ? stateFn() : {}
            }

            // 返回响应式状态
            return reactive(pinia.state.value[id])
        }

        // 初始化状态
        const state = initState()

        // 创建getters
        const computedGetters = {}
        if (getters) {
            Object.keys(getters).forEach(key => {
                // 将每个getter转换为计算属性
                computedGetters[key] = computed(() => {
                    // 获取当前store作为getters的上下文
                    const store = pinia._stores.get(id)
                    // 调用getter并传入store作为this
                    return getters[key].call(store, store)
                })
            })
        }

        // 创建store实例
        const store = reactive({
            $id: id,

            // 修补状态的方法
            $patch(partialState) {
                if (typeof partialState === 'object') {
                    Object.keys(partialState).forEach(key => {
                        state[key] = partialState[key]
                    })
                }
            },

            // 重置状态方法
            $reset() {
                const newState = stateFn ? stateFn() : {}
                this.$patch(newState)
            },

            // 访问完整状态的属性
            get $state() {
                return state
            },
            set $state(newState) {
                this.$patch(newState)
            }
        })

        // 将state和getters合并到store对象
        Object.assign(store, state, computedGetters)

        // 将actions添加到store
        if (actions) {
            Object.keys(actions).forEach(key => {
                store[key] = function (...args) {
                    // 调用action并绑定this为store
                    return actions[key].apply(store, args)
                }
            })
        }

        // 存储创建的store
        pinia._stores.set(id, store)

        return store
    }
}

// ================ 使用示例 ================

// 以下代码用于演示，实际中需要在Vue组件环境中运行

/**
 * 创建一个用户store
 */
const useUserStore = defineStore('user', {
    // 状态
    state: () => ({
        name: '张三',
        age: 25,
        loggedIn: false
    }),

    // Getters (类似于computed)
    getters: {
        // 用户展示名
        displayName(store) {
            return `${store.name} (${store.age}岁)`
        },
        // 是否成年
        isAdult(store) {
            return store.age >= 18
        }
    },

    // Actions (可以包含异步逻辑)
    actions: {
        // 更新用户名
        updateName(newName) {
            this.name = newName
        },

        // 增加年龄
        incrementAge() {
            this.age++
        },

        // 模拟登录(异步操作)
        async login() {
            // 模拟API请求
            await new Promise(resolve => setTimeout(resolve, 1000))
            this.loggedIn = true
            console.log(`${this.name}登录成功!`)
        },

        // 重置用户状态
        logout() {
            this.$reset()
        }
    }
})

/**
 * 创建一个购物车store
 */
const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        total: 0
    }),

    getters: {
        itemCount(store) {
            return store.items.length
        },

        isEmpty(store) {
            return store.items.length === 0
        }
    },

    actions: {
        addItem(item) {
            this.items.push(item)
            this.updateTotal()
        },

        removeItem(id) {
            const index = this.items.findIndex(item => item.id === id)
            if (index > -1) {
                this.items.splice(index, 1)
                this.updateTotal()
            }
        },

        updateTotal() {
            this.total = this.items.reduce((sum, item) => sum + item.price, 0)
        },

        clearCart() {
            this.items = []
            this.total = 0
        }
    }
})

/**
 * 实际应用中的用法示例
 * 注释解释了在Vue应用中如何使用
 */

/*
// 在main.js中
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from './mini-pinia'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.mount('#app')

// 在组件中
import { useUserStore, useCartStore } from './stores'

export default {
  setup() {
    const userStore = useUserStore()
    const cartStore = useCartStore()
    
    // 使用store
    function handleLogin() {
      userStore.login()
    }
    
    function addProductToCart(product) {
      cartStore.addItem(product)
    }
    
    return {
      user: userStore,
      cart: cartStore,
      handleLogin,
      addProductToCart
    }
  }
}
*/