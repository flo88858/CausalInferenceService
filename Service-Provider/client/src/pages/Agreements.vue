<template>
  <div v-if="userNotProvider" class="flex justify-evenly items-center">
    <a-modal :heading="'No Provider Contract'">
      It appears that you do not currently have a valid provider contract for this service. If
      you're interested in becoming a resource provider, please don't hesitate to contact us.
    </a-modal>
  </div>
  <div v-else class="flex flex-col justify-evenly items-center">
    <!-- The Delete Modal -->
    <div
      v-if="deleteModalOpen"
      class="fixed top-0 left-0 flex items-center justify-center w-full h-full z-50"
    >
      <div class="p-4 bg-gray-200 rounded-lg shadow">
        <div class="text-lg font-semibold">Confirm Deletion</div>
        <div class="mt-4">Are you sure you want to delete this resource?</div>
        <div class="mt-4 flex justify-end space-x-2">
          <button
            @click="deleteModalOpen = false"
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button @click="deleteResource" class="px-4 py-2 text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
      </div>
    </div>
    <tab-table
      :header="'Pending Resource Requests'"
      :emptyTableMessage="'There are currently no requests waiting for your approval.'"
      :tableHeaders="requestTableHeader"
      :algorithmTableData="algorithmRequests"
      :datasetTableData="datasetRequests"
      :requestApprovalTable="true"
      @acceptApproval="acceptApproval"
      @denyApproval="denyApproval"
    ></tab-table>
    <tab-table
      :header="'Agreements Registry'"
      :emptyTableMessage="'You currently don\'t have any agreements'"
      :tableHeaders="contractTableHeaders"
      :algorithmTableData="algorithmContracts"
      :datasetTableData="datasetContracts"
    ></tab-table>
  </div>
</template>
  
  
<script>
import TabTable from '../components/TabTable.vue'
import AModal from '../components/AModal.vue'
export default {
  components: { TabTable, AModal },
  data() {
    return {
      requests: [],
      requestTableHeader: [
        'Consumer',
        'Resource',
        'Request Date',
        'Valid From',
        'Valid Until',
        'Approval'
      ],

      contracts: [],
      contractTableHeaders: ['Consumer', 'Resource', 'Effective Data', 'Expiry Date'],
      userNotProvider: false
    }
  },
  computed: {
    algorithmRequests() {
      return this.filterByType(this.requests, 'algorithm')
    },
    datasetRequests() {
      return this.filterByType(this.requests, 'dataset')
    },

    algorithmContracts() {
      return this.filterByType(this.contracts, 'algorithm')
    },
    datasetContracts() {
      return this.filterByType(this.contracts, 'dataset')
    }
  },
  mounted() {
    this.fetchRequests()
    this.fetchContracts()
  },
  methods: {
    filterByType(resourceArray, filter) {
      return resourceArray
        .filter((resource) => resource.resourceType === filter)
        .map((resource) => {
          const { resourceType, ...formattedResources } = resource
          return formattedResources
        })
    },
    /**
     *  ---------- Requests ------------
     */
    async fetchRequests() {
      try {
        // Fetch requests
        const result = await this.$backendApi.get('/provider/requests')
        // Format requests
        const requests = result.data.map((request) => {
          return {
            id: request._id,
            consumer: request.consumer,
            resourceName: request.resourceID.resourceName,
            requestedAt: request.requestedAt,
            resourceType: request.resourceID.resourceType,
            resourceID: request.resourceID._id,
            validFrom: request.validFrom,
            validUntil: request.validUntil
          }
        })

        this.requests = requests
      } catch (error) {
        if (error.response.status === 403) {
          this.userNotProvider = true
        } else {
          console.log('error: ' + error)
        }
      }
    },
    async acceptApproval(request) {
      try {
        await this.$backendApi.post('/provider/contracts', {
          resourceID: request.resourceID,
          consumer: request.consumer,
          validFrom: request.validFrom,
          validUntil: request.validUntil
        })
        await this.$backendApi.delete(`/provider/requests/${request.id}`)
        this.fetchRequests()
        this.fetchContracts()
      } catch (error) {
        if (error.response.status === 403) {
          this.userNotProvider = true
        } else {
          console.log('error: ' + error)
        }
      }
    },
    async denyApproval(request) {
      await this.$backendApi.delete(`/provider/requests/${request.id}`)
      this.fetchRequests()
    },

    /**
     *  ---------- Contracts ------------
     */
    async fetchContracts() {
      try {
        // Fetch requests
        const result = await this.$backendApi.get('/provider/contracts')
        // Format requests
        const contracts = result.data.map((contract) => {
          return {
            consumer: contract.consumer,
            resourceName: contract.resourceID.resourceName,
            resourceType: contract.resourceID.resourceType,
            validFrom: contract.validFrom,
            validUntil: contract.validUntil
          }
        })

        this.contracts = contracts
      } catch (error) {
        if (error.response.status === 403) {
          this.userNotProvider = true
        } else {
          console.log('error: ' + error)
        }
      }
    }
  }
}
</script>