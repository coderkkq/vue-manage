import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to 将要访问的路径
  //from 代表从哪里来
  // next 是一个函数， 表示放行
  //  next() 放行，  next('/login') 强制跳转 
  if(to.path === '/login') return next()
  // 获取token (因为login组件已经从服务器获取了token，并将token设置到了客户端中，所以)
  const tokenStr = window.sessionStorage.getItem('token')
  // 判断tokenStr是否为空（为空强制跳转登录页面，不为空，就放行）
  if(!tokenStr) return next('login')
  next()
})

export default router
