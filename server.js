const express = require("express");
const mongoose = require("mongoose");
//const bodyParser = require("body-parser");
const app = express();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

//load configuration from .env file
require("dotenv-flow").config();


/* // Use function
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
*/

const cors = require("cors");

  // Use cors library
app.use(cors({
  origin: '*',
  methods: ['GET','POST','DELETE','UPDATE','PUT']
}));
// Test in Chromium > Inspect > Network > Headers > Response Headers

//setup Swagger
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// import product routes
const productRoutes = require("./routes/product");
const authRoutes = require("./routes/auth");

app.use(express.json());
//app.use(bodyParser.json());

//routes
app.get("/api/", (req, res) => {
    res.status(200).send({message: "Welcome to the MEN REST-API"});
})

app.use("/api/products", productRoutes);
app.use("/api/user", authRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, function() {
    console.log("Server is running on port: " + PORT)
})

mongoose.set('strictQuery', true);
mongoose.connect(
    process.env.DBHOST,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
).catch(error => console.log('Error connecting to MongoDB' + error));
mongoose.connection.once('open', () => console.log('Connected succesfully to MongoDB'));


module.exports = app;