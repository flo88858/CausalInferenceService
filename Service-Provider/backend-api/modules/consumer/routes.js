// =============== Third Party Dependencies =================
const express = require('express')
const router = express.Router()

// =============== Controller ===============================
const controllers = require('./controllers')

// =============== Middleware ===============================
const {requiresAuth} = require('../../middleware/auth.js')
const {requiresContract} = require('../../middleware/contract.js')
const {isConsumer} = require('../../middleware/role.js')

// =============== Routes ==================================

// Datasets
router.get('/dataset/headers/:datasetID', requiresAuth, requiresContract(), isConsumer, controllers.getCsvHeaders)

// Algorithms
router.post('/algorithm/start', requiresAuth, requiresContract(), isConsumer, controllers.startAlgorithm)
router.post('/algorithm/stop', requiresAuth, requiresContract(), isConsumer, controllers.stopAlgorithm)
router.post('/algorithm/pause', requiresAuth, requiresContract(), isConsumer, controllers.pauseAlgorithm)
router.post('/algorithm/resume', requiresAuth, requiresContract(), isConsumer, controllers.resumeAlgorithm)
router.get('/algorithm/status/:resultID', requiresAuth, requiresContract(), isConsumer, controllers.algorithmStatus)

// Results
router.get('/results', requiresAuth, requiresContract(), isConsumer, controllers.getResults)
router.get('/results/:resultID', requiresAuth, requiresContract(), isConsumer, controllers.getResultsByID)
router.delete('/results/:resultID', requiresAuth, requiresContract(), isConsumer, controllers.deleteResults)

// Resources
router.get('/resources', requiresAuth, requiresContract(), isConsumer, controllers.getResources)

// Requests
router.post('/requests', requiresAuth, requiresContract(), isConsumer, controllers.postRequests)
router.get('/requests', requiresAuth, requiresContract(), isConsumer, controllers.getRequests)
router.delete('/requests/:requestID', requiresAuth, requiresContract(), isConsumer, controllers.deleteRequests)

// Contracts
router.get('/contracts', requiresAuth, requiresContract(), isConsumer, controllers.getContracts)



module.exports = router