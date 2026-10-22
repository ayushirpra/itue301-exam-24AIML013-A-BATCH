/**
 * In-memory data store (DEPRECATED — kept for reference only).
 *
 * The application now uses Mongoose models connected to MongoDB.
 * This file is no longer imported by any route or middleware. It is retained
 * as a reference for the seed data structure and the helper patterns.
 */

// --- Simple ID counter (mimics MongoDB ObjectIds for shape only) ----------
let idCounter = 1000;
function nextId() {
  idCounter += 1;
  return String(idCounter);
}

// --- Seed data: customers ------------------------------------------------
const customers = [
  {
    _id: '1001',
    name: 'Ayushi Patel',
    email: 'ayushi@example.com',
    password: 'password123',
    phone: '9876543210',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    _id: '1002',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'password123',
    phone: '9123456780',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

// --- Seed data: vehicles -------------------------------------------------
const vehicles = [
  {
    _id: '2001',
    model: 'Maruti Swift',
    type: 'Hatchback',
    pricePerDay: 1800,
    registrationNumber: 'GJ01AB1234',
    available: true,
    description: 'Compact and fuel-efficient city car.',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    _id: '2002',
    model: 'Hyundai i20',
    type: 'Hatchback',
    pricePerDay: 2000,
    registrationNumber: 'GJ01CD5678',
    available: true,
    description: 'Premium hatchback with sporty styling.',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    _id: '2003',
    model: 'Honda City',
    type: 'Sedan',
    pricePerDay: 3000,
    registrationNumber: 'GJ02EF9012',
    available: true,
    description: 'Spacious sedan for comfortable long drives.',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    _id: '2004',
    model: 'Skoda Octavia',
    type: 'Sedan',
    pricePerDay: 3500,
    registrationNumber: 'GJ02GH3456',
    available: false,
    description: 'Currently booked luxury sedan.',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    _id: '2005',
    model: 'Mahindra Scorpio',
    type: 'SUV',
    pricePerDay: 4000,
    registrationNumber: 'GJ03IJ7890',
    available: true,
    description: 'Rugged SUV for off-road and family trips.',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    _id: '2006',
    model: 'Tata Harrier',
    type: 'SUV',
    pricePerDay: 4200,
    registrationNumber: 'GJ03KL1234',
    available: true,
    description: 'Premium SUV with modern features.',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
];

// --- Bookings (start empty) ----------------------------------------------
const bookings = [];

// --- Helper functions ----------------------------------------------------

/** Find a customer by email (case-insensitive). */
function findCustomerByEmail(email) {
  return customers.find(
    (c) => c.email.toLowerCase() === String(email).toLowerCase()
  );
}

/** Find a customer by ID. */
function findCustomerById(id) {
  return customers.find((c) => c._id === String(id));
}

/** Find a vehicle by ID. */
function findVehicleById(id) {
  return vehicles.find((v) => v._id === String(id));
}

/** Find a booking by ID. */
function findBookingById(id) {
  return bookings.find((b) => b._id === String(id));
}

/** Create a new booking record. */
function createBooking(data) {
  const now = new Date();
  const booking = {
    _id: nextId(),
    customer: data.customer,
    vehicle: data.vehicle,
    pickupDate: data.pickupDate,
    returnDate: data.returnDate,
    totalAmount: data.totalAmount,
    status: data.status || 'reserved',
    createdAt: now,
    updatedAt: now,
  };
  bookings.push(booking);
  return booking;
}

/** Populate a booking with customer and vehicle fields (mimics Mongoose populate). */
function populateBooking(booking) {
  const customer = findCustomerById(booking.customer) || null;
  const vehicle = findVehicleById(booking.vehicle) || null;
  return {
    ...booking,
    customer: customer
      ? { _id: customer._id, name: customer.name, email: customer.email }
      : null,
    vehicle: vehicle
      ? {
          _id: vehicle._id,
          model: vehicle.model,
          type: vehicle.type,
          pricePerDay: vehicle.pricePerDay,
        }
      : null,
  };
}

module.exports = {
  customers,
  vehicles,
  bookings,
  nextId,
  findCustomerByEmail,
  findCustomerById,
  findVehicleById,
  findBookingById,
  createBooking,
  populateBooking,
};
