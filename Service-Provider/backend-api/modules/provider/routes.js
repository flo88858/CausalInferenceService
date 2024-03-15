// =============== Third Party Dependencies =================
const express = require('express')
const router = express.Router()


// =============== Controller ===============================
const controllers = require('./controllers')

// =============== Middleware ===============================
const {requiresAuth} = require('../../middleware/auth.js')
const {requiresContract} = require('../../middleware/contract.js')
const {isProvider} = require('../../middleware/role.js')
const {uploadDataset} = require('../../middleware/uploader.js')
const {uploadAlgorithm} = require('../../middleware/uploader.js')

  
// =============== Routes ==================================


// Resources
router.post('/resources/dataset', requiresAuth, requiresContract(), isProvider, uploadDataset.single('datasetFile'), controllers.postDataset)
router.post('/resources/algorithm', requiresAuth, requiresContract(), isProvider, uploadAlgorithm.single('algorithmDirectory'), controllers.postAlgorithm)
router.get('/resources', requiresAuth, requiresContract(), isProvider, controllers.getResources)
router.delete('/resources/:resourceID', requiresAuth, requiresContract(), isProvider, controllers.deleteResources)
router.put('/resources/:resourceID/makePrivate', requiresAuth, requiresContract(), isProvider, controllers.makePrivate)
router.put('/resources/:resourceID/makePublic', requiresAuth, requiresContract(), isProvider, controllers.makePublic)

// Requests
router.get('/requests', requiresAuth, requiresContract(), isProvider, controllers.getRequests)
router.delete('/requests/:requestID', requiresAuth, requiresContract(), isProvider, controllers.deleteRequests)

// Contracts
router.post('/contracts', requiresAuth, requiresContract(), isProvider, controllers.postContracts)
router.get('/contracts', requiresAuth, requiresContract(), isProvider, controllers.getContracts)



module.exports = router