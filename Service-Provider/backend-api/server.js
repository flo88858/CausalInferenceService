require("dotenv").config();

const app = require('./modules')
const port = process.env.PORT || '4000'
app.listen(port, () =>
  console.log(`Its's running on http://localhost:${port}`)
);