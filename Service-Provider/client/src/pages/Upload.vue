<template>
  <div v-if="userNotProvider" class="flex justify-evenly items-center">
    <a-modal :heading="'No Provider Contract'">
      It appears that you do not currently have a valid provider contract for this service. If
      you're interested in becoming a resource provider, please don't hesitate to contact us.
    </a-modal>
  </div>
  <div v-else class="flex flex-row justify-evenly items-center">
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
    <tab-form :header="'Upload'" @uploadedFile="fetchData()"></tab-form>
    <tab-table
      :header="'Uploaded Resources'"
      :emptyTableMessage="'You haven\'t uploaded any resources yet.'"
      :tableHeaders="tableHeaders"
      :algorithmTableData="algorithmResources"
      :datasetTableData="datasetResources"
      :contractResourceIDs="contracts"
      :uploadedResourcesTable="true"
      @deleteResource="openDeleteModal"
      @makeResourcePrivate="makeResourcePrivate"
      @makeResourcePublic="makeResourcePublic"
    ></tab-table>
  </div>
</template>
  
  
<script>
import TabTable from '../components/TabTable.vue'
import TabForm from '../components/TabForm.vue'
import AModal from '../components/AModal.vue'

export default {
  components: { TabTable, TabForm, AModal },
  data() {
    return {
      resources: [],
      contracts: [],
      tableHeaders: ['Name', 'Upload Date', 'Status', 'Actions'],
      screenActive: false,
      deleteModalOpen: false,
      resourceIDtoDelete: '',
      userNotProvider: false
    }
  },
  computed: {
    algorithmResources() {
      return this.filterByTypeAndFormat(this.resources, 'algorithm')
    },
    datasetResources() {
      return this.filterByTypeAndFormat(this.resources, 'dataset')
    }
  },
  mounted() {
    this.fetchData()
    this.screenActive = true
  },
  beforeUnmount() {
    this.screenActive = false
  },
  methods: {
    filterByTypeAndFormat(resourceArray, filter) {
      return resourceArray
        .filter((resource) => resource.resourceType === filter)
        .map((resource) => {
          const { resourceType, ...formattedResources } = resource
          return formattedResources
        })
    },
    async fetchData() {
      this.fetchResources()
      this.fetchContracts()
    },
    async fetchResources() {
      // Fetch resources
      try {
        const result = await this.$backendApi.get('/provider/resources')
        // Fromat resource
        const resources = result.data.map((resource) => {
          return {
            id: resource._id,
            resourceName: resource.resourceName,
            resourceType: resource.resourceType,
            uploadedAt: resource.uploadedAt,
            status: resource.status
          }
        })

        this.resources = resources

        // Fetch Data again after 1 second if active upload is ongoing and screen is active
        if (this.screenActive && resources.some((resource) => resource.status === 'processing')) {
          setTimeout(() => {
            this.fetchResources()
          }, 1000)
        }
      } catch (error) {
        if (error.response.status === 403) {
          this.userNotProvider = true
        } else {
          console.log('error: ' + error)
        }
      }
    },
    async fetchContracts() {
      try {
        // Fetch requests
        const result = await this.$backendApi.get('/provider/contracts')
        // Format requests
        const contracts = result.data.map((contract) => {
          return {
            resourceID: contract.resourceID._id
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
    },
    async deleteResource() {
      await this.$backendApi.delete(`/provider/resources/${this.resourceIDtoDelete}`)
      this.deleteModalOpen = false
      this.fetchResources()
    },
    async makeResourcePrivate(resourceID) {
      await this.$backendApi.put(`/provider/resources/${resourceID}/makePrivate`)
      this.fetchResources()
    },
    async makeResourcePublic(resourceID) {
      await this.$backendApi.put(`/provider/resources/${resourceID}/makePublic`)
      this.fetchResources()
    },
    openDeleteModal(resourceID) {
      this.resourceIDtoDelete = resourceID
      this.deleteModalOpen = true
    },
    closeDeleteModal() {
      this.resourceIDtoDelete = ''
      this.deleteModalOpen = false
    }
  }
}
</script>