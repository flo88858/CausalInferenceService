const services = require('./services')
const mongoose = require('mongoose');


// Resources
async function postDataset(req, res) {
	const payload = req.body;
	const file = req.file;
  
	if(!payload.resourceName || payload.resourceName === ""){
		return res.status(400).send({"message" : "Not a valid resource name"})
	} 

	if (!file) {
	  return res.status(400).json({ message: 'No file uploaded' });
	}
  
	try {
	  const participantId = res.locals.participantId;
	  await services.createDatasetResource(payload, participantId, file);
	  return res.status(201).send("Created resource")
	} catch (error) {
	  console.error(error);
	  return res.status(500).send('Internal Server Error');
	}
}

async function postAlgorithm(req, res){
	const algorithmDir = req.file; // The uploaded tar-directory
	const payload = req.body;
	const participantId = res.locals.participantId;
  
	if(!payload.resourceName || payload.resourceName === ""){
	  return res.status(400).send({"message" : "Not a valid resource name"})
	} 
	if(!payload.executionPath || payload.executionPath === ""){
	  return res.status(400).send({"message" : "Not a valid execution path"})
	} 
	if(!payload.language || payload.language === ""){
	  return res.status(400).send({"message" : "Not a valid language"})
	} 
  
	try {
		res.status(200).send({"message" : "Started building image"})
		services.createAlgorithmResource(payload, participantId, algorithmDir);
	} catch (error) {
		console.error(error);
		return res.status(500).send(error.message);
	}
}

async function getResources(req, res) {
	try {
	  const participantId = res.locals.participantId;
	  const resources = await services.getProviderResources(participantId);
	  return res.status(200).send(resources);
	} catch (error) {
	  console.error(error);
	  return res.status(404).send('No Resources found: ' + error.message);
	}
  }

async function deleteResources(req, res) {
	const resourceID = req.params.resourceID;
	const participantID = res.locals.participantId;

	if (!mongoose.Types.ObjectId.isValid(resourceID)) {
		return res.status(400).send('Invalid resource ID');
	}

	try {
	  await services.deleteResources(resourceID, participantID);
	  return res.status(204).send("Resource deleted successfully");
	} catch (error) {
	  console.error('Error deleting resource:', error);
  
	  if (error.message === 'Cannot delete resource with active contracts') {
		return res.status(400).send(error.message);
	  } else if (error.message === 'Not found') {
		return res.status(404).send(error.message);
	  } else {
		return res.status(500).send('Internal Server Error');
	  }
	}
}	

async function makePrivate(req, res) {
	const resourceID = req.params.resourceID;
	const participantID = res.locals.participantId;

	// Check if ID is valid
	if (!mongoose.Types.ObjectId.isValid(resourceID)) {
	  return res.status(400).send('Invalid resource ID');
	}
  
	try {
	  await services.makePrivate(resourceID, participantID);
	  return res.json({ message: 'Resource updated to private successfully.' });
	} catch (error) {
	  console.error(error);
  
	  if (error.message === 'Resource not found or you do not have permission to update the status.') {
		return res.status(404).json({ message: error.message });
	  } else {
		return res.status(500).json({ message: 'Internal Server Error' });
	  }
	}
}

async function makePublic(req, res) {
	const resourceID = req.params.resourceID;
	const participantID = res.locals.participantId;

	// Check if ID is valid
	if (!mongoose.Types.ObjectId.isValid(resourceID)) {
	  return res.status(400).send('Invalid resource ID');
	}
  
	try {
	  await services.makePublic(resourceID, participantID);
	  return res.json({ message: 'Resource updated to public successfully.' });
	} catch (error) {
	  console.error(error);
  
	  if (error.message === 'Resource not found or you do not have permission to update the status.') {
		return res.status(404).json({ message: error.message });
	  } else {
		return res.status(500).json({ message: 'Internal Server Error' });
	  }
	}
}

// Requests
async function getRequests(req, res) {
	try {
	  const providerId = res.locals.participantId;
	  const requests = await services.getRequestsByProviderId(providerId);
	  return res.status(200).send(requests);
	} catch (error) {
	  console.error(error);
	  return res.status(500).send('Internal Server Error');
	}
}

async function deleteRequests(req, res) {
	const requestId = req.params.requestID;
	const providerId = res.locals.participantId;
  
	if (!mongoose.Types.ObjectId.isValid(requestId)) {
	  return res.status(400).send('Invalid request ID');
	}
  
	try {
	  await services.deleteRequestByIdAndProviderId(requestId, providerId);
	  return res.status(204).send();
	} catch (error) {
	  console.error('Error deleting request:', error);
  
	  if (error.message === 'Not found or you do not have permission to delete this resource') {
		return res.status(404).send(error.message);
	  } else {
		return res.status(500).send('Internal Server Error');
	  }
	}
}

// Contracts
// TODO: Change to accept request and only use requestID
async function postContracts(req, res) {
	const payload = req.body;
	const providerId = res.locals.participantId;
  
	const validFrom = payload.validFrom;
	const validUntil = payload.validUntil;
	const resourceID = payload.resourceID;
	const consumer = payload.consumer;
  
	if (!resourceID) {
	  return res.status(400).json({ 'error': "'resourceID' is a required parameter" });
	}
	if (!consumer) {
	  return res.status(400).json({ 'error': "'consumer' is a required parameter" });
	}
	if (!validFrom) {
	  return res.status(400).json({ 'error': "'validFrom' is a required parameter" });
	}
	if (!validUntil) {
	  return res.status(400).json({ 'error': "'validUntil' is a required parameter" });
	}
  
	try {
	  await services.createContract(consumer, providerId, resourceID, validFrom, validUntil);
	  return res.status(204).send("Added Contract");
	} catch (err) {
	  console.error('Error creating contract:', err);
	  return res.status(500).json({ 'error': err.message || 'Internal Server Error' });
	}
}

async function getContracts(req, res) {
	try {
	  const providerId = res.locals.participantId;
	  const contracts = await services.getContractsByProviderId(providerId);
	  return res.status(200).send(contracts);
	} catch (error) {
	  console.error('Error fetching contracts:', error);
	  return res.status(500).json({ 'error': error.message || 'Internal Server Error' });
	}
}
  
module.exports = {
	postDataset,
	postAlgorithm,
	getResources,
	deleteResources,
	makePrivate,
	makePublic,
	getRequests,
	deleteRequests,
	postContracts,
	getContracts,
}