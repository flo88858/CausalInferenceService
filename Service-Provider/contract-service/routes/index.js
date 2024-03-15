const mongojs = require('mongojs');
const {
    CONTRACT_MONGODB_HOST = 'contractDB',
    CONTRACT_MONGODB_PORT = 27017,
    CONTRACT_MONGODB_USER = 'contractstore',
    CONTRACT_MONGODB_PASSWORD = 'password',
    CONTRACT_MONGODB_DATABASE = 'contracts',
    CONTRACT_MONGODB_COLLECTION = 'contracts'
} = process.env;

const db = mongojs(`${CONTRACT_MONGODB_USER}:${CONTRACT_MONGODB_PASSWORD}@${CONTRACT_MONGODB_HOST}:${CONTRACT_MONGODB_PORT}/${CONTRACT_MONGODB_DATABASE}`, [CONTRACT_MONGODB_COLLECTION]);
const collection = db[CONTRACT_MONGODB_COLLECTION];

const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    res.json({});
});

router.get('/contracts', function (req, res) {
    const participant = req.query.participant;
    const service = req.query.service;

    if (!(participant && service)) {
        res.status(400).json({'error': "'participant' and 'service' are required parameters"});
        return;
    }

    let params = {participant, service};

    collection.findOne(params, function (err, doc) {
        if (!doc) {
            res.status(404).json({'error': 'no contract found'});
            return;
        }

        if (err) {
            res.status(500).json({'error': err});
            return;
        }

        res.json(doc);
    });
});

router.put('/contracts', function (req, res) {
    const participant = req.query.participant;
    const service = req.query.service;
    const validFrom = req.query.validFrom;
    const validUntil = req.query.validUntil;
    const isProvider = req.query.isProvider; // Added by flo
    const isConsumer = req.query.isConsumer; // Added by flo

    if (!(participant && service)) {
        res.status(400).json({'error': "'participant' and 'service' are required parameters"});
        return;
    }

    const now = Math.round(Date.now() / 1000);

    const data = {
        validFrom: validFrom && parseInt(validFrom) || now,
        validUntil: validUntil && parseInt(validUntil) || now + 86400 * 365,
        isProvider: isProvider, // Added by flo
        isConsumer: isConsumer // Added by flo
    };

    let params = {participant, service, data};

    collection.insert(params, function (err, _doc) {
        if (err) {
            res.status(500).json({'error': err});
            return;
        }

        res.status(204);
        res.send();
    })
});

module.exports = router;
