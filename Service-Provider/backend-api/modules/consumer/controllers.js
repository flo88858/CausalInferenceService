const services = require('./services')
const mongoose = require('mongoose');

// Datasets
async function getCsvHeaders(req, res) {
  try {
    const userID = res.locals.participantId;
    const datasetID = req.params.datasetID;
    
    if (!mongoose.Types.ObjectId.isValid(datasetID)) {
      return res.status(400).send("Invalid dataset ID");
    }

    const headers = await services.getCsvHeaders(userID, datasetID);

    res.status(200).send(headers);
  } catch (error) {
    if (error.message === 'Invalid dataset ID') {
      res.status(400).send(error.message);
    } else if (error.message === 'No contracts found for the given participant and dataset') {
      res.status(404).json({ error: error.message });
    } else {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
}

async function startAlgorithm(req, res) {
  try {
    const payload = req.body;
    const userID = res.locals.participantId;

    await services.startAlgorithm(payload, userID);

    res.status(200).send("Container spawned successfully.");
  } catch (error) {
    console.error(error);

    if (error.message === 'no contracts found for the given participant and algorithm') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'no contracts found for the given participant and dataset') {
      res.status(404).json({ error: error.message });
    } else if (error.message === "No dataset found matching this name"){
      res.status(400).json({ error: error.message });
    } else if(error.message === "Error starting container"){
      res.status(500).json({ error: error.message });
    }  else {
      console.error(error);
      return res.status(500).json({'error': 'Internal Server Error'}); 
    }
  }
}


async function stopAlgorithm(req, res) {
  const resultID = req.body.resultID;
  const userID = res.locals.participantId;

  try {
    await services.stopAlgorithm(resultID, userID);
    res.status(200).send('Successfully stopped Container');
  } catch (error) {
    console.error(error);

    if (error.message === 'Invalid ownership for the container') {
      res.status(403).send(error.message);
    } else {
      res.status(500).send(error.message);
    }
  }
}

async function pauseAlgorithm(req, res) {
  const resultID = req.body.resultID;
  const userID = res.locals.participantId;

  try {
    await services.pauseAlgorithm(resultID, userID);
    res.status(200).send('Successfully paused Container');
  } catch (error) {
    console.error(error);

    if (error.message === 'Invalid ownership for the container') {
      res.status(403).send(error.message);
    } else {
      res.status(500).send(error.message);
    }
  }
}

async function resumeAlgorithm(req, res) {
  const resultID = req.body.resultID;
  const userID = res.locals.participantId;

  try {
    await services.resumeAlgorithm(resultID, userID);
    res.status(200).send('Successfully resumed Container');
  } catch (error) {
    console.error(error);

    if (error.message === 'Invalid ownership for the container') {
      res.status(403).send(error.message);
    } else {
      res.status(500).send(error.message);
    }
  }
}

async function algorithmStatus(req, res) {
  const resultID = req.params.resultID;
  const userID = res.locals.participantId;

  try {
    const status = await services.getAlgorithmStatus(resultID, userID);
    res.status(200).send(status);
  } catch (error) {
    console.error(error);

    if (error.message === 'Invalid ownership for the container') {
      res.status(403).send(error.message);
    } else {
      res.status(404).send({Status : "noRunningContainer"})    }
  }
}

// Results
async function getResults(req, res) {
  try {
    const participantId = res.locals.participantId;
    const results = await services.getResults(participantId);
    res.status(200).send(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

async function getResultsByID(req, res) {
  try {
    const resultID = req.params.resultID;
    const participantId = res.locals.participantId;

    const result = await services.getResultsByID(resultID, participantId);
    res.status(200).send(result);
  } catch (error) {
    if (error.message === 'No Result found') {
      res.status(404).send(error.message);
    } else if (error.message === 'Forbidden') {
      res.status(403).send(error.message);
    } else {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
}

async function deleteResults(req, res) {
  try {
    const resultID = req.params.resultID;
    const participantId = res.locals.participantId;

    await services.deleteResults(resultID, participantId);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'No Result found') {
      res.status(404).send(error.message);
    } else if (error.message === 'Forbidden') {
      res.status(403).send(error.message);
    } else {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
}


// Resources
async function getResources(req, res) {
  try {
    const participantId = res.locals.participantId;
    const resources = await services.getResources(participantId);
    res.status(200).send(resources);
  } catch (error) {
    console.error(error);
    res.status(404).send('No Resources found: ' + error.message);
  }
}

// Requests
async function postRequests(req, res) {
  try {
    const payload = req.body;
    const participantId = res.locals.participantId;

    if (!mongoose.Types.ObjectId.isValid(payload.resourceID)) {
      return res.status(400).send("Invalid resource ID");
    }

    await services.createRequest(payload, participantId);
    return res.status(201).send('Created request');
  } catch (error) {
    console.error(error);

    if (error.message === 'Invalid resource ID') {
      return res.status(400).send(error.message);
    } else if (error.message === 'Resource not found') {
      return res.status(404).send(error.message);
    } else if (error.message === 'Cannot create a request for a private resource') {
      return res.status(403).send(error.message);
    } else {
      return res.status(500).send('Internal Server Error');
    }
  }
}

async function getRequests(req, res) {
  try {
    const participantId = res.locals.participantId;
    const requests = await services.getRequests(participantId);
    return res.status(200).send(requests);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
}

async function deleteRequests(req, res) {
  try {
    const requestID = req.params.requestID;
    const participantID = res.locals.participantId;

    if (!mongoose.Types.ObjectId.isValid(requestID)) {
      return res.status(400).send("Invalid request ID");
    }

    await services.deleteRequests(requestID, participantID);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting request:', error);

    if(error.message === "Invalid request ID"){
       res.status(400).send(error.message)
    } else if (error.message === 'Not found or you do not have permission to delete this resource') {
      return res.status(404).send(error.message);
    } else {
      return res.status(500).send('Internal Server Error');
    }
  }
}

// Contracts
async function getContracts(req, res) {
  try {
    const participantID = res.locals.participantId;
    const validContracts = await services.getContracts(participantID);

    return res.status(200).send(validContracts);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
}


  
module.exports = {
  getCsvHeaders,
  startAlgorithm,
  stopAlgorithm,
  pauseAlgorithm,
  resumeAlgorithm,
  algorithmStatus,
  getResults,
  getResultsByID,
  deleteResults,
  getResources,
  postRequests,
  getRequests,
  deleteRequests,
	getContracts,
}