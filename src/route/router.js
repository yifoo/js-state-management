import store from '@/assets/lib/store'
export default class Router {
  constructor() {
    // 路由配置
    this.routes = {
      '/index': 'views/index',
      '/detail': 'views/detail/detail',
    }
    this.init()
  }
  init() {
    window.addEventListener('load', this.hashRefresh.bind(this), false);
    window.addEventListener('hashchange', this.hashRefresh.bind(this), false);
  }
  /**
   * hash路由刷新执行
   * @param {object} e 
   */
  hashRefresh(e) {
    // 获取当前路径,默认'/index'
    var currentURL = location.hash.slice(1).split('?')[0] || '/index';
    this.name = this.routes[currentURL]
    this.controller(this.name)
    this.navActive(currentURL)
  }
  /**
   * 组件控制器
   * @param {string} name 
   */
  controller(name) {
    store.getSubject().unsubscribe('stateChange')
    var Component = require('../' + name).default;
    new Component(document.querySelector('#main'))
  }
  /**
   * 导航激活显示
   * @param  item 当前router对象
   */
  navActive(item) {
    var navList = document.querySelectorAll('.tab .nav-item')
    for (var i = 0; i < navList.length; i++) {
      var href = navList[i].getAttribute("href")
      if ("#" + item === href) {
        navList[i].className = 'nav-item active'
      } else {
        navList[i].className = 'nav-item'
      }
    }
  }
}