// Decodes GAIA-X Credentials 
function requiresAuth(req, res, next) {
    const PARTICIPANT_ID_HEADER_NAME = 'x-gaia-x-sub';
    const PARTICIPANT_CREDENTIAL_HEADER_NAME = 'x-gaia-x-credential';
    
    const participantId = req.headers[PARTICIPANT_ID_HEADER_NAME] 
    const participantCredentialRaw = req.headers[PARTICIPANT_CREDENTIAL_HEADER_NAME] 
  
    if (!participantId) {
      return res.status(400).send({error: `Participant ID missing (header: '${PARTICIPANT_ID_HEADER_NAME}')`});
    }
  
    if (!participantCredentialRaw) {
      return res.status(400).send({error: `Participant credential missing (header: '${PARTICIPANT_CREDENTIAL_HEADER_NAME}'`});
    }
  
    try { 
      res.locals.participantId = participantId;
      res.locals.participantCredential = JSON.parse(participantCredentialRaw);
      next();
    }
    catch (error) {
        res.status(400).send({error: `Failed to decode credentials: ${error.message}`});
    }
    /*
    res.locals.participantId = "participantId"
    next();*/
}


module.exports = {
    requiresAuth
};