import Vue from 'vue'
import Router from 'vue-router'


// 当打包构建应用时 JavaScript 包会变得非常大，
// 影响页面加载。
// 如果我们能把不同路由对应的组件分割成不同的代码块，
// 然后当路由被访问的时候才加载对应组件，这样就会更加高效

//import Login from './components/Login.vue' 
//import Welcome from './components/Welcome.vue'
//import Home from './components/Home.vue'

// 路由懒加载
const Login = () =>
  import(/* webpackChunkName: "login_home_welcome" */ './components/Login.vue')
const Home = () =>
  import(/* webpackChunkName: "login_home_welcome" */ './components/Home.vue')
const Welcome = () =>
  import(/* webpackChunkName: "login_home_welcome" */ './components/Welcome.vue')

// import Users from './components/user/Users.vue'
// import Rights from './components/power/Rights.vue'
// import Roles from './components/power/Roles.vue'

const Users = () =>
  import(/* webpackChunkName: "Users_Rights_Roles" */ './components/user/Users.vue')
const Rights = () =>
  import(/* webpackChunkName: "Users_Rights_Roles" */ './components/power/Rights.vue')
const Roles = () =>
  import(/* webpackChunkName: "Users_Rights_Roles" */ './components/power/Roles.vue')

// import Gate from './components/goods/Gate.vue'
// import Params from './components/goods/Params.vue'
const Gate = () =>
  import(/* webpackChunkName: "Gate_Params" */ './components/goods/Gate.vue')
const Params = () =>
  import(/* webpackChunkName: "Gate_Params" */ './components/goods/Params.vue')

// import List from './components/goods/List.vue'
// import Add from './components/goods/Add.vue'

const List = () =>
   import(/* webpackChunkName: "List_Add" */ './components/goods/List.vue')
const Add = () =>
   import(/* webpackChunkName: "List_Add" */ './components/goods/Add.vue')

// import Order from './components/order/Order.vue'
// import Report from './components/report/Report.vue'

const Order = () =>
   import(/* webpackChunkName: "Order_Report" */ './components/order/Order.vue')
const Report = () =>
   import(/* webpackChunkName: "Order_Report" */ './components/report/Report.vue')

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home, redirect: '/welcome',
    children: [
      { path: '/welcome', component :Welcome},
      { path: '/users', component :Users},
      { path: '/rights', component :Rights},
      { path: '/roles', component :Roles},
      { path: '/categories', component :Gate},
      { path: '/params', component :Params},
      { path: '/goods', component :List},
      { path: '/goods/add', component :Add},
      { path: '/orders', component :Order},
      { path: '/reports', component :Report},
      
    
    ]},
  ]
})
//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从那个路径跳转而来
  // next 是一个函数,表示放行
  // next() 放行 next('/login') 强制跳转
  if (to.path === '/login') return next()
    const tokenstr = window.sessionStorage.getItem('token')
  if (!tokenstr) return next('/login'), alert('请登录')
    next()
}) 

export default router
