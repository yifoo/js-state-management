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