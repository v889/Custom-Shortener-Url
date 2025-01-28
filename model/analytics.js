import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Define the Analytics schema
const analyticsSchema = new Schema(
  {
    shortId: {
      type: Schema.Types.ObjectId,
      ref: "ShortUrl", // Assuming "ShortUrl" is the name of the ShortUrl model
      required: true,
    },
    topic: {
      type: String,
      default: "Other",
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Assuming "User" is the name of the User model
      required: false,
    },
    uid: {
      type: Schema.Types.ObjectId,
      ref: "User", // Assuming "User" is the name of the User model
      required: false,
    },
    os: {
      type: String,
      required: false,
    },
    deviceType: {
      type: String,
      required: false,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    latitude: {
      type: Number,
      required: false,
    },
    longitude: {
      type: Number,
      required: false,
    },
    clickedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt timestamps automatically
  }
);

// Create the model from the schema
const Analytics = model("Analytics", analyticsSchema);

export default Analytics;
