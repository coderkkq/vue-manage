import Vue from 'vue'
import {  } from 'element-ui'

// 自定义导入（按需导入）
import { Button, Form, FormItem, Input, Message } from 'element-ui'

// 全局注册组件
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// Message组件比较特殊，需要全局挂载，$message（这是自定义的名字）
Vue.prototype.$message = Message