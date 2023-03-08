const options = {
    openapi: '3.0.0'          
}

const swaggerAutogen = require("swagger-autogen")(options);

const doc = {
  
    openapi: "3.0.0",
    info: {
      title: "MEN REST API",
      description: "MongoDB ExpressJS NodeJS REST API",
      version: "1.0.0"
    },
    servers: [
      {
        url: "http://localhost:4000/api/",
        description: "Localhost development server",
      },
      {
        url: "https://men-restapi-easv-s23.onrender.com/api/",
        description: "Remote deployment",
      },
    ],
    tags: [
      {
        name: "GET Routes",
        description: "Routes that get products"
      },
      {
        name: "POST Routes",
        description: "Routes that creates products"
      }
    ],
    components: {
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "string" },
            inStock: { type: "boolean" }
          }
        }
      },
      securitySchemes: {
        ApiKeyAuth: {
            type: 'apiKey', 
            in: 'header',     
            name: 'auth-token'
        }        
      }
    }
};

const outputFile = './swagger-output.json'
const endpointsFiles = ['../routes/*.js']

swaggerAutogen(outputFile, endpointsFiles, doc)
.then(() => {
    require('../server.js')           // Your project's root file
})
.catch ((err) => {
    console.log(err);
})