// =============== Dependencies =================
const fs = require("fs");
const mongoose = require("mongoose");
const Docker = require('dockerode');
const tar = require('tar-stream');

const {readFileHeaders} = require('../../helpers/utils')
 

// =============== Database Models ==========================
const Result = require("../../models/result");
const Resource = require("../../models/resource");
const Request = require("../../models/request");
const Contract = require("../../models/contract");

// =============== Configurations ===========================

// Initialize Docker client
const docker = new Docker();

// Connection to the Database
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
	db.on("error", (error) => console.error(error));
	db.once("open", () => {
	console.log("Connected to Database");
});


// =============== Services =================================


async function getCsvHeaders(userID, datasetID) {
	const datasetResource = await Resource.findById(datasetID);
  
	// Check if User is owner of the resource or has a contract before reading the dataset file
	if (datasetResource.provider !== userID) {
	  try {
		const datasetContracts = await Contract.find({ consumer: userID, resourceID: datasetID });
		if (!datasetContracts || datasetContracts.length === 0) {
		  throw new Error('No contracts found for the given participant and dataset');
		}
	  } catch (error) {
		throw new Error(error.message);
	  }
	}
  
	// Get Execution Path for dataset
	const datasetExecutionPath = datasetResource.executionPath;
  
	// Check if dataset exists
    const filePath = `/app/datasets/${datasetExecutionPath}`;
    if (!fs.existsSync(filePath)) {
	  throw new Error('No dataset found matching this name');
	}

  	// Send Headers of resource
	const headers = await readFileHeaders(datasetExecutionPath)
	return await headers
}

async function startAlgorithm(payload, userID) {

	const algorithmResource = await Resource.findById(payload.algorithmID)
	const datasetResource =  await Resource.findById(payload.datasetID)
	const algorithmExecutionPath = algorithmResource.executionPath
	const algorithmImageID = algorithmResource.imageID
	const algorithmLanguage = algorithmResource.language
	const datasetExecutionPath = datasetResource.executionPath
  
  
	// TODO: check if contract is still valid. Delete otherwise
	try {
	  // Check if User is owner for this algorithm or has a valid contract
	  if(algorithmResource.provider !== userID){
		const algorithmContracts = await Contract.find({consumer : userID, resourceID: payload.algorithmID});
		if (!algorithmContracts || algorithmContracts.length === 0) {
		  throw new Error("no contracts found for the given participant and algorithm")
		}
	  }
	  // Check if User is owner for this dataset or has a valid contract
	  if(datasetResource.provider !== userID){
		const datasetContracts = await Contract.find({consumer : userID, resourceID: payload.datasetID});
		if (!datasetContracts || datasetContracts.length === 0) {
			throw new Error("no contracts found for the given participant and dataset")
		}
	  }
	} catch (error) {
	  throw new Error(error); 
	}
  

  
	const datasetPath = `/app/datasets/${datasetExecutionPath}`;
    
	// Check if dataset exists
	if (!fs.existsSync(datasetPath)) {
	  console.log("Dataset doesnt exist");
	  throw new Error("No dataset found matching this name");
	} 
  

	// Create Database entry
	const result = new Result({
		user: userID,
		resultName: payload.resultName,
		algorithm: payload.algorithmID,
		dataset: payload.datasetID,
		parameters: {
		x: payload.x,
		y: payload.y,
		alpha: payload.alpha,
		},
	});
	await result.save();

	// The resultID of the new Database entry
	const resultID = result._id

	// Look up indices for parameters (algorithm requires indices)
	const headers = await readFileHeaders(datasetExecutionPath)
	const indexOfX = (headers.findIndex(item => item===payload.x) + 1).toString()
	const indexOfY = (headers.findIndex(item => item===payload.y) + 1).toString()


	try {
		// Create a Docker container
		const container = await docker.createContainer({
			Image: algorithmImageID, 
			name: `${resultID}`,
			Cmd: [algorithmLanguage,`./${algorithmExecutionPath}`, `./${datasetExecutionPath}`, indexOfX , indexOfY , payload.alpha, resultID ],
			HostConfig: {
				Binds: [ 
					`service-provider_volume-results:/app/results` , 
				],      
				AutoRemove: true, // Automatically remove the container when it exits
			}
		});

		// Create a tar stream
		const pack = tar.pack();

		// Add the CSV file to the tar stream
		pack.entry({ name: datasetExecutionPath }, fs.readFileSync(`/app/datasets/${datasetExecutionPath}`));
		pack.finalize();

		// Create a buffer to store the tar stream
		const buffer = [];
		pack.on('data', (chunk) => buffer.push(chunk));
		pack.on('end', () => {
			const tarBuffer = Buffer.concat(buffer);
			container.putArchive(tarBuffer, { path: `/app` }, () => {
				// Start the container
				container.start();
				return
			});
		})

		// Log the container's output (dev)
		const logsStream = await container.logs({
			follow: true,
			stdout: true, 
			stderr: true, 
		});
		logsStream.on('data', (chunk) => {
			console.log(chunk.toString()); 
		});

	} catch (error) {
		console.error('Error running Julia container:', error);
		throw new Error("Error starting container");
	}

}  

async function checkContainerOwnership(resultID, userID) {
	const result = await Result.findOne({ _id: resultID, user: userID });
	if (!result) {	
	  throw new Error('Invalid ownership for the container');
	}
}
  
async function stopAlgorithm(resultID, userID) {
	try {
		await checkContainerOwnership(resultID, userID);

		const container = docker.getContainer(resultID);
		await container.stop();
		
		return ;
	} catch (error) {
		throw new Error('Failed to stop container');
	}
}

async function pauseAlgorithm(resultID, userID) {
	try {
		await checkContainerOwnership(resultID, userID);

		const container = docker.getContainer(resultID);
		await container.pause();

		return ;
	} catch (error) {
		throw new Error('Failed to pause container');
	}
}

async function resumeAlgorithm(resultID, userID) {
	try {
		await checkContainerOwnership(resultID, userID);

		const container = docker.getContainer(resultID);
		await container.unpause();

		return ;
	} catch (error) {
		throw new Error('Failed to resume container');
	}
}

async function getAlgorithmStatus(resultID, userID) {
	try {
	  await checkContainerOwnership(resultID, userID);
  
	  const container = docker.getContainer(resultID);
	  const containerInfo = await container.inspect();
	  const status = containerInfo.State;
  
	  return status;
	} catch (error) {
	  throw new Error('Failed to get algorithm status');
	}
}

async function getResults(participantId) {
	try {
	  const results = await Result.find({ user: participantId })
		.populate({
		  path: 'algorithm',
		  select: 'resourceName',
		})
		.populate({
		  path: 'dataset',
		  select: 'resourceName',
		});
	  return results;
	} catch (error) {
	  throw new Error('Failed to fetch results from the database');
	}
}

//TODO: Still needed?
async function getResultsByID(resultID, participantId) {
	try {
	  const result = await Result.findOne({ _id: resultID });
  
	  if (!result) {
		throw new Error('No Result found');
	  }
  
	  if (result.user !== participantId) {
		throw new Error('Forbidden');
	  }
  
	  return result;
	} catch (error) {
	  throw error;
	}
}
  
async function deleteResults(resultID, participantId) {
	try {
	  const result = await Result.findOne({ _id: resultID });
  
	  if (!result) {
		throw new Error('No Result found');
	  }
  
	  if (result.user !== participantId) {
		throw new Error('Forbidden');
	  }
  
	  await result.deleteOne();
	} catch (error) {
	  throw error;
	}
}

async function getResources(participantId) {
	try {
	  const resources = await Resource.find({ status: "public", provider: { $ne: participantId } });
	  return resources;
	} catch (error) {
	  throw new Error('Failed to fetch resources from the database');
	}
}

async function createRequest(payload, participantId) {
	try {
	  // Check if the resource exists and is public
	  const resource = await Resource.findById(payload.resourceID);
  
	  if (!resource) {
		throw new Error('Resource not found');
	  }
  
	  if (resource.status !== 'public') {
		throw new Error('Cannot create a request for a private resource');
	  }
  
	  // Create Database entry
	  const request = new Request({
		consumer: participantId,
		provider: resource.provider,
		resourceID: payload.resourceID,
		validFrom: payload.validFrom,
		validUntil: payload.validUntil,
	  });
  
	  await request.save();
  
	  return;
	} catch (error) {
	  throw error;
	}
}

async function getRequests(participantId) {
	try {
	  const requests = await Request.find({ consumer: participantId });
	  return requests;
	} catch (error) {
	  throw new Error('Failed to fetch requests from the database');
	}
}

async function deleteRequests(requestID, participantID) {	
	try {
		// Find the request and check if the consumer matches the authenticated user
		const requestToDelete = await Request.find({_id: requestID, consumer: participantID});

		if (!requestToDelete) {
			throw new Error("Not found or you do not have permission to delete this resource");
		}

		// Delete the request
		await Request.findByIdAndDelete(requestID);

		return
	} catch (error) {
		throw new Error('Failed to delete request from the database');
	}
}


async function getContracts(participantID) {
	try {
	  // Fetch User contracts populated with resources
	  const populatedContracts = await Contract.find({ consumer: participantID }).populate('resourceID');
  
	  if (!populatedContracts || populatedContracts.length === 0) {
		return [];
	  }
  
	  const now = Date.now();
  
	  // Delete contracts that are no longer valid
	  const contractsToDelete = populatedContracts.filter((contract) => {
		return contract.validUntil <= now; // no longer valid
	  });
  
	  // Delete contracts
	  const deletionPromises = contractsToDelete.map((contract) => Contract.findByIdAndDelete(contract._id));
	  await Promise.all(deletionPromises);
  
	  // Send back only valid contracts
	  const validContracts = populatedContracts.filter((contract) => {
		const isValidFrom = contract.validFrom <= now;
		const isValidUntil = contract.validUntil >= now;
		return isValidFrom && isValidUntil;
	  });
  
	  return validContracts;
	} catch (error) {
	  throw new Error('Failed to fetch contracts from the database');
	}
  }

module.exports = {
	getCsvHeaders,
	startAlgorithm,
	stopAlgorithm,
	pauseAlgorithm,
	resumeAlgorithm,
	getAlgorithmStatus,
	getResults,
	getResultsByID,
	deleteResults,
	getResources,
	createRequest,
	getRequests,
	deleteRequests,
	getContracts
  };