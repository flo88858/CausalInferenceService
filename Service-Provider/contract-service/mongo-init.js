db.createUser(
    {
        user: process.env.CONTRACT_MONGODB_USER,
        pwd: process.env.CONTRACT_MONGODB_PASSWORD,
        roles: [
            {
                role: "readWrite",
                db: process.env.CONTRACT_MONGODB_DATABASE
            }
        ]
    }
);

const collection = db[process.env.CONTRACT_MONGODB_COLLECTION];
res = collection.createIndex({participant: 1, service: 1}, {unique: true});
