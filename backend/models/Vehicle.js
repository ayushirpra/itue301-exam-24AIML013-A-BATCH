const mongoose = require('mongoose');

/**
 * Vehicle schema
 * Represents a car in the fleet. Fields: model (required), type (required,
 * enum Hatchback/Sedan/SUV), pricePerDay (required, min 0), registrationNumber
 * (required, unique), available (Boolean, default true), description.
 */
const vehicleSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: ['Hatchback', 'Sedan', 'SUV'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price per day cannot be negative'],
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
