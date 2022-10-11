import Vue from 'vue'

import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
import axios from 'axios'
import treeTable from 'vue-table-with-tree-grid'

//导入富文本编辑器
import  VueQuillEditor  from 'vue-quill-editor'
//导入富文本编辑器对应样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

//导入 Nprogress包对应的js和css(展示页面进度条)
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.prototype.$http=axios
//配置请求的跟路径
//http://127.0.0.1:8888/api/private/v1/
//https://lianghj.top:8888/api/private/v1/
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
 //axios请求拦截
 
//在request拦截器展示进度条Nprogress.start()
axios.interceptors.request.use(config=>{
  Nprogress.start()
  //为请求头对象,添加token验证的Authorization字段
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config
})
//在response拦截器隐藏进度条Nprogress.done()
axios.interceptors.response.use(config=>{
  Nprogress.done()
  return config
})



Vue.config.productionTip = false

//将vue-table-with-tree-grid依赖注册为全局组件
Vue.component('tree-table',treeTable)
//将富文本编辑器注册为全局组件
Vue.use(VueQuillEditor)


//定义全局时间过滤器
Vue.filter('dateFormat',function(time){
  //时间对象
 const dt= new Date(time)
// 年
const y=dt.getFullYear()
// 月,padStart(2,'0')函数如果月份不足两位，则在前面加个0
const m=(dt.getMonth()+1+'').padStart(2,'0')
// 日
const d=(dt.getDate()+'').padStart(2,'0')
// 时
const hh=(dt.getHours()+'').padStart(2,'0')
// 分
const mm=(dt.getMinutes()+'').padStart(2,'0')
// 秒
const ss=(dt.getSeconds()+'').padStart(2,'0')

return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
