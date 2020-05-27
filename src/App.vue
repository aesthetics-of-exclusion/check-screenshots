<template>
  <div id="app">
    <div v-if="done">
      <p>Klaar! Alle screenshots zijn gecontroleerd!</p>
    </div>
    <div v-else-if="error">
      <p class="error">{{ error }}</p>
      <div class="buttons">
        <button @click="loadScreenshot">Opnieuw proberen!</button>
      </div>
    </div>
    <div v-else-if="!data">
      <p>Laden...</p>
      <div class="buttons">
        <button @click="loadScreenshot">Opnieuw proberen!</button>
      </div>
    </div>
    <div v-else-if="poiId && annotations">
      <h2>{{ name }}</h2>
      <h3>{{ addressAnnotation.data.address }}</h3>
      <img :src="screenshotAnnotation.data.screenshotUrl" />
      <div class="buttons">
        <button @click="saveAnnotation({valid: true})">✅ Goedkeuren</button>
        <button @click="saveAnnotation({improve: true})">🔄 Screenshot verbeteren</button>
        <button @click="saveAnnotation({valid: false})">❌ Afkeuren</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const apiUrl = process.env.VUE_APP_API_URL

export default {
  name: 'App',
  data: function () {
    return {
      data: undefined,
      done: false,
      error: undefined
    }
  },
  computed: {
    poiId: function () {
      return this.data && this.data.id
    },
    annotations: function () {
      return this.data && this.data.annotations
    },
    name: function () {
      if (this.osmAnnotation) {
        return this.osmAnnotation.data.properties.name
      } else if (this.faillissementsdossierAnnotation) {
        return this.faillissementsdossierAnnotation.data.name
      }

      return ''
    },
    faillissementsdossierAnnotation: function () {
      return this.annotations.filter((annotation) => annotation.type === 'faillissementsdossier')[0]
    },
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
    reset: function () {
      this.data = undefined
      this.done =  false,
      this.error = undefined
    },
    saveAnnotation: async function (data) {
      const poiId = this.poiId
      const annotationType = 'check'

      const url = `${apiUrl}/${poiId}/${annotationType}`

      try {
        this.reset()
        await axios.post(url, data)
        this.loadScreenshot()
      } catch (err) {
        this.error = err.message
      }
    },
    loadScreenshot: async function () {
      this.reset()

      try {
        const response = await axios.get(`${apiUrl}/next/check`)
        this.data = response.data
      } catch (err) {
        if (err.response && err.response.status === 404) {
          this.done = true
        } else {
          this.error = err.message
        }
      }
    }
  },
  mounted: function () {
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
