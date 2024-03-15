// =============== Third Party Dependencies ==================
const express = require('express')
const bodyParser = require("body-parser");
const chokidar = require('chokidar');
const fs = require("fs");
const csv = require("csv-parser");

// =============== Database Models ===========================
const Result = require("../models/result");

// =============== Configurations ============================
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

// =============== Routes ====================================
const consumerRouter = require('./consumer/routes')
const providerRouter = require('./provider/routes')


app.use('/api/consumer', consumerRouter)
app.use('/api/provider', providerRouter)


// =============== Watcher ===================================

// A Watcher for saving results in DB when a new csv file arrives
const watcher = chokidar.watch('/app/results/', { persistent: true });
watcher.on('add', async (path) => {
  console.log("On Add event triggered");
  // Wait for the file to be complete. If the file size hasn't changed -> complete (check this every second)
  let previousSize = 0;
  let currentSize = 0;

  const checkInterval = setInterval(() => {
    currentSize = fs.statSync(path).size;

    if (currentSize === previousSize) {
      clearInterval(checkInterval);
      const resultID = path.replace(/^.*\/results\//, '').replace(/\.csv$/, '');
      const result = [];

      // Read CSV File Result and save to Database
      fs.createReadStream(path)
        .pipe(csv())
        .on('data', (row) => {
          result.push(row);
        })
        .on('end', async () => {
          console.log("Save result in DB");
          // Save to DB
          const existingResult = await Result.findOne({ _id: resultID});
          // Make sure to only update if DB-Entry has no data yet
          if(existingResult && existingResult.result[0]==="No Data Yet"){
            const update = {
              result: result,
              finishedAt: Date.now()
            };
            await Result.findOneAndUpdate({ _id: resultID }, update);
          }
          // Possible Delete of CSV-File here
        });
    } else {
      previousSize = currentSize;
    }
  }, 1000);
}); 

module.exports = app