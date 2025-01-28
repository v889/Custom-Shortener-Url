import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Define the ShortUrl schema
const shortUrlSchema = new Schema(
  {
    
    uid: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    originalUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v);
        },
        message: "Invalid URL format",
      },
    },
    alias: {
      type: String,
      unique: true
    },
    topic: {
      type: String,
      default: "Other",
      required: false,
    },
  },
  {
    timestamps: true, // to add createdAt and updatedAt automatically
  }
);

// Create the model from the schema
const ShortUrl = model("ShortUrl", shortUrlSchema);

export default ShortUrl;
