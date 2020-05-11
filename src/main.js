import Vue from 'vue'
import App from './App.vue'

import firebase from 'firebase'

const firebaseConfig = {
  apiKey: 'AIzaSyD9uv2hUKypY3QmQCpjpktTDvpPcEXzStY',
  authDomain: 'streetswipe-aoe.firebaseapp.com',
  databaseURL: 'https://streetswipe-aoe.firebaseio.com',
  projectId: 'streetswipe-aoe',
  storageBucket: 'streetswipe-aoe.appspot.com',
  messagingSenderId: '755260135363',
  appId: '1:755260135363:web:5cf3d4e7403532b38b0f76'
}

firebase.initializeApp(firebaseConfig)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
