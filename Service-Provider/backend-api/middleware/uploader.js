const multer = require('multer');
const uuid = require('uuid');

const tarFilter = (req, file, cb) => {
    if (file.mimetype.includes('tar')) {
      cb(null, true);
    } else {
      const error = new Error('Invalid Type Error')
      error.status = 418
      cb(error, false);
    }
};
  
// Set up memory-storage for uploaded algorithms
const uploadAlgorithm = multer({
    storage: multer.memoryStorage(),
    fileFilter: tarFilter
})

// Set up storage for uploaded datasets
const diskStorageDataset = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'datasets/'); 
    },
    filename: function (req, file, cb) {
        const uniqueFilename = uuid.v4(); 
        const fileExtension = file.originalname.split('.').pop(); 
        const crypticFilename = `${uniqueFilename}.${fileExtension}`;
        cb(null, crypticFilename); 
    },
});


// CSV file filter - will only accept files with .csv extension
const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes('csv')) {
        cb(null, true);
    } else {
        const error = new Error('Invalid Type Error')
        error.status = 418
        cb(error, false);
    }
};

// Create multer instance with the storage configuration
const uploadDataset = multer({ 
    storage: diskStorageDataset,  
    fileFilter: csvFilter
})
  

module.exports = {
    uploadDataset,
    uploadAlgorithm
};