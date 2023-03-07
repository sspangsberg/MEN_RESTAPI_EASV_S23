const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let categorySchema = new Schema(
    {
        name: {type: String, required: true},
        description: {type:String, required: false}
    }
);

categorySchema.pre('findOneAndUpdate', function() {
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



module.exports = mongoose.model("category", categorySchema);