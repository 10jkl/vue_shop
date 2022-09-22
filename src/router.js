import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
Vue.use(Router)

 const router= new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home }
  ]
})
//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从那个路径跳转而来
  // next 是一个函数,表示放行
  // next() 放行 next('/login') 强制跳转
 if(to.path ==='/login') return next()
 const tokenstr = window.sessionStorage.getItem('token')
 if(!tokenstr) return next('/login'), alert('请登录')
 next()
})
export default router