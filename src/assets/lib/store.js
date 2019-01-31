/*
 * @Author: wuhao 
 * @Date: 2018-11-13 10:31:46 
 * @Desc: state实例
 * @Last Modified by: wuhao
 * @Last Modified time: 2019-01-31 13:04:15
 */
import Store from "./libStore";

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
export default new Store({
  state,
  mutations,
  actions
})