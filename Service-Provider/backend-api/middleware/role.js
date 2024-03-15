// Authorization middleware
function isProvider(req, res, next) {
    const contract = res.locals.contract
    if (contract.data.isProvider !== "true") return res.status(403).send("Participant is not a povider"); 
    next();
}
  
function isConsumer(req, res, next) {
    const contract = res.locals.contract
    if (contract.data.isConsumer !== "true") return res.status(403).send("Participant is not a consumer"); 
    next();
}


module.exports = {
    isProvider, isConsumer
};