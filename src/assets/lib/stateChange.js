import store from '@/assets/lib/store'
import { Observer } from './subject'
class StoreChange {
  constructor() {
    this.update = this.update || function () {};
    new Observer(store.getSubject(), 'stateChange', this.update.bind(this))
  }
}
export default StoreChange