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