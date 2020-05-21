<template>
  <div id="app">
    <div v-if="done">
      <p>Klaar! Alle screenshots zijn gecontroleerd!</p>
    </div>
    <div v-else-if="!auth">
      <p>Log in om te beginnen</p>
      <div class="buttons">
        <button @click="loadScreenshot">Opnieuw proberen!</button>
      </div>
    </div>
    <div v-else-if="poiId && annotations">
      <h2>{{ osmAnnotation.data.properties.name }}</h2>
      <h3>{{ addressAnnotation.data.address }}</h3>
      <img :src="screenshotAnnotation.data.screenshotUrl" />
      <div class="buttons">
        <button @click="submitCheck(true)">✅ Ja!</button>
        <button @click="submitCheck(false)">❌ Nee!</button>
      </div>
    </div>
    <section id="firebaseui-auth-container"></section>
  </div>
</template>

<script>
import * as firebase from 'firebase'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

const redirectUrl = process.env.VUE_APP_REDIRECT_URL

const uiConfig = {
  signInSuccessUrl: redirectUrl,
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ]
}

export default {
  name: 'App',
  data: function () {
    return {
      user: undefined,
      poiId: undefined,
      annotations: undefined,
      auth: false,
      done: false,
      error: ''
    }
  },
  computed: {
    osmAnnotation: function () {
      return this.annotations.filter((annotation) => annotation.type === 'osm')[0]
    },
    addressAnnotation: function () {
      return this.annotations.filter((annotation) => annotation.type === 'address')[0]
    },
    screenshotAnnotation: function () {
      return this.annotations.filter((annotation) => annotation.type === 'screenshot')[0]
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

      if (valid) {
        await this.setNextAnnotations(this.poiId, ['facade'])
      }

      this.poiId = undefined
      this.annotations = undefined

      this.loadScreenshot()
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
    setNextAnnotations: async function (poiId, types) {
      const poiRef = this.getPoiRef(poiId)
      const nextAnnotations = Object.assign(...types.map((type) => ({[`annotations.${type}`]: 0})))
      const updatedPoiRef = await poiRef.update(nextAnnotations)
      return updatedPoiRef
    },
    loadScreenshot: async function () {
      try {
        const poisRef = this.db.collection('pois')
        const poisQuery = poisRef
          .where('annotations.check', '==', 0)
          .limit(1)

        const poisSnapshot = await poisQuery.get()
        this.auth = true

        if (poisSnapshot.docs.length) {
          this.poiId = poisSnapshot.docs[0].id

          const annotationsQuery = this.db.collection('pois')
            .doc(this.poiId)
            .collection('annotations')

          const annotationsSnapshot = await annotationsQuery.get()
          this.annotations = annotationsSnapshot.docs.map((doc) => doc.data())
        } else {
          this.done = true
        }
      } catch (err) {
        console.error(err)
        this.error = err.message
      }
    }
  },
  created: function () {
    firebase.auth().onAuthStateChanged((user) => {
      this.user = user
    })
  },
  mounted: function () {
    let ui = firebaseui.auth.AuthUI.getInstance()
    if (!ui) {
      ui = new firebaseui.auth.AuthUI(firebase.auth())
    }

    ui.start('#firebaseui-auth-container', uiConfig)
    this.ui = ui

    this.db = firebase.firestore()

    this.loadScreenshot()
  }
}
</script>

<style>
body {
  font-family: monospace;
  padding: 10px;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1, h2, h3 {
  text-align: center;
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
