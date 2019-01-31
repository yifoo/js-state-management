import {
  Subject,
} from './subject'
class LibStore {
  constructor(params) {
    var _self = this
    this._subject = new Subject()//  实例化主题
    this.mutations = params.mutations ? params.mutations : {}
    this.actions = params.actions ? params.actions : {}
    this.status = 'resting'
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
        _self._subject.publish('stateChange', _self.state)
        _self.status = 'resting';
        return true
      }
    })
  }
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
  getSubject() {
    return this._subject
  }
}
export default LibStore