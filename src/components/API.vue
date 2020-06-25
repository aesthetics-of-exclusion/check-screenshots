<script>
import axios from 'axios'

const apiUrl = process.env.VUE_APP_API_URL

export default {
  data: function () {
    return {
      data: undefined,
      done: false,
      error: undefined,
      aggregatedAnnotations: undefined
    }
  },
  mounted: function () {
    this.loadAggregatedAnnotations()
  },
  methods: {
    saveAnnotation: async function (poiId, annotationType, data, annotationId) {
      let url
      if (annotationId) {
        url = `${apiUrl}/${poiId}/${annotationType}/${annotationId}`
      } else {
        url = `${apiUrl}/${poiId}/${annotationType}`
      }

      const response = await axios.post(url, data)
      window.setTimeout(this.loadAggregatedAnnotations, 1500)

      return response.data
    },
    loadAnnotations: async function (poiId, source) {
      let url
      if (poiId) {
        url = `${apiUrl}/${poiId}`
      } else {
        url = `${apiUrl}/next/facade${source ? `?source=${source}` : ''}`
      }

      try {
        const response = await axios.get(url)
        this.data = response.data
        this.error = undefined
        this.done = false
      } catch (err) {
        if (err.response && err.response.status === 404) {
          this.done = true
        } else {
          this.error = err.message
        }
      }
    },
    loadAggregatedAnnotations: async function () {
      const url = `${apiUrl}/aggregated`
      const response = await axios.get(url)
      this.aggregatedAnnotations = response.data
    }
  }
}
</script>
