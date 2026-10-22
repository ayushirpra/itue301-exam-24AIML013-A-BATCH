/**
 * Seed script for the DriveEasy MongoDB database.
 * Creates sample customers and vehicles so you can log in and browse the fleet.
 *
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Vehicle = require('./models/Vehicle');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/driveeasy';

const customers = [
  {
    name: 'Ayushi Patel',
    email: 'ayushi@example.com',
    password: 'password123',
    phone: '9876543210',
  },
  {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'password123',
    phone: '9123456780',
  },
];

const vehicles = [
  {
    model: 'Maruti Swift',
    type: 'Hatchback',
    pricePerDay: 1800,
    registrationNumber: 'GJ01AB1234',
    available: true,
    description: 'Compact and fuel-efficient city car.',
  },
  {
    model: 'Hyundai i20',
    type: 'Hatchback',
    pricePerDay: 2000,
    registrationNumber: 'GJ01CD5678',
    available: true,
    description: 'Premium hatchback with sporty styling.',
  },
  {
    model: 'Honda City',
    type: 'Sedan',
    pricePerDay: 3000,
    registrationNumber: 'GJ02EF9012',
    available: true,
    description: 'Spacious sedan for comfortable long drives.',
  },
  {
    model: 'Skoda Octavia',
    type: 'Sedan',
    pricePerDay: 3500,
    registrationNumber: 'GJ02GH3456',
    available: false,
    description: 'Currently booked luxury sedan.',
  },
  {
    model: 'Mahindra Scorpio',
    type: 'SUV',
    pricePerDay: 4000,
    registrationNumber: 'GJ03IJ7890',
    available: true,
    description: 'Rugged SUV for off-road and family trips.',
  },
  {
    model: 'Tata Harrier',
    type: 'SUV',
    pricePerDay: 4200,
    registrationNumber: 'GJ03KL1234',
    available: true,
    description: 'Premium SUV with modern features.',
  },
];

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding.');

    await Customer.deleteMany({});
    await Vehicle.deleteMany({});

    const createdCustomers = await Customer.insertMany(customers);
    console.log(`Seeded ${createdCustomers.length} customers.`);
    createdCustomers.forEach((c) =>
      console.log(`  - ${c.name} <${c.email}> / ${c.password}`)
    );

    const createdVehicles = await Vehicle.insertMany(vehicles);
    console.log(`Seeded ${createdVehicles.length} vehicles.`);
    createdVehicles.forEach((v) =>
      console.log(
        `  - ${v.model} (${v.type}) - ₹${v.pricePerDay}/day [${v.registrationNumber}] available=${v.available}`
      )
    );

    console.log('\nSeed complete! You can now start the server with: npm start');
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
