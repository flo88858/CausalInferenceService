<template>
  <div>
    <!-- The Delete Modal -->
    <div
      v-if="deleteModalOpen"
      class="fixed top-0 left-0 flex items-center justify-center w-full h-full z-50"
    >
      <div class="p-4 bg-gray-200 rounded-lg shadow">
        <div class="text-lg font-semibold">Confirm Deletion</div>
        <div class="mt-4">
          Are you sure you want <span v-if="stopContainer">to stop and</span>
          <span v-if="!stopContainer">to</span> delete "<span class="font-bold">{{
            resultNameToBeDeleted
          }}</span
          >"?
        </div>
        <div class="mt-4 flex justify-end space-x-2">
          <button @click="closeDeleteModal" class="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button @click="deleteResult" class="px-4 py-2 text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
      </div>
    </div>
    <div v-if="userNotConsumer" class="flex justify-evenly items-center">
      <a-modal :heading="'No Consumer Contract'">
        It appears that you do not currently have a valid consumer contract for this service. If
        you're interested in becoming a resource consumer, please don't hesitate to contact us.
      </a-modal>
    </div>
    <!-- The result table -->
    <div
      v-else-if="allResults.length != 0"
      class="overflow-x-auto bg-gray-800 text-gray-200 shadow-xl rounded-lg p-6 m-6"
    >
      <table class="w-full text-sm text-left">
        <thead>
          <tr class="border-b border-gray-400">
            <th scope="col" class="p-4"></th>
            <th scope="col" class="p-4">Result Name</th>
            <th scope="col" class="p-4">Algorithm</th>
            <th scope="col" class="p-4">Dataset</th>
            <th scope="col" class="p-4">α-Value</th>
            <th scope="col" class="p-4">x-Value</th>
            <th scope="col" class="p-4">y-Value</th>
            <th scope="col" class="p-4">Timestamp</th>
            <th scope="col" class="p-4 text-center">Status</th>
            <th scope="col" class="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody v-for="(result, index) in allResults" :key="allResults[index]._id">
          <table-row :data="result" @deleteResult="openDeleteModal"></table-row>
        </tbody>
      </table>
    </div>
    <div
      v-else
      class="max-w-md flex flex-col items-center space-y-12 space-between bg-gray-800 text-gray-200 shadow-xl rounded-lg p-12 m-6"
    >
      <h1 class="text-2xl text-center font-bold">No results</h1>
      <p class="text-center">
        You don't have any results yet. Go to the
        <span class="whitespace-nowrap">Home-Screen</span> to make some calculations and come back
        afterwards to view them here.
      </p>
    </div>
  </div>
</template>

<script>
import TableRow from './TableRow.vue'
import AModal from './AModal.vue'

export default {
  components: {
    TableRow,
    AModal
  },
  data() {
    return {
      allResults: [],
      deleteModalOpen: false,
      resultIdToDelete: null,
      stopContainer: false,
      userNotConsumer: false
    }
  },
  mounted() {
    this.fetchAllResults()
  },
  computed: {
    resultNameToBeDeleted() {
      return this.allResults.find((result) => result._id === this.resultIdToDelete).resultName
    }
  },
  methods: {
    async fetchAllResults() {
      try {
        const res = await this.$backendApi.get('/consumer/results/')
        this.allResults = res.data
      } catch (error) {
        if (error.response.status === 403) {
          this.userNotConsumer = true
        } else {
          console.log('error: ' + error)
        }
      }
    },
    openDeleteModal(resultID, stopContainer) {
      this.stopContainer = stopContainer
      this.resultIdToDelete = resultID
      this.deleteModalOpen = true
    },
    closeDeleteModal() {
      this.resultIdToDelete = null
      this.deleteModalOpen = false
    },
    async deleteResult() {
      if (this.stopContainer) {
        this.$backendApi.post('/consumer/algorithm/stop', {
          resultID: this.resultIdToDelete
        })
        this.stopContainer = false
      }
      this.$backendApi
        .delete(`/consumer/results/${this.resultIdToDelete}`)
        .then(() => {
          this.allResults = this.allResults.filter((result) => result._id !== this.resultIdToDelete)
          this.deleteModalOpen = false
        })
        .catch((error) => console.log(error))
    }
  }
}
</script>