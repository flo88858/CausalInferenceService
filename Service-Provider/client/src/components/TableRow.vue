<template>
  <tr :class="{ 'border-b border-gray-400': !isOpen }">
    <td class="px-2 py-2">
      <button @click="toggleRow()">
        <svg-arrow-right v-if="!isOpen"></svg-arrow-right>
        <svg-arrow-down v-else></svg-arrow-down>
      </button>
    </td>
    <th scope="row" class="px-4 py-3 whitespace-nowrap">{{ data.resultName }}</th>
    <td class="px-4 py-3">{{ data.algorithm.resourceName }}</td>
    <td class="px-4 py-3">{{ data.dataset.resourceName }}</td>
    <td class="px-4 py-3">{{ data.parameters.alpha }}</td>
    <td class="px-4 py-3">{{ data.parameters.x }}</td>
    <td class="px-4 py-3">{{ data.parameters.y }}</td>
    <td class="px-4 py-3">{{ formatDate(data.finishedAt) }}</td>
    <!--Calculation Status -->
    <td class="px-4 py-3 w-36 text-center">
      <!-- UI-State: Finished -->
      <div v-if="algorithmStatus === 'finished'">
        <span class="text-green-400">Finished</span>
      </div>
      <!-- UI-State: Running -->
      <div v-else-if="algorithmStatus === 'running'">
        <div class="flex justify-center items-center space-x-2">
          <div class="text-gray-400">Calculating...</div>
          <!--Loading Animation-->
          <div class="flex items-center justify-center w-full h-full">
            <svg
              class="w-4 h-4 text-gray-200 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
      <!-- UI-State: Paused -->
      <div v-else-if="algorithmStatus === 'paused'">
        <span class="text-gray-400">Paused</span>
      </div>
      <!-- UI-State: Failed-->
      <div v-else-if="algorithmStatus === 'failed'">
        <span class="text-red-400">Failed</span>
      </div>
      <!-- UI-State: Should never happen-->
      <div v-else><span class="text-red-400">Error</span></div>
    </td>
    <!--Actions-->
    <td class="flex justify-center items-center px-4 py-3">
      <!-- UI-State: Finished or Failed -->
      <div v-if="algorithmStatus === 'finished' || algorithmStatus === 'failed'">
        <button @click="deleteResult()">
          <svg-trash-bin></svg-trash-bin>
        </button>
      </div>
      <div v-else>
        <!-- UI-State: Running -->
        <div
          v-if="algorithmStatus === 'running'"
          class="flex justify-center items-center space-x-2"
        >
          <button @click="pauseCalculation()">
            <svg-pause-icon></svg-pause-icon>
          </button>
          <button @click="stopCalculation()">
            <SvgSimpleCrossRounded></SvgSimpleCrossRounded>
          </button>
        </div>
        <!-- UI-State: Paused -->
        <div
          v-else-if="algorithmStatus === 'paused'"
          class="flex justify-center items-center space-x-2"
        >
          <button @click="resumeCalculation()">
            <svg-play-icon></svg-play-icon>
          </button>
          <button @click="stopCalculation()">
            <SvgSimpleCrossRounded></SvgSimpleCrossRounded>
          </button>
        </div>
      </div>
    </td>
  </tr>
  <!--When Row is open-->
  <tr v-if="isOpen" class="border-collapse border-b border-gray-400">
    <td colspan="10">
      <!-- UI-State: Finished -->
      <div v-if="algorithmStatus === 'finished'">
        <div class="grid grid-cols-3 grid-rows-1">
          <!-- The result table-->
          <table class="text-center m-6 col-start-2">
            <tr class="border-b-2 border-gray-400">
              <th class="border border-r-2 border-gray-400 px-6 py-2">{{ tableHeader[0] }}</th>
              <th class="border border-gray-400 px-6 py-2">{{ tableHeader[1] }}</th>
            </tr>
            <tbody v-for="(row, index) in tableData" :key="index">
              <tr>
                <td class="border border-r-2 border-gray-400 px-6 py-2">{{ row[tableHeader[0]] }}</td>
                <td class="border border-gray-400 px-4 py-2">{{ row[tableHeader[1]] }}</td>
              </tr>
            </tbody>
          </table>
          <!-- The export button -->
          <div class="col-start-3 flex justify-center items-center">
            <div class="flex flex-col space-y-2">
              <h3 class="text-lg font-semibold text-left">Download Results</h3>
              <div class="flex flex-row">
                <button
                  class="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded px-2 py-1 mr-2"
                  @click="exportData"
                >
                  Export to File
                </button>
                <select
                  class="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded px-2 py-1"
                  v-model="fileExportType"
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- UI-State: Running -->
      <div
        v-else-if="algorithmStatus === 'running'"
        class="flex flex-col justify-center items-center space-y-4 m-6"
      >
        <h1 class="text-lg font-bold">The Calculation is Running</h1>
        <p class="w-1/2 text-center text-md">
          Your calculation is currently running. Please wait until it's finished. The results will
          later be displayed here.
        </p>
      </div>
      <!-- UI-State: Paused -->
      <div
        v-else-if="algorithmStatus === 'paused'"
        class="flex flex-col justify-center items-center space-y-4 m-6"
      >
        <h1 class="text-lg font-bold">The Calculation is Paused</h1>
        <p class="w-1/2 text-center text-md">
          Your calculation is currently stopped. You can resume your calculation by clicking the
          resume button in the top right corner.
        </p>
      </div>
      <!-- UI-State: Failed-->
      <div
        v-else-if="algorithmStatus === 'failed'"
        class="flex flex-col justify-center items-center space-y-4 m-6"
      >
        <h1 class="text-lg font-bold">The Calculation Failed</h1>
        <p class="w-1/2 text-center text-md">
          Unfortunatly something went wrong and the calculation failed. Please try to start another
          calculation.
        </p>
      </div>
      <!-- UI-State: Should never happen-->
      <div v-else></div>
    </td>
  </tr>
</template>

<script>
import * as XLSX from 'xlsx'
import SvgArrowRight from '../components/icons/SvgArrowRight.vue'
import SvgArrowDown from '../components/icons/SvgArrowDown.vue'
import SvgTrashBin from '../components/icons/SvgTrashBin.vue'
import SvgSimpleCrossRounded from '../components/icons/SvgSimpleCrossRounded.vue'
import SvgPauseIcon from '../components/icons/SvgPauseIcon.vue'
import SvgPlayIcon from './icons/SvgPlayIcon.vue'

export default {
  components: {
    SvgArrowRight,
    SvgArrowDown,
    SvgTrashBin,
    SvgSimpleCrossRounded,
    SvgPauseIcon,
    SvgPlayIcon
  },
  emits: ['deleteResult'],
  props: {
    data: {
      required: true
    }
  },
  data() {
    return {
      isOpen: false,
      fileExportType: 'csv',
      algorithmStatus: '' // running, paused, failed, finished
    }
  },
  mounted() {
    if (this.noResultData) {
      // Set the UI State by fetching the algorithms (containers) status
      this.fetchAlgorithmStatus()
      this.startFetchingRoutine()
    } else {
      this.algorithmStatus = 'finished'
    }
  },
  beforeUnmount() {
    // This is important because it stops the fetching routine
    this.algorithmStatus = ''
  },
  computed: {
    noResultData() {
      return this.data.result[0] === 'No Data Yet'
    },
    tableHeader() {
      return this.data.result[0] ? Object.keys(this.data.result[0]) : ''
    },
    tableData() {
      return this.data.result
    }
  },
  methods: {
    // Methods that trigger a Pop-up must be emitted to parent component due to architecture
    toggleRow() {
      this.isOpen = !this.isOpen
    },
    async fetchAlgorithmStatus() {
      this.$backendApi
        .get(`/consumer/algorithm/status/${this.data._id}`)
        .then((status) => (this.algorithmStatus = status.data.Status))
        .catch((err) => {
          this.algorithmStatus = 'failed'
          console.log(err)
        })
    },
    async startFetchingRoutine() {
      // Fetch running calculations every second to check for update
      const fetchInterval = setInterval(() => {
        if (this.algorithmStatus === 'running') {
          this.fetchRunningCalculation()
        } else {
          clearInterval(fetchInterval)
        }
      }, 1000) // This could be increased in the future if the api cant handle the requests
    },
    async fetchRunningCalculation() {
      console.log('Fetching active calculation...')
      try {
        const res = await this.$backendApi.get(`/consumer/results/${this.data._id}`)
        // Update active calculations
        const newFetchedResult = res.data

        if (newFetchedResult.result[0] !== 'No Data Yet') {
          this.algorithmStatus = 'finished'
          this.data.result = newFetchedResult.result
          this.data.finishedAt = newFetchedResult.finishedAt
        }
      } catch (error) {
        // Handle errors
        console.error(error)
      }
    },
    deleteResult() {
      this.$emit('deleteResult', this.data._id, false)
      // Closing it because of a bug (Could also be a feature)
      this.isOpen = false
    },
    stopCalculation() {
      this.$emit('deleteResult', this.data._id, true)
      this.isOpen = false
    },
    async pauseCalculation() {
      this.$backendApi
        .post('/consumer/algorithm/pause', {
          resultID: this.data._id
        })
        .then((res) => (this.algorithmStatus = 'paused'))
        .catch((error) => console.log(error))
    },
    resumeCalculation() {
      this.$backendApi
        .post('/consumer/algorithm/resume', {
          resultID: this.data._id
        })
        .then((res) => {
          this.algorithmStatus = 'running'
          // Resume the fetching routine
          this.startFetchingRoutine()
        })
        .catch((error) => console.log(error))
    },

    formatDate(isoDate) {
      var date = new Date(isoDate)
      return date
        .toLocaleDateString('de-DE', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false
        })
        .replace(/\,/g, ' -')
    },

    exportData() {
      if (this.fileExportType === 'csv') {
        this.exportToCSV()
      } else if (this.fileExportType === 'pdf') {
        this.exportToPDF()
      } else if (this.fileExportType === 'xlsx') {
        this.exportToExcel()
      } else {
        console.log('No Export type found')
      }
    },
    //https://stackoverflow.com/questions/19492846/javascript-to-csv-export-encoding-issue
    exportToCSV() {
      //Convert Data
      const headers = Object.keys(this.data.result[0])
      const csv = [headers.join(',')]
      this.data.result.forEach((item) => {
        const row = headers.map((header) => item[header])
        csv.push(row.join(','))
      })
      const convertedResults = csv.join('\n')

      // Create a Blob
      const blob = new Blob([convertedResults], { type: 'text/csv' })

      // Create a download link
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `${this.data.resultName}.csv`
      link.click()
    },
    exportToExcel() {
      // Convert data
      const headers = Object.keys(this.data.result[0])
      const data = this.data.result.map((item) => Object.values(item))
      const convertedData = [headers, ...data]
      // Create Excelsheet
      const worksheet = XLSX.utils.aoa_to_sheet(
        convertedData.map((row) => row.map((cell) => `${cell}`))
      )
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1')
      XLSX.writeFile(workbook, `${this.data.resultName}.xlsx`)
    }
  }
}
</script>