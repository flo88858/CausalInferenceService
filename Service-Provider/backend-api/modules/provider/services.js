// =============== Third Party Dependencies =================
const fs = require("fs");
const mongoose = require("mongoose");
const Docker = require('dockerode');
const uuid = require('uuid');
const stripAnsi = require('strip-ansi');

// =============== Database Models ==========================
const Resource = require("../../models/resource");
const Request = require("../../models/request");
const Contract = require("../../models/contract");

// =============== Configurations ============================

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


async function createDatasetResource(payload, participantId, file) {
    let resource;
  
    try {
      // Create Database entry for resource
      resource = new Resource({
        resourceName: payload.resourceName,
        resourceType: 'dataset',
        status: "public",
        provider: participantId,
        executionPath: file.filename,
      });
  
      await resource.save();
  
      return;
    } catch (error) {
      if (resource && resource.executionPath) {
        // Delete dataset file when DB entry fails (e.g. duplicate names)
        fs.unlink(`/app/datasets/${resource.executionPath}`, (unlinkError) => {
          if (unlinkError) {
            console.error('Error deleting file:', unlinkError);
          }
        });
        throw new Error(error);
      }
      throw new Error(error);
    }
}

async function createAlgorithmResource(payload, participantId, algorithmDir) {
	const imageID = uuid.v4()
	let resouceSavedSurcessfully = false
	let resource

	try {
	  // Create Database entry
		resource = new Resource({	
			resourceName: payload.resourceName,
			resourceType: "algorithm",
			provider: participantId,
			executionPath: payload.executionPath,
			status: "processing",
			imageID: imageID,
			language: payload.language 
		});
  
	  await resource.save();
	  resouceSavedSurcessfully = true
  
	  // Create an image
	  let stream = await docker.buildImage(algorithmDir.buffer, {t: imageID});
  
	  // Wait for image creation to be finished
	  await new Promise((resolve, reject) => {
      // This could also be shown to end-users 
      docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res), (progress) =>console.log("progress: " + stripAnsi(progress.stream)));
	  })
	  
	  // Update resource status to public 
	  await Resource.findByIdAndUpdate(resource._id, { status: "public" });
  
  
	} catch (error) {
	  // If an error occurs, delete the database entry
	  if(resouceSavedSurcessfully){
      try {
          await Resource.findByIdAndDelete(resource._id)
          throw new Error(error)
      } catch (deleteError) {
          throw new Error(deleteError)
      }
	  }
      throw new Error(error);
	}
}

async function getProviderResources(participantId) {
    try {
      const resources = await Resource.find({ status: { $ne: "deleted" }, provider: participantId });
      return resources;
    } catch (error) {
      throw new Error('Failed to fetch resources from the database');
    }
}

async function deleteResources(resourceID, participantID){
	try {
	  // Check if resource has active contracts
	  const contracts = await Contract.find({ _id: resourceID });
	  if (contracts.length > 0) {
		  throw new Error('Cannot delete resource with active contracts');
	  }
  
	  // Only look for resources owned by user
	  const resourceToBeDeleted = await Resource.findOne({_id: resourceID, provider: participantID});
  
	  if (!resourceToBeDeleted) {
		  throw new Error("Not found");
	  } else{
  
		// Delete all requests connected to this resource:
		await Request.deleteMany({resourceID: resourceID}) 
  
		if(resourceToBeDeleted.resourceType === "algorithm"){
		  // Delete algorithm image
		  const image = docker.getImage(resourceToBeDeleted.imageID)
		  await image.remove() 
		  // Update DB entry
		  await Resource.findByIdAndUpdate(resourceID, { status: "deleted" });
  
  
		}else if(resourceToBeDeleted.resourceType === "dataset"){
		  // Delete dataset file
		  fs.unlink(`/app/datasets/${resourceToBeDeleted.executionPath}`, async (err) => {
			if (err) {
			  console.error(`Error deleting file: ${err}`);
			} else {
			  // Update DB entry
			  await Resource.findByIdAndUpdate(resourceID, { status: "deleted" });
			}
		  })  
		} else{
		   throw new Error("Resource couldn't be deleted");
		}
	  }
  
	  return
	} catch (error) {
	  throw new Error("Internal Server Error");
	}
}

async function makePrivate(resourceID, participantID) {
    try {
      // Find the resource and check if the provider matches the authenticated user
      const resourceToUpdate = await Resource.findOne({
        _id: resourceID,
        provider: participantID,
      });
  
      if (!resourceToUpdate) {
        throw new Error('Resource not found or you do not have permission to update the status.');
      }
  
      // Update the resource's status to private
      await Resource.findByIdAndUpdate(resourceID, { status: 'private' });
  
      return ;
    } catch (error) {
      throw error;
    }
}

async function makePublic(resourceID, participantID) {
    try {
      // Find the resource and check if the provider matches the authenticated user
      const resourceToUpdate = await Resource.findOne({
        _id: resourceID,
        provider: participantID,
      });
  
      if (!resourceToUpdate) {
        throw new Error('Resource not found or you do not have permission to update the status.');
      }
  
      // Update the resource's status to private
      await Resource.findByIdAndUpdate(resourceID, { status: 'public' });
  
      return ;
    } catch (error) {
      throw error;
    }
}

async function getRequestsByProviderId(providerId) {
    try {
      const requests = await Request.find({ provider: providerId }).populate('resourceID');
      return requests;
    } catch (error) {
      throw new Error('Failed to fetch requests from the database');
    }
}

async function deleteRequestByIdAndProviderId(requestId, providerId) {
    try {
      // Find the request and check if the provider matches the authenticated user
      const requestToDelete = await Request.findOne({
        _id: requestId,
        provider: providerId,
      });
  
      if (!requestToDelete) {
        throw new Error('Not found or you do not have permission to delete this resource');
      }
  
      // Delete the request
      await Request.findByIdAndDelete(requestId);
  
      return null; // Successful deletion
    } catch (error) {
      throw error;
    }
}

async function createContract(consumer, providerId, resourceID, validFrom, validUntil) {
    try {
      // Create Database entry
      const contract = new Contract({
        consumer: consumer,
        provider: providerId,
        resourceID: resourceID,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
      });
  
      await contract.save();
      return ; 
    } catch (error) {
      throw error;
    }
}

async function getContractsByProviderId(providerId) {
    try {
      const contracts = await Contract.find({ provider: providerId }).populate('resourceID');
      if (!contracts || contracts.length === 0) {
        return [];
      }
  
      const now = Date.now();
  
      // Delete contracts that are no longer valid
      const contractsToDelete = contracts.filter(contract => {
        return contract.validUntil <= now; // no longer valid
      });
  
      // Delete contracts 
      const deletionPromises = contractsToDelete.map(contract => Contract.findByIdAndDelete(contract._id));
      await Promise.all(deletionPromises);
  
      // Send back only valid contracts
      const validContracts = contracts.filter(contract => {
        const isValidFrom = contract.validFrom <= now;
        const isValidUntil = contract.validUntil >= now;
        return isValidFrom && isValidUntil;
      });
  
      return validContracts;
    } catch (error) {
      throw error;
    }
}

module.exports = {
    createDatasetResource,
    createAlgorithmResource,
    getProviderResources,
    deleteResources,
    makePrivate,
    makePublic,
    getRequestsByProviderId,
    deleteRequestByIdAndProviderId,
    createContract,
    getContractsByProviderId
  };