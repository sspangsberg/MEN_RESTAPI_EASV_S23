const router = require("express").Router();
const product = require("../models/product");
const { verifyToken } = require("../validation");


// CRUD operations
/**
 * @openapi
 * /products:
 *   post:
 *     tags:
 *     - POST Routes
 *     summary: Create a new Product
 *     description: Create a new Product
 *     security:
 *       - ApiKeyAuth: []      
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Product"
 *
 *     responses:
 *       201:
 *         description: Product created succesfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 *
*/
router.post("/", verifyToken, (req, res) => {
//router.post("/", (req, res) => {
    data = req.body;
    product.insertMany( data )
    .then(data => { res.send(data) })
    .catch (err => { 
        res.status(500).send( { message: err.message } )
    })
});

/**
 * @openapi
 * /products:
 *   get:
 *     tags:
 *     - GET Routes
 *     description: Gets all products
 *     responses:
 *       200:
 *         description: Returns an array of all products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Product"
*/
router.get("/", (req, res) => {   
    product.find()
    .then(data => { 
        res.send(mapArray(data)) 
    })
    .catch (err => { 
        res.status(500).send( { message: err.message } )
    })
});

router.get("/instock/:status", (request, response) => {   
    product.find({ inStock: request.params.status})
    .then(data => { response.send(data) })
    .catch (err => { 
        response.status(500).send( { message: err.message } )
    })
});


/**
 * This is a non openapi comment....
 * 
 * @openapi
 * /products/random:
 *   get:
 *     tags:
 *     - GET Routes
 *     summary: Random Product
 *     description: Retrieves a random Product.
 *     responses:
 *       200:
 *         description: A random Product in the format of a JSON object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: "#/components/schemas/Product"
*/
router.get("/random", (request, response) => {
    
    // get a random product
    product.countDocuments({})
    .then (count => {

        // Get a random number
        let random = Math.floor(Math.random() * (count - 1));

        // Query all documents, but skip (fetch) only one with the ofset of "random"
        product.findOne().skip(random)
        .then (data => { response.status(200).send(mapData(data))})
        .catch(err => {
            response.status(500).send({ message: err.message});
        })
    })
});


//Read all documents based on variable field and value
router.get("/:field/:value", (request, response) => {   
    
    const field = request.params.field;
    const value = request.params.value;
    
    product.find(
        { 
            [field]: 
            { 
                $regex: 
                request.params.value, $options:'i' 
            } 
        })

    .then (data => { response.send(data) })  
    .catch (err => { 
        response.status(500).send( { message: err.message } )
    })
});


/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags:
 *     - GET Routes
 *     summary: Specific Product
 *     description: Retrieves a specific Product based on it id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A Product in the format of a JSON object.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Product"
*/
router.get("/:id", (req, res) => {   
    product.findById(req.params.id)
    .then(data => { res.send(mapData(data)) })
    .catch (err => { 
        res.status(500).send( { message: err.message } )
    })
});


// GET products/price/lt/1000
router.get("/price/:operator/:price",(req, res) => {

    const operator = req.params.operator;
    const price = req.params.price;

    if (operator != "gt" || operator != "lt")
        res.status(400).send({ message: "Wrong operator input" })
    else
    {
        let filterExpression;

        if (operator == "lt") //less than
        {
            filterExpression = { $lte: price }
        }
        else if (operator == "gt") {
            filterExpression = { $gte: price }
        }

        product.find({ price: filterExpression })
            .then(data => { 
                res
                .status(200)
                .send(mapArray(data))
            })
            .catch(err => {
                res
                .status(500)
                .send({ message: err.message })
            })
    }
});



// Update specific product (put)
router.put("/:id", verifyToken, (req, res) => {   
    
    const id = req.params.id;
    product.findByIdAndUpdate(id, req.body)
    .then(data => { 
        if (!data) {
            res.status(404).send({message: "Cannot update product with id=" + id + ". Maybe the product was not found!"});
        }
        else {
            res.send({ message: "Product was successfully updated."});
        }
    })
    .catch (err => { 
        res.status(500).send( { message: "Error updating product with id=" + id } )
    })
});

// Delete specific product (delete)
router.delete("/:id", verifyToken, (req, res) => {   
    
    const id = req.params.id;
    product.findByIdAndDelete(id)
    .then(data => { 
        if (!data) {
            res.status(404).send({message: "Cannot delete product with id=" + id + ". Maybe the product was not found!"});
        }
        else {
            res.send({ message: "Product was successfully deleted."});
        }
    })
    .catch (err => { 
        res.status(500).send( { message: "Error deleting product with id=" + id } )
    })
});

function mapArray(inputArray) {

    // do something with inputArray
    let outputArray = inputArray.map(element => (
            mapData(element)
    ));

    return outputArray;
}


function mapData(element) {

    // do something with inputArray
    let outputObj = {

        id: element._id,
        name: element.name,
        //details: element.description,
        price: element.price,
        inStock: element.inStock,

        // add uri (HATEOAS) for this specific resource
        uri: "/api/products/" + element._id
    }

    return outputObj;
}





module.exports = router;