<template>
  <div class="flex flex-col bg-gray-800 text-gray-200 shadow-xl rounded-lg m-6">
    <!-- The Header -->
    <h1 class="text-center text-xl font-bold m-8">{{ header }}</h1>
    <div class="grid grid-cols-12 grid-rows-[3rem,auto] gap-0">
      <!-- The Tabs -->
      <button
        @click="clickedAlgorithm"
        class="col-start-2 col-span-5 rounded-t-lg font-semibold"
        :class="{ 'bg-slate-600': algorithmTabSelected }"
      >
        Algorithms
      </button>
      <button
        @click="clickedDataset"
        class="col-start-7 col-span-5 rounded-t-lg font-semibold"
        :class="{ 'bg-slate-600': !algorithmTabSelected }"
      >
        Datasets
      </button>
      <div class="row-start-2 bg-slate-600"></div>
      <div className="col-start-2 col-span-10 row-start-2 bg-slate-600 overflow-x-auto">
        <div
          v-if="
            (algorithmTabSelected && algorithmTableData.length === 0) ||
            (!algorithmTabSelected && datasetTableData.length === 0)
          "
          class="flex justify-center items-center w-96 h-20"
        >
          <span class="text-center">{{ emptyTableMessage }}</span>
        </div>
        <!--The actual Table -->
        <table v-else class="w-full text-sm text-left">
          <thead>
            <tr class="border-b border-gray-400">
              <th v-for="(tableHeader, index) in tableHeaders" :key="index" scope="col" class="p-4">
                {{ tableHeader }}
              </th>
            </tr>
          </thead>
          <!-- The Request Resources Table (Catalog-Screen) -->
          <tbody v-if="requestResourceTable">
            <tr
              v-for="(tableRow, rowIndex) in tableData"
              :key="rowIndex"
              :class="{ 'border-b border-gray-400': rowIndex < tableData.length - 1 }"
            >
              <td
                v-for="(tableDataItem, colIndex) in formatRequestResourceRow(tableRow)"
                :key="colIndex"
                class="px-4 py-2"
              >
                <!--Request column-->
                <div
                  v-if="colIndex === 'waitingForApproval'"
                  class="flex justify-center items-center"
                >
                  <div
                    v-if="tableDataItem == true"
                    class="flex justify-center items-center space-x-4"
                  >
                    <div class="text-gray-400 whitespace-nowrap">Waiting for approval...</div>
                    <!--Loading Animation-->
                    <button @click="clickedCancelRequest(tableRow.requestID)">
                      <SvgSimpleCrossRounded></SvgSimpleCrossRounded>
                    </button>
                  </div>

                  <button
                    v-else
                    @click="clickedRequest(tableRow.id)"
                    class="bg-blue-600 hover:bg-blue-700 px-2 rounded"
                  >
                    Request
                  </button>
                </div>
                <!--All other columns-->
                <span v-else> {{ tableDataItem }}</span>
              </td>
            </tr>
          </tbody>
          <!--The pending resource requests Table -->
          <tbody v-else-if="requestApprovalTable">
            <tr
              v-for="(tableRow, rowIndex) in tableData"
              :key="rowIndex"
              :class="{ 'border-b border-gray-400': rowIndex < tableData.length - 1 }"
            >
              <td
                v-for="(tableDataItem, colIndex) in formatApprovalRow(tableRow)"
                :key="colIndex"
                class="px-4 py-2"
              >
                <div
                  v-if="
                    colIndex === 'requestedAt' ||
                    colIndex === 'validFrom' ||
                    colIndex === 'validUntil'
                  "
                >
                  {{ formatDate(tableDataItem) }}
                </div>
                <!--Approval column-->
                <div
                  v-else-if="colIndex === 'approval'"
                  class="flex flex-row justify-center items-center space-x-2"
                >
                  <button
                    @click="clickedAcceptApproval(tableRow)"
                    class="bg-green-600 hover:bg-green-700 active:bg-green-800 px-2 rounded"
                  >
                    Accept
                  </button>
                  <button
                    @click="clickedDenyApproval(tableRow)"
                    class="bg-red-600 hover:bg-red-700 active:bg-red-800 px-2 rounded"
                  >
                    Deny
                  </button>
                </div>
                <span v-else>{{ tableDataItem }}</span>
              </td>
            </tr>
          </tbody>
          <!-- The Uploaded Resources Table -->
          <tbody v-else-if="uploadedResourcesTable">
            <tr
              v-for="(tableRow, rowIndex) in tableData"
              :key="rowIndex"
              :class="{ 'border-b border-gray-400': rowIndex < tableData.length - 1 }"
            >
              <td
                v-for="(tableDataItem, colIndex) in formatUploadedRow(tableRow)"
                :key="colIndex"
                class="px-4 py-2"
              >
                <span v-if="colIndex === 'uploadedAt'">
                  {{ formatDate(tableDataItem) }}
                </span>
                <!--Status column-->
                <div v-else-if="colIndex === 'status'">
                  <div
                    v-if="tableRow.status === 'processing'"
                    class="flex justify-center items-center space-x-2 w-full"
                  >
                    <div class="text-gray-400">Processing...</div>
                    <!--Loading Animation-->
                    <div class="flex items-center justify-center h-full">
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
                  <div
                    v-else-if="
                      tableRow.status === 'private' && resourceHasActiveContracts(tableRow.id)
                    "
                    class="flex flex-row justify-between items-center space-x-2"
                  >
                    <span
                      class="bg-red-600 rounded-lg shadow-xl w-14 text-center py-1 whitespace-nowrap"
                      >Private</span
                    ><span class="bg-orange-600 rounded-lg py-1 px-2 shadow-xl whitespace-nowrap"
                      >Active Agreements</span
                    >
                  </div>
                  <div
                    v-else-if="
                      tableRow.status === 'private' && !resourceHasActiveContracts(tableRow.id)
                    "
                    class="flex flex-row justify-between items-center space-x-2"
                  >
                    <span
                      class="bg-red-600 rounded-lg shadow-xl w-14 text-center py-1 whitespace-nowrap"
                      >Private</span
                    ><span class="bg-neutral-700 rounded-lg py-1 px-2 shadow-xl whitespace-nowrap"
                      >No Active Agreements</span
                    >
                  </div>
                  <div
                    v-else-if="
                      tableRow.status === 'public' && resourceHasActiveContracts(tableRow.id)
                    "
                    class="flex flex-row justify-between items-center space-x-2"
                  >
                    <span
                      class="bg-green-600 rounded-lg shadow-xl w-14 text-center py-1 whitespace-nowrap"
                      >Public</span
                    >
                    <span class="bg-orange-600 rounded-lg py-1 px-2 shadow-xl whitespace-nowrap"
                      >Active Agreements</span
                    >
                  </div>
                  <div
                    v-else-if="
                      tableRow.status === 'public' && !resourceHasActiveContracts(tableRow.id)
                    "
                    class="flex flex-row justify-between items-center space-x-2"
                  >
                    <span
                      class="bg-green-600 rounded-lg shadow-xl w-14 text-center py-1 whitespace-nowrap"
                      >Public</span
                    >
                    <span class="bg-neutral-700 rounded-lg py-1 px-2 shadow-xl whitespace-nowrap"
                      >No Active Agreements</span
                    >
                  </div>
                  <span v-else>Unknown</span>
                </div>

                <!--Action column-->
                <div v-else-if="colIndex === 'actions'">
                  <div
                    v-if="tableRow.status !== 'processing'"
                    class="flex flex-row justify-center items-center space-x-3"
                  >
                    <button
                      v-if="tableRow.status === 'private'"
                      @click="clickedMakeResourcePublic(tableRow.id)"
                    >
                      <svg-lock-closed></svg-lock-closed>
                    </button>
                    <button v-else @click="clickedMakeResourcePrivate(tableRow.id)">
                      <svg-lock-open></svg-lock-open>
                    </button>
                    <button
                      v-if="!resourceHasActiveContracts(tableRow.id)"
                      @click="clickedDeleteResource(tableRow.id)"
                    >
                      <svg-trash-bin></svg-trash-bin>
                    </button>
                  </div>
                </div>

                <!-- All other columns -->
                <span v-else>{{ tableDataItem }}</span>
              </td>
            </tr>
          </tbody>
          <!-- The Authorized Resources Table / Contract Registry Table -->
          <tbody v-else>
            <tr
              v-for="(tableRow, rowIndex) in tableData"
              :key="rowIndex"
              :class="{ 'border-b border-gray-400': rowIndex < tableData.length - 1 }"
            >
              <td
                v-for="(tableDataItem, colIndex) in removeID(tableRow)"
                :key="colIndex"
                class="px-4 py-2"
              >
                <span
                  v-if="
                    tableDataItem !== 'Never' &&
                    (colIndex === 'validFrom' || colIndex === 'validUntil')
                  "
                >
                  {{ formatDate(tableDataItem) }}</span
                >
                <span v-else> {{ tableDataItem }} </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="row-start-2 bg-slate-600"></div>
    </div>

    <div class="h-6"></div>
  </div>
</template>
  
  
<script>
import SvgSimpleCrossRounded from '../components/icons/SvgSimpleCrossRounded.vue'
import SvgTrashBin from '../components/icons/SvgTrashBin.vue'
import SvgLockClosed from '../components/icons/SvgLockClosed.vue'
import SvgLockOpen from '../components/icons/SvgLockOpen.vue'

export default {
  components: { SvgSimpleCrossRounded, SvgTrashBin, SvgLockClosed, SvgLockOpen },
  props: {
    header: {
      type: String
    },
    tableHeaders: {
      type: Array
    },
    emptyTableMessage: {
      type: String
    },
    algorithmTableData: {
      type: Array
    },
    datasetTableData: {
      type: Array
    },
    contractResourceIDs: {
      type: Array
    },
    // Flags for different table types
    requestResourceTable: {
      type: Boolean
    },
    requestApprovalTable: {
      type: Boolean
    },
    uploadedResourcesTable: {
      type: Boolean
    }
  },
  data() {
    return {
      algorithmTabSelected: true
    }
  },
  computed: {
    tableData() {
      return this.algorithmTabSelected ? this.algorithmTableData : this.datasetTableData
    }
  },
  methods: {
    clickedAlgorithm() {
      this.algorithmTabSelected = true
    },
    clickedDataset() {
      this.algorithmTabSelected = false
    },
    clickedRequest(resourceID) {
      // Emitted so that we can update the data of the table afterwards
      this.$emit('request', resourceID)
    },
    clickedCancelRequest(resourceID) {
      this.$emit('cancelRequest', resourceID)
    },
    clickedAcceptApproval(request) {
      this.$emit('acceptApproval', request)
    },
    clickedDenyApproval(request) {
      this.$emit('denyApproval', request)
    },
    clickedDeleteResource(resourceID) {
      this.$emit('deleteResource', resourceID)
    },
    clickedMakeResourcePrivate(resourceID) {
      this.$emit('makeResourcePrivate', resourceID)
    },
    clickedMakeResourcePublic(resourceID) {
      this.$emit('makeResourcePublic', resourceID)
    },
    /**
     *  Following methods format row data for displaying the data:
     */
    removeID(obj) {
      const { id, ...newObj } = obj
      return newObj
    },
    formatRequestResourceRow(obj) {
      const { id, requestID, ...newObj } = obj
      return newObj
    },
    formatApprovalRow(obj) {
      const { id, resourceID, ...newObj } = obj
      return { ...newObj, approval: '' }
    },
    formatUploadedRow(obj) {
      const { id, ...newObj } = obj
      return { ...newObj, actions: '' }
    },
    /**
     * Helpers
     */
    resourceHasActiveContracts(resourceID) {
      if (!this.uploadedResourcesTable) return
      // Returns true if there is at least one active contract with this resource ID
      return this.contractResourceIDs.some((contract) => contract.resourceID === resourceID)
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
    }
  }
}
</script>