const {
    CONTRACT_ADDRESS = "contractservice",
    CONTRACT_PORT = 8002,
    BACKEND_SERVICE_ID = "causalinference.serviceID",
    BACKEND_IGNORE_CONTRACTS = false 
  } = process.env;
  
const CONTRACT_SERVICE_URL = `http://${CONTRACT_ADDRESS}:${CONTRACT_PORT}/contracts`;
  
  
function buildContractStub(participant, service) {
    const now = Math.round(Date.now() / 1000);
    return {
        participant: participant,
        service: service,
        data: {
            validFrom: now,
            validUntil: now + 86400 * 365
        }
    };
}
  
class ContractServiceError extends Error {
    constructor(msg) {
        super(JSON.stringify(msg));
        Object.setPrototypeOf(this, ContractServiceError.prototype);
    }
}
  
async function getContract(participant, service) {

    console.log("participant: " + participant);
    console.log("service: " + service);

    const url = `${CONTRACT_SERVICE_URL}?participant=${participant}&service=${service}`;
    const res = await fetch(url);

    if (res.status === 404) {
        return undefined;
    }

    if (!res.ok) {
        throw new ContractServiceError(await res.json());
    }

    return await res.json();
}
  
function requiresContract () {
    return async(req, res, next)=>{
      if (BACKEND_IGNORE_CONTRACTS) {
          res.locals.contract = buildContractStub(res.locals.participantId, BACKEND_SERVICE_ID);
          next();
          return;
      }
  
      const contract = await getContract(res.locals.participantId, BACKEND_SERVICE_ID);
  
      const unauthorized = (message) => {
          res.status(403).json({"error": "invalid_contract", "details": message});
      }
  
      // Check if participant has contract
      if (!contract) {
          unauthorized(`The participant ${res.locals.participantId} does not appear to have a valid contract for this service`);
          return;
      }
  
      // Check basic contract validity
      const now = Math.round(Date.now() / 1000);
      if (now < contract.data.validFrom) {
          const validDateFormatted = (new Date(contract.data.validFrom * 1000)).toISOString()
          unauthorized(`The contract for participant ${res.locals.participantId} is not yet valid (validity starts at ${validDateFormatted})`);
          return;
      }
  
      if (now > contract.data.validUntil) {
          const validDateFormatted = (new Date(contract.data.validUntil * 1000)).toISOString()
          unauthorized(`The contract for participant ${res.locals.participantId} is not valid anymore (validity ended at ${validDateFormatted})`);
          return;
      }
  
      // all good - add contract for later middleware
      res.locals.contract = contract;
      next();
    }
  }

module.exports = {
    requiresContract
};