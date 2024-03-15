const csv = require("csv-parser");
const fs = require("fs");

async function readFileHeaders(dataset) {
	return new Promise((resolve, reject) => {
	  const filePath = `/app/datasets/${dataset}`;
  
	  fs.createReadStream(filePath)
		.pipe(csv())
		.on('headers', (csvHeaders) => {
		  // Headers are read, resolve the Promise with the headers
		  resolve(csvHeaders);
		})
		.on('error', (err) => {
		  // Handle errors and reject the Promise
		  console.error(`Error while reading CSV file: ${err}`);
		  reject(err);
		});
	});
}

module.exports = {
	readFileHeaders
};