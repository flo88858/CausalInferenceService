# Contract Service

Service for storing and managing GAIA-X-Med contracts. Will eventually also handle contract negotiation. Built with express.js and MongoDB.

**Note:** Support for contracts is currently in a very early stage.

## Installation

Install the dependencies with npm:

```
npm i
```

## Running

You can use docker-compose to run the Contract Service and a MongoDB instance:

```
docker-compose up
```

Alternatively, the Contract Service can also be started standalone using npm:

```
npm run start
```

## Usage

Refer to the [OpenAPI specification](openapi.yaml) for usage details.
