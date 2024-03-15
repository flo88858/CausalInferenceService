
<template>
  <div>
    <div v-if="userNotConsumer" class="flex justify-evenly items-center">
      <a-modal :heading="'No Consumer Contract'">
        It appears that you do not currently have a valid consumer contract for this service. If
        you're interested in becoming a resource consumer, please don't hesitate to contact us.
      </a-modal>
    </div>
    <!-- The Success Modal -->
    <a-modal
      v-else-if="showModal && !serverError"
      @clickedBackButton="showModal = false"
      :heading="'Calculating :)'"
      :withButton="true"
    >
      The Algorithm is calculating. To check the status or see the result, please refer to
      <router-link class="font-bold hover:text-blue-400" to="/results">Results</router-link>. This
      calculation can be found under the name: <span class="italic">{{ formData.resultName }}</span
      >.
    </a-modal>
    <!-- The Error Modal -->
    <a-modal
      v-else-if="showModal && serverError"
      :heading="'Error :('"
      :errorMessage="serverErrorMessage"
      @clickedBackButton="
        () => {
          showModal = false
          serverError = false
        }
      "
    >
      Unfortunately an error has accurate while trying to start the Algorithm. Please try to start
      the algorithm again.
    </a-modal>
    <!-- The Input Form -->
    <div
      v-else
      class="max-w-xl w-1/2 bg-gray-800 text-gray-200 shadow-xl rounded-lg p-12 m-12 relative"
    >
      <div class="absolute top-4 right-4">
        <router-link to="/info"><SvgQuestionmark></SvgQuestionmark></router-link>
      </div>
      <form class="grid grid-cols-6 grid-rows-10">
        <div class="col-span-6 mb-6">
          <h1 class="text-2xl text-center font-bold">Calculate Casual Inference</h1>
        </div>
        <div class="col-span-6 row-start-2 mx-4">
          <a-input
            v-model="v$.formData.resultName.$model"
            label="Result Name"
            :error="resultNameError"
            :placeholder="'Give your result a name'"
          />
        </div>
        <div class="col-span-6 row-start-3">
          <div class="border-b border-gray-400 my-6"></div>
        </div>
        <div class="col-span-6 row-start-4 mx-4 mb-6">
          <h2 class="text-lg font-bold">Algorithm and Dataset</h2>
          <p>Choose the algorithm and dataset you want to use for your next calculation.</p>
        </div>
        <div class="col-span-3 row-start-5 mx-4">
          <a-dropdown
            label="Algorithm"
            :error="algorithmError"
            :options="algorithms"
            @changedValue="handleChangedValueAlgorithm"
          ></a-dropdown>
        </div>
        <div class="col-span-3 col-start-4 row-start-5 mx-4">
          <a-dropdown
            label="Dataset"
            :error="datasetError"
            :options="datasets"
            @changedValue="handleChangedValueDataset"
            @blur="handleBlur"
          ></a-dropdown>
        </div>
        <div class="col-span-6 row-start-6">
          <div class="border-b border-gray-400 my-6"></div>
        </div>
        <div class="col-span-6 row-start-7 mx-4 mb-6">
          <h2 class="text-lg font-bold">Parameters</h2>
          <p>Choose the parameters you want to use for the algorithm.</p>
        </div>
        <div class="col-span-2 row-start-8 mx-4">
          <a-input v-model="v$.formData.alpha.$model" label="α-Value" :error="alphaError" />
        </div>
        <div class="col-span-2 col-start-3 row-start-8 mx-4">
          <a-dropdown
            label="x-Value"
            :error="xError"
            :options="options"
            @changedValue="handleChangedValueX"
          ></a-dropdown>
        </div>
        <div class="col-span-2 col-start-5 row-start-8 mx-4">
          <a-dropdown
            label="y-Value"
            :error="yError"
            :options="options"
            @changedValue="handleChangedValueY"
          ></a-dropdown>
        </div>
        <div class="col-span-6 row-start-9">
          <div class="border-b border-gray-400 my-6"></div>
        </div>
        <div class="col-span-6 row-start-10 flex justify-center items-center">
          <button
            class="w-3/4 flex items-center justify-center bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-4"
            type="button"
            @click="atButtonClick"
          >
            <svg
              v-if="isProcessing"
              class="w-6 h-6 text-gray-200 animate-spin"
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
            <span v-else>Calculate casual inference</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import ADropdown from './ADropdown.vue'
import AInput from './AInput.vue'
import AModal from './AModal.vue'
import SvgQuestionmark from './icons/SvgQuestionmark.vue'
import { useVuelidate } from '@vuelidate/core'
import { required, decimal, between, alphaNum, maxLength } from '@vuelidate/validators'

export default {
  components: {
    ADropdown,
    AInput,
    AModal,
    SvgQuestionmark
  },
  setup() {
    return { v$: useVuelidate() }
  },
  data() {
    return {
      formData: {
        resultName: '',
        algorithm: '',
        dataset: '',
        alpha: '',
        x: '',
        y: ''
      },
      options: [], // csv-headers
      resources: [],
      errors: false,
      isProcessing: false,
      showModal: false,
      serverError: false,
      serverErrorMessage: 'No message available ',
      userNotConsumer: false
    }
  },
  validations() {
    return {
      formData: {
        alpha: {
          required,
          decimal,
          between: between(0.0001, 0.5)
        },
        x: {
          //TODO: Vuelidate that x and y must be different
          required
        },
        y: {
          required
        },
        algorithm: {
          required
        },
        dataset: {
          required
        },
        resultName: {
          required,
          alphaNum,
          maxLength: maxLength(50)
        }
      }
    }
  },
  mounted() {
    this.fetchResources()
  },
  computed: {
    algorithms() {
      return this.resources
        .filter((resource) => resource.resourceType === 'algorithm')
        .map((resource) => resource.resourceName)
    },
    datasets() {
      return this.resources
        .filter((resource) => resource.resourceType === 'dataset')
        .map((resource) => resource.resourceName)
    },
    resultNameError() {
      if (!this.errors) {
        return ''
      } else if (this.v$.formData.resultName.required.$invalid) {
        return 'You must provide a name for your result'
      } else if (this.v$.formData.resultName.alphaNum.$invalid) {
        return 'The result name must only contain alphabetic characters or numbers'
      } else if (this.v$.formData.resultName.maxLength.$invalid) {
        return `The result name cannot be longer than 30 characters`
      } else if (this.error) {
        return 'An unexpected error has occurred'
      } else {
        return ''
      }
    },
    algorithmError() {
      if (!this.errors) {
        return ''
      } else if (this.v$.formData.algorithm.required.$invalid) {
        return 'You must choosen an existing algorithm'
      } else {
        return ''
      }
    },
    datasetError() {
      if (!this.errors) {
        return ''
      } else if (this.v$.formData.dataset.required.$invalid) {
        return 'You must choosen an existing dataset'
      } else {
        return ''
      }
    },
    alphaError() {
      if (!this.errors) {
        return ''
      } else if (this.v$.formData.alpha.required.$invalid) {
        return 'You must provide a value for alpha'
      } else if (this.v$.formData.alpha.decimal.$invalid) {
        return 'Alpha must be decimal number'
      } else if (this.v$.formData.alpha.between.$invalid) {
        return 'Alpha must be between 0.0001 and 0.5'
      } else if (this.error) {
        return 'An unexpected error has occurred'
      } else {
        return ''
      }
    },
    xError() {
      if (!this.errors) {
        return ''
      } else if (this.v$.formData.x.required.$invalid) {
        return 'You must provide an existing value for X'
      } else {
        return ''
      }
    },
    yError() {
      if (!this.errors) {
        return ''
      } else if (this.v$.formData.y.required.$invalid) {
        return 'You must provide an existing value for Y'
      } else {
        return ''
      }
    }
  },
  methods: {
    async fetchContractResources() {
      const contractResources = await this.$backendApi.get('/consumer/contracts')

      const filteredContractResources = contractResources.data.map((resource) => {
        return {
          resourceID: resource.resourceID._id,
          resourceName: resource.resourceID.resourceName,
          resourceType: resource.resourceID.resourceType
        }
      })
      return filteredContractResources
    },

    async fetchOwnResources() {
      const ownResources = await this.$backendApi.get('/provider/resources')

      const filteredOwnResources = ownResources.data.map((resource) => {
        return {
          resourceID: resource._id,
          resourceName: resource.resourceName,
          resourceType: resource.resourceType
        }
      })
      return filteredOwnResources
    },

    async fetchResources() {
      let filteredOwnResources = []
      let filteredContractResources = []

      try {
        filteredContractResources = await this.fetchContractResources()
      } catch (error) {
        if (error.response.status === 403) {
          this.userNotConsumer = true
        } else {
          console.log('error: ' + error)
        }
      }

      try {
        filteredOwnResources = await this.fetchOwnResources()
      } catch (error) {
        console.log('error: ' + error)
      }

      const authorizedResources = [...filteredOwnResources, ...filteredContractResources]

      this.resources = authorizedResources
    },
    async atButtonClick() {
      // Only submit form if inputs are valid
      this.errors = this.v$.formData.$invalid
      if (!this.errors) {
        console.log(JSON.stringify(this.formData))

        const algorithmResourceID = this.findResourceIdByResourceName(this.formData.algorithm)
        const datasetResourceID = this.findResourceIdByResourceName(this.formData.dataset)

        const payload = {
          resultName: this.formData.resultName,
          algorithmID: algorithmResourceID,
          datasetID: datasetResourceID,
          x: this.formData.x,
          y: this.formData.y,
          alpha: this.formData.alpha
        }

        try {
          this.isProcessing = true
          const res = await this.$backendApi.post('/consumer/algorithm/start', payload)
          this.showModal = true
          this.isProcessing = false
          // Open Success window
        } catch (error) {
          this.serverErrorMessage = error.response.data
          this.serverError = true
          this.showModal = true
          this.isProcessing = false
          // Open Error window
        }
      } else {
        console.log('Errors')
      }
    },
    /** TODO: Does V-Bind not work here? */
    handleChangedValueX(value) {
      this.formData.x = value
    },
    handleChangedValueY(value) {
      this.formData.y = value
    },
    handleChangedValueAlgorithm(value) {
      this.formData.algorithm = value
    },
    handleChangedValueDataset(value) {
      this.formData.dataset = value
    },
    // Fetches CSV-Options when a correct dataset is picked
    handleBlur() {
      // Timeout is needed because validation takes some time before data is saved to form
      setTimeout(() => {
        if (this.formData.dataset !== '' && this.datasets.includes(this.formData.dataset)) {
          const datasetID = this.findResourceIdByResourceName(this.formData.dataset)

          if (datasetID) {
            this.$backendApi
              .get(`/consumer/dataset/headers/${datasetID}`)
              .then((response) => {
                this.options = response.data
              })
              .catch((error) => {
                console.error('Error while fetching csv-options:', error)
              })
          }
        }
      }, 100)
    },
    findResourceIdByResourceName(resourceName) {
      const matchingResource = this.resources.find((resource) => {
        return resource.resourceName === resourceName
      })

      return matchingResource ? matchingResource.resourceID : null
    }
  }
}
</script>
  