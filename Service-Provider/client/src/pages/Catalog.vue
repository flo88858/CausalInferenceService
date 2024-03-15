<template>
  <div v-if="userNotConsumer" class="flex justify-evenly items-center">
    <a-modal :heading="'No Consumer Contract'">
      It appears that you do not currently have a valid consumer contract for this service. If
      you're interested in becoming a resource consumer, please don't hesitate to contact us.
    </a-modal>
  </div>
  <div v-else class="flex flex-row justify-evenly items-center w-full">
    <div
      v-if="requestModalOpen"
      class="fixed top-0 left-0 flex items-center justify-center w-full h-full z-50 backdrop-blur-md"
    >
      <div class="h-[36rem]">
        <div class="flex flex-col space-y-4 p-4 bg-gray-200 rounded-lg shadow">
          <div class="text-xl font-semibold">Make a request:</div>
          <div class="flex flex-row space-x-4">
            <div class="flex flex-col space-y-1">
              <div class="font-medium">Resource:</div>
              <div class="font-medium">Provider:</div>
              <div class="font-medium pt-1">Date:</div>
            </div>
            <div class="flex flex-col space-y-1">
              <div class="">{{ this.requestedResource.resourceName }}</div>
              <div class="">{{ this.requestedResource.provider }}</div>
              <div class="w-[22rem]">
                <vue-date-picker
                  :range="true"
                  :min-date="new Date()"
                  v-model="requestedDate"
                ></vue-date-picker>
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <button @click="closeRequestModal" class="px-4 py-2 text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <button
              @click="sendRequest"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-2 rounded text-gray-200"
            >
              Request
            </button>
          </div>
        </div>
      </div>
    </div>
    <tab-table
      :header="'Authorized Resources'"
      :emptyTableMessage="'You currently don\'t have access to any resources yet. Submit a request to acquire new resources.'"
      :tableHeaders="availableResourcesTableHeaders"
      :algorithmTableData="authorizedAlgorithms"
      :datasetTableData="authorizedDatasets"
    >
    </tab-table>
    <tab-table
      :header="'Request Resources'"
      :emptyTableMessage="'No requests available. Please try again later.'"
      :tableHeaders="requestTableHeaders"
      :algorithmTableData="algorithmsWithoutContract"
      :datasetTableData="datasetsWithoutContract"
      :requestResourceTable="true"
      @request="openRequestModal"
      @cancelRequest="cancelRequest"
    >
    </tab-table>
  </div>
</template>
  
<script>
import TabTable from '../components/TabTable.vue'
import TextCard from '../components/TextCard.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import AModal from '../components/AModal.vue'

export default {
  components: {
    TabTable,
    TextCard,
    VueDatePicker,
    AModal
  },
  data() {
    return {
      contracts: [], // include resources
      resources: [],
      ownResources: [],
      requests: [],
      availableResourcesTableHeaders: ['Name', 'Provider', 'Expiry Date'],
      requestTableHeaders: ['Name', 'Provider', 'Request'],
      fetchInterval: null,
      requestModalOpen: false,
      requestedResource: '',
      requestedDate: [],
      userNotConsumer: false
    }
  },
  mounted() {
    this.fetchResources()
    this.fetchOwnResources()
    this.fetchContracts()
    this.fetchRequests()

    this.fetchRoutine()
  },
  beforeUnmount() {
    // This is important because it stops the fetching routine
    clearInterval(this.fetchInterval)
  },
  computed: {
    // All algorithms with a valid contract
    algorithmsWithContract() {
      return this.contracts
        .filter((contract) => contract.resourceID.resourceType === 'algorithm')
        .map((contract) => {
          return {
            id: contract.resourceID._id,
            name: contract.resourceID.resourceName,
            provider: contract.resourceID.provider,
            validUntil: contract.validUntil //format here
          }
        })
    },

    authorizedAlgorithms() {
      const filteredOwnResources = this.ownResources
        .filter((resource) => resource.resourceType === 'algorithm')
        .map((resource) => {
          return {
            id: resource._id,
            name: resource.resourceName,
            provider: 'You',
            validUntil: 'Never'
          }
        })

      return [...filteredOwnResources, ...this.algorithmsWithContract]
    },

    // All datasets with a valid contract
    datasetsWithContract() {
      return this.contracts
        .filter((contract) => contract.resourceID.resourceType === 'dataset')
        .map((contract) => {
          return {
            id: contract.resourceID._id,
            name: contract.resourceID.resourceName,
            provider: contract.resourceID.provider,
            validUntil: contract.validUntil //format here
          }
        })
    },

    authorizedDatasets() {
      const filteredOwnResources = this.ownResources
        .filter((resource) => resource.resourceType === 'dataset')
        .map((resource) => {
          return {
            id: resource._id,
            name: resource.resourceName,
            provider: 'You',
            validUntil: 'Never'
          }
        })

      return [...filteredOwnResources, ...this.datasetsWithContract]
    },

    resourcesWithoutContract() {
      return (
        this.resources
          // Only resources without contract
          .filter(
            (resourceObject) =>
              !this.contracts.some(
                (contractObject) => contractObject.resourceID._id === resourceObject.id
              )
          )
          // Add waitingForApproval boolean (if active request)
          // Also add requestID when there is a request (for cancelation)
          .map((resourceObject) => {
            const waitingForApproval = this.requests.some(
              (requestObject) => requestObject.resourceID === resourceObject.id
            )

            const requestID = waitingForApproval
              ? this.requests.find(
                  (requestObject) => requestObject.resourceID === resourceObject.id
                ).id
              : null

            return {
              ...resourceObject,
              waitingForApproval: waitingForApproval,
              requestID: requestID
            }
          })
      )
    },
    algorithmsWithoutContract() {
      return this.filterByTypeAndFormat(this.resourcesWithoutContract, 'algorithm')
    },
    datasetsWithoutContract() {
      return this.filterByTypeAndFormat(this.resourcesWithoutContract, 'dataset')
    }
  },
  methods: {
    filterByTypeAndFormat(resourceArray, filter) {
      return resourceArray
        .filter((resource) => resource.resourceType === filter)
        .map((resource) => {
          return {
            id: resource.id,
            name: resource.resourceName,
            provider: resource.provider, // change this
            waitingForApproval: resource.waitingForApproval,
            requestID: resource.requestID
          }
        })
    },
    openRequestModal(resourceID) {
      this.requestModalOpen = true
      this.requestedResource = this.resources.find((resource) => resource.id === resourceID)
    },
    closeRequestModal() {
      this.requestModalOpen = false
      this.requestedResource = null
      this.requestedDate = []
    },
    async fetchResources() {
      // Fetch resources
      try {
        const result = await this.$backendApi.get('/consumer/resources')
        // Fromat resource
        const resources = result.data.map((resource) => {
          return {
            id: resource._id,
            provider: resource.provider,
            resourceName: resource.resourceName,
            resourceType: resource.resourceType,
            status: resource.status
          }
        })

        this.resources = resources
      } catch (error) {
        if (error.response.status === 403) {
          this.userNotConsumer = true
        } else {
          console.log('error: ' + error)
        }
      }
    },

    async fetchContracts() {
      // Fetch resources
      try {
        const result = await this.$backendApi.get('/consumer/contracts')
        this.contracts = result.data
      } catch (error) {
        if (error.response.status === 403) {
          this.userNotConsumer = true
        } else {
          console.log('error: ' + error)
        }
      }
    },
    async fetchRequests() {
      try {
        // Fetch requests
        const result = await this.$backendApi.get('/consumer/requests')
        // Format requests
        const requests = result.data.map((request) => {
          return {
            id: request._id,
            resourceID: request.resourceID,
            requestsAt: request.requestedAt
          }
        })

        this.requests = requests
      } catch (error) {
        if (error.response.status === 403) {
          this.userNotConsumer = true
        } else {
          console.log('error: ' + error)
        }
      }
    },
    async fetchOwnResources() {
      try {
        // Fetch resources uploaded by user himself/herself
        const result = await this.$backendApi.get('/provider/resources')
        // Fromat resource
        const ownResources = result.data
          .map((resource) => {
            return {
              id: resource._id,
              resourceName: resource.resourceName,
              resourceType: resource.resourceType,
              status: resource.status
            }
          })
          .filter((resource) => resource.status !== 'processing')

        this.ownResources = ownResources
      } catch (error) {
        console.log('error: ' + error)
      }
    },
    async fetchRoutine() {
      // Fetch running calculations every second to check for update
      // TODO: Handle UI update when there are two ongoing requests
      this.fetchInterval = setInterval(() => {
        if (this.requests.length !== 0) {
          this.fetchRequests()
        } else {
          this.fetchContracts()
          this.fetchResources()
          clearInterval(this.fetchInterval)
        }
      }, 1000) // This could be increased in the future if the api cant handle the requests
    },
    async sendRequest() {
      try {
        const payload = {
          resourceID: this.requestedResource.id,
          validFrom: this.isoToUnixTime(this.requestedDate[0]),
          validUntil: this.isoToUnixTime(this.requestedDate[1])
        }
        // Send resource request
        await this.$backendApi.post('/consumer/requests', payload)
        this.requestedResource = null
        this.requestedDate = []
        this.requestModalOpen = false
        // Update UI
        this.fetchRequests()
        this.fetchRoutine()
      } catch (error) {
        console.log(error)
      }
    },
    async cancelRequest(requestID) {
      try {
        // Delete request
        await this.$backendApi.delete(`/consumer/requests/${requestID}`)
        // Update UI
        this.fetchRequests()
      } catch (error) {
        console.log(error)
      }
    },
    findResourceByResourceID(resourceID) {
      return this.resources.find((resource) => resource.id === resourceID)
    },
    isoToUnixTime(isoTimestamp) {
      return new Date(isoTimestamp).getTime()
    }
  }
}
</script>