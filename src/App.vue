<template>
  <div id="app">
    <div v-if="done">
      <p class="text">Done! No more screenshots to be checked.</p>
    </div>
    <div v-else-if="error">
      <p class="text error">{{ error }}</p>
      <div class="buttons">
        <button class="gradient-button" @click="loadAnnotations(undefined, $route.query.source)">Retry</button>
      </div>
    </div>
    <div v-else-if="!data">
      <p class="text">Loading…</p>
      <div class="buttons">
        <button class="gradient-button" @click="loadAnnotations(undefined, $route.query.source)">Retry</button>
      </div>
    </div>
    <div v-else-if="screenshotAnnotation">
      <template v-if="aggregatedAnnotations">
        <p class="text">{{ current }} / {{ total }} </p>
      </template>
      <template v-if="$route.query.metadata === 'show'">
        <h2>{{ name }}</h2>
        <h3>{{ addressAnnotation.data.address }}</h3>
      </template>
      <img :src="screenshotAnnotation.data.screenshotUrl" />
      <div class="buttons">
        <button class="gradient-button gradient-button-primary" @click="submitCheck({valid: true})">Yes</button>
        <button class="gradient-button gradient-button-secondary" @click="submitCheck({valid: false})">No</button>
        <button class="gradient-button" @click="next">Skip</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import API from './components/API'

export default {
  name: 'App',
  mixins: [API],
  data: function () {
    return {
    }
  },
  watch: {
    '$route.params.poiId': function () {
      this.loadAnnotations(this.$route.params.poiId, this.$route.query.source)
    },
    poiId: function (newPoiId) {
      if (newPoiId === this.$route.params.poiId) {
        return
      }

      this.$router.push({
        name: 'edit',
        params: {
          poiId: newPoiId
        },
        query: this.$route.query
      })
    }
  },
  computed: {
    current: function () {
      if (this.aggregatedAnnotations && this.aggregatedAnnotations.check) {
        return this.total - this.aggregatedAnnotations.check[0]
      }

      return undefined
    },
    total: function () {
      if (this.aggregatedAnnotations && this.aggregatedAnnotations.check) {
        return this.aggregatedAnnotations.check[0] + this.aggregatedAnnotations.check[1]
      }

      return undefined
    },
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
    checkAnnotation: function () {
      return this.annotations.filter((annotation) => annotation.type === 'check')[0]
    },
    screenshotAnnotation: function () {
      return this.annotations.filter((annotation) => annotation.type === 'screenshot')[0]
    }
  },
  methods: {
    next: function () {
      this.reset()
      this.$router.push({
        name: 'main',
        query: this.$route.query
      })
    },
    reset: function () {
      this.data = undefined
      this.done =  false,
      this.error = undefined
    },
    submitCheck: async function (data) {
      const poiId = this.poiId
      const annotationId = this.checkAnnotation && this.checkAnnotation.id
      const annotationType = 'check'

      try {
        await this.saveAnnotation(poiId, annotationType, data, annotationId)
        this.saved = true
        this.next()
      } catch (err) {
        console.error(err)
        this.message = `Error saving: ${err.message}!`
      }
    }
  },
  mounted: async function () {
    if (this.$route.name === 'main') {
      this.loadAnnotations(undefined, this.$route.query.source)
    } else {
      this.loadAnnotations(this.$route.params.poiId)
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

html, body {
  font-family: proxima-nova, sans-serif;
  font-size: 62.5%;
}

@media screen and (max-width: 569px) {
  html {
    font-size: 37.5%;
  }
}

@media screen and (min-width: 570px) {
  html {
    font-size: 45%;
  }
}

@media screen and (min-width: 620px) {
  html{
    font-size: 47.5%;
  }
}
@media screen and (min-width: 680px) {
  html {
    font-size: 50%;
  }
}

@media screen and (min-width: 720px){
  html{
    font-size: 52.5%;
  }
}
@media screen and (min-width: 800px) {
  html {
    font-size: 55%;
  }
}

@media screen and (min-width: 860px){
  html {
    font-size: 57.5%;
  }
}

@media screen and (min-width: 920px) {
  html {
    font-size: 60%;
  }
}

@media screen and (min-width: 1000px) {
  html {
    font-size: 62.5%;
  }
}

body {
  padding: 10px;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1, h2, h3 {
  text-align: center;
  font-size: 2.6rem;
  margin: .5rem;
}

#app {
  width: 800px;
  max-width: 100%;
}

.text {
  font-size: 2.6rem;
  text-align: center;
  padding: 1rem;
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

.gradient-button {
  color: #fff;
  text-transform: uppercase;
  font-weight: 800;
  text-decoration: none;
  text-align: center;
  font-size: 2.6rem;
  line-height: 12rem;
  border: none;
  border-radius: 5rem;
  height: 12rem;
  width: 12rem;
  box-shadow: 0 0 5px rgba(0, 0, 0, .1);
  margin: 0 auto;
  display: block;

  background: rgba(100,100,100,1);
  background: linear-gradient(48deg, rgba(100,100,100,1) 0%, rgba(150,150,150,1) 100%);
}

.gradient-button:hover {
  color: #fff;
  background: #323232;
}

.gradient-button-primary {
  background: rgb(169,84,168);
  background: linear-gradient(48deg, rgba(169,84,168,1) 0%, rgba(247,6,131,1) 100%);
}

.gradient-button-secondary {
  background: rgb(59,190,189);
  background: linear-gradient(48deg, rgba(59,190,189,1) 0%, rgba(7,248,134,1) 100%);
}

.gradient-button:disabled {
  background: rgb(180, 180, 180);
  background: linear-gradient(48deg, rgb(180, 180, 180) 0%, rgb(220, 220, 220) 100%);
}
</style>
