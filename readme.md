## js-state-management    [Demo](http://test.haohome.top/webpack-spa/#/state)

> 一次偶然在掘金看到一位大大分享了老外写的js状态管理文章,通读后就决定自己也写一遍,目的是了解状态管理的内部机制.

当前的项目多数以组件化开发,状态管理库使得组件间状态管理变得非常方便。

### 1. 订阅发布模块

这个模块实际上是观察者模式,是一种一对多的依赖关系,当对象的某种状态发生改变,所有依赖它的对象都将得到通知,触发已经注册的事件.

在主题`Subject`类中首先定义`this.eventList`保存需要注册的事件,依次添加`subscribe`(订阅)、`unsubscribe`（取消订阅）、·`publish`（发布订阅）等方法

`subscribe`和`unsubscribe`的两个参数:`name`代表注册事件的唯一名字,`fn`为事件`name`的回调函数,表示所有`fn`方法都注册到名为`name`的集合下

```JavaScript
class Subject {
  constructor() {
    this.eventList = []
  }
  /**
   * 订阅主题
   * @param {string} name 事件名称
   * @param {function} fn 事件方法
   */
  subscribe(name, fn) {
    if (!this.eventList.hasOwnProperty(name)) {
      this.eventList[name] = []
    }
    this.eventList[name].push(fn)
    console.log('this.eventList: ', this.eventList);
  }
  /**
   * 取消订阅主题
   * @param {string} name 事件名称
   * @param {function} fn 事件方法
   */
  unsubscribe(name, fn) {
    var fns = this.eventList[name];
    if (!fns || fns.length == 0) { // 如果没有订阅该事件,直接返回
      return false
    }
    if (!fn) { // 如果传入具体函数,表示取消所有对应name的订阅
      fns.length = 0
    } else {
      for (var i = 0; i < fns.length; i++) {
        if (fn == fns[i]) {
          fns.splice(i, 1);
        }
      }
    }
  }
  /**
   * 发布主题,触发订阅事件
   */
  pulish() {
    var name = Array.prototype.shift.call(arguments)	// 获取事件名称
    var fns = this.eventList[name]
    if (!fns || fns.length == 0) { // 没有订阅该事件
      return false
    }
    for (var i = 0, fn; i < fns.length; i++) {
      fn = fns[i]
      fn.apply(this, arguments)
    }
  }
}
```

对于观察者类,传入主题、事件名称、事件方法，目的是将事件注册到相应主题上:

```JavaScript
class Observer {
  constructor(subject, name, fn) {
    this.subject = subject
    this.name = name
    this.subject.subscribe(name, fn)
  }
}
```

### 2. 核心`LibStore`类

核心`LibStore`类需要引入上面的订阅发布模块的主题类,状态管理个人理解为一个单例化的主题,所有的状态事件都在同一个主题下进行订阅发布,因此实例化一次`Subject`即可。同时需要对`state`数据进行监听和赋值,创建`LibStore`类需要传入参数`params`,从参数中获取`actions`、`mutations`,或者默认为{}

```JavaScript
constructor(params){
  var _self = this
  this._subject = new Subject()
  this.mutations = params.mutations ? params.mutations : {}
	this.actions = params.actions ? params.actions : {}
}
```

为了判`LibStore`对象在任意时刻的状态,需要定义`status`用来记录,状态有三种:

```JavaScript
this.status = 'resting';
this.status = 'mutation'; 
this.status = 'action';
```

存放数据`state`也会从`params`传入,但为了监听`LibStore`中存储的数据变化,我们引入了代理`Proxy`,使每次访问和改变`state`数据变化都得到监听,改变`state`数据时触发主题发布,执行所有依赖`stateChange`事件的方法。

```JavaScript
// 代理状态值,监听状态变化
this.state = new Proxy(params.state || {}, {
  get(state, key) {
    return state[key]
  },
  set(state, key, val) {
    if (_self.status !== 'mutation') {
      console.warn(`需要采用mutation来改变状态值`);
    }
    state[key] = val
    console.log(`状态变化:${key}:${val}`)
    _self._subject.pulish('stateChange', _self.state)
    _self.status = 'resting';
    return true
  }
})
```

改变`state`中数据通过`commit`或`dispatch`方法来执行

```JavaScript
/**
   * 修改状态值
   * @param {string} name 
   * @param {string} newVal 
   */
commit(name, newVal) {
  if (typeof (this.mutations[name]) != 'function') {
    return fasle
  }
  console.group(`mutation: ${name}`);
  this.status = 'mutation'; // 改变状态
  this.mutations[name](this.state, newVal);
  console.groupEnd();
  return true;
}
/**
   * 分发执行action的方法
   * @param  key 的方法属性名 
   * @param  newVal 状态的新值 
   */
dispatch(key, newVal) {
  if (typeof (this.actions[key]) != 'function') {
    return fasle
  }
  console.group(`action: ${key}`);
  this.actions[key](this, newVal);
  self.status = 'action';
  console.groupEnd();
  return true
}
```

最后,将实例化的主题`_subject`暴露出来,以便后续注册`stateChange`事件时使用

```JavaScript
getSubject() {
   return this._subject
 }
```

### 3. 实例化核心`LibStore`组件

使用`vuex`的同学对这个组件一定不陌生,主要是配置`state`、`mutations`、`actions`,并把参数传入核心`LibStore`组件类的实例当中

```JavaScript
import libStore from "./libStore";
let state = {
  count: 0
}
let mutations = {
  addCount(state, val) {
    state.count = val
  },
}
let actions = {
  updateCount(context, val) {
    context.commit('addCount', val);
  }
}
export default new libStore({
  state,
  mutations,
  actions
})
```

### 4.注册`stateChange`事件

`StoreChange`类将作为应用组件的继承类使用,目的是使使用组件注册`stateChange`事件,同时获得继承类的`update`方法,该方法将在`state`数据变化时的到触发。

引入刚刚实例化`LibStore`的对象`store`和订阅发布模块中的观察者类，并注册`stateChange`事件和回调`update`方法

```JavaScript
import store from '@/assets/lib/store'
import { Observer } from './subject'
class StoreChange {
  constructor() {
    this.update = this.update || function () {};
    new Observer(store.getSubject(), 'stateChange', this.update.bind(this))
  }
}
```

### 5. 应用实例

实例将采用两个组件`Index`和`Detail`,分别代表两个页面,通过`hash`路由切换挂载实现跳转,需要说明的是,每次挂载组件前需要清除已经在状态对象的单例化主题中注册的`stateChange`方法,避免重复注册。

- Index

```html
<!-- 页面art模板 -->
<div class="index">
  <h1>首页</h1>
  <hr>
  <button id="btn1">增加数量</button>
  <button id="btn2">减少数量</button>
  <h3 id='time'><%= count%></h3>
</div>
```

```JavaScript
// 组件Js
import StateChange from '@/assets/lib/stateChange'
import store from '@/assets/lib/store'
export default class Index extends StateChange{
  constructor($root){
    super()
    this.$root = $root
    this.render()
    document.querySelector('#btn1').addEventListener('click',this.add.bind(this))
    document.querySelector('#btn2').addEventListener('click',this.minus.bind(this))
  }
  render(){
    var indexTmpl = require('./index.art')
    this.$root.innerHTML =indexTmpl({count:store.state.count})
  }
  update(){
    document.querySelector('#time').textContent = store.state.count
  }
  add(){
    var count = store.state.count
    store.commit('addCount',++count)
  }
  minus(){
    var count = store.state.count
    store.dispatch('updateCount',--count)
  }
}
```

- Detail

```html
<!-- 页面art模板 -->
<div class="detail">
  <h1>详情</h1>
  <hr>
  <h3 id="count"><%= count%></h3>
</div>
```

```javascript
import StateChange from '@/assets/lib/stateChange'
import store from '@/assets/lib/store'
export default class Index extends StateChange {
  constructor($root){
    super()
    this.$root = $root
    this.render()
  }
  render(){
    var detailTmpl = require('./detail.art')
    this.$root.innerHTML = detailTmpl({count:store.state.count})
  }
}
```

文章参考[原生 JavaScript 实现 state 状态管理系统](https://juejin.im/post/5b5ec01a6fb9a04fb4017481)

最后感谢原文作者和分享作者!

[![](https://badge.juejin.im/entry/5c5286346fb9a049a62d0161/likes.svg?style=flat-square)](https://juejin.im/post/5c528411e51d456898361e43)