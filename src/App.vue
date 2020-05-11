<template>
  <div id="app">
    <div v-if="poiId && annotation">
      <img :src="annotation.data.screenshotUrl" />
      <div class="buttons">
        <button @click="submitCheck(true)">✅ Ja!</button>
        <button @click="submitCheck(false)">❌ Nee!</button>
      </div>
    </div>
    <div id="firebaseui-auth-container">
    </div>
  </div>
</template>

<script>
const firebase = require('firebase')
const firebaseui = require('firebaseui')
require('firebase/firestore')

const firebaseConfig = {
  apiKey: 'AIzaSyBBXAZEYCxqiPpCXpTH7XU_Vixg0ymZkfA',
  authDomain: 'streetswipe-aoe.firebaseapp.com',
  databaseURL: 'https://streetswipe-aoe.firebaseio.com',
  projectId: 'streetswipe-aoe',
  storageBucket: 'streetswipe-aoe.appspot.com',
  messagingSenderId: '755260135363',
  appId: '1:755260135363:web:4f3496bc29a8691c8b0f76'
}

const redirectUrl = process.env.VUE_APP_REDIRECT_URL

const uiConfig = {
  signInSuccessUrl: redirectUrl,
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID
  ]
}

firebase.initializeApp(firebaseConfig)

export default {
  name: 'App',
  data: function () {
    return {
      poiId: undefined,
      annotation: undefined
    }
  },
  methods: {
    getPoiRef: function (poiId) {
      return this.db.collection('pois').doc(poiId)
    },
    submitCheck: async function (valid) {
      await this.addAnnotation(this.poiId, 'check', {
        valid
      })
    },
    updateAnnotationCount: async function (poiId, type, increment) {
      const poiRef = this.getPoiRef(poiId)
      const poi = await poiRef.get()

      let updatedPoiRef
      if (increment !== undefined) {
        const count = (poi.annotations && poi.annotations[type]) || 0
        updatedPoiRef = await poiRef.update({
          [`annotations.${type}`]: count + increment
        })
      } else {
        updatedPoiRef = poiRef.update({
          [`annotations.${type}`]: FieldValue.delete()
        })
      }

      return updatedPoiRef
    },
    addAnnotation: async function (poiId, type, data) {
      await this.updateAnnotationCount(poiId, type, 1)

      const poiRef = this.getPoiRef(poiId)

      const annotationRef = await poiRef.collection('annotations').doc().set({
        poiId,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        type,
        data
      })

      return annotationRef
    },
    loadScreenshot: async function () {
      const poisRef = this.db.collection('pois')
      const poisQuery = poisRef
        .where('annotations.check', '==', 0)
        .limit(1)

      const poisSnapshot = await poisQuery.get()

      if (poisSnapshot.docs.length) {
        this.poiId = poisSnapshot.docs[0].id

        const annotationsQuery = this.db.collection('pois')
          .doc(this.poiId)
          .collection('annotations')
            .where('type', '==', 'screenshot')
            .limit(1)

        const annotationsSnapshot = await annotationsQuery.get()

        this.annotation = annotationsSnapshot.docs[0].data()
      } else {
        console.log('nee!')
      }
    }
  },
  mounted: function () {
    this.ui = new firebaseui.auth.AuthUI(firebase.auth())
    this.ui.start('#firebaseui-auth-container', uiConfig)

    this.db = firebase.firestore()

    this.loadScreenshot()
  }
}
</script>

<style>
body {
  padding: 10px;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

#app {
  width: 800px;
  max-width: 100%;
}

img {
  width: 100%;
}

.buttons {
  width: 100%;
  display: flex;
  justify-content: center;
}

.buttons button {
  margin: 5px;
}
</style>
