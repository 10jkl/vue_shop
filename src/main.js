import Vue from 'vue'

import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
import axios from 'axios'
import treeTable from 'vue-table-with-tree-grid'

Vue.prototype.$http=axios
//配置请求的跟路径
//http://127.0.0.1:8888/api/private/v1/
//https://lianghj.top:8888/api/private/v1/
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1'
 //axios请求拦截
axios.interceptors.request.use(config=>{
  //为请求头对象,添加token验证的Authorization字段
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config
})
Vue.config.productionTip = false

//将vue-table-with-tree-grid依赖注册为全局组件
Vue.component('tree-table',treeTable)
 

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
