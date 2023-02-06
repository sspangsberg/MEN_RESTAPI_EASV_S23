const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let productSchema = new Schema(

    {
        name: {type: String, required: true},
        desciption: {type:String, required: false},
        price: {type: Number, required: true},
        inStock: {type: Boolean, required: true}
    }
    //name: string
    //description: string
    //price: number
    //inStock: boolean  
);

module.exports = mongoose.model("product", productSchema);