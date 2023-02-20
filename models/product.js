const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let productSchema = new Schema(

    {
        name: {type: String, required: true},
        description: {type:String, required: false},
        price: {type: Number, required: true},
        inStock: {type: Boolean, required: true}
    }
    //name: string
    //description: string
    //price: number
    //inStock: boolean  
);

productSchema.pre('findOneAndUpdate', function() {
    const update = this.getUpdate();
    if (update.__v != null) {
      delete update.__v;
    }
    const keys = ['$set', '$setOnInsert'];
    for (const key of keys) {
      if (update[key] != null && update[key].__v != null) {
        delete update[key].__v;
        if (Object.keys(update[key]).length === 0) {
          delete update[key];
        }
      }
    }
    update.$inc = update.$inc || {};
    update.$inc.__v = 1;
  });



module.exports = mongoose.model("product", productSchema);