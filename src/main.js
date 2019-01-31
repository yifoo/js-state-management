import "babel-polyfill";
import './assets/css/base.scss'
import './assets/css/main.scss'
import Router from '@/route/router'
let router = new Router()


// 可根据环境配置变量,如接口api
if(process.env.NODE_ENV === 'dev') {
  console.log('%c开发环境','color:red')
}else{
  console.log('%c生产环境','color:orange')
}