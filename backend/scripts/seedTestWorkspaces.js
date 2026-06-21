require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Listing = require('../models/Listing');

const imageSets = [
  [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1400&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&w=1400&q=80'
  ]
];

const seedListings = [
  {
    title: 'Skyline Co-working Loft',
    description: 'A bright loft workspace with ergonomic seating, fast internet, and dedicated focus zones.',
    city: 'Bangalore',
    workspaceType: 'co-working',
    capacity: 20,
    pricePerHour: 12,
    pricePerDay: 72,
    pricePerMonth: 1100,
    amenities: ['WiFi', 'AC', 'Parking', 'Coffee']
  },
  {
    title: 'Glass Box Private Office',
    description: 'Private office with floor-to-ceiling glass, whiteboard walls, and premium coffee setup.',
    city: 'Mumbai',
    workspaceType: 'studio',
    capacity: 6,
    pricePerHour: 18,
    pricePerDay: 105,
    pricePerMonth: 1450,
    amenities: ['WiFi', 'AC', 'Coffee']
  },
  {
    title: 'Founders Meeting Suite',
    description: 'Modern meeting room perfect for client calls and strategy sessions with built-in display screens.',
    city: 'Pune',
    workspaceType: 'meeting-room',
    capacity: 10,
    pricePerHour: 22,
    pricePerDay: 130,
    pricePerMonth: 1650,
    amenities: ['WiFi', 'AC', 'Parking']
  },
  {
    title: 'Minimal Focus Desk Hub',
    description: 'Quiet desk setup with natural lighting and acoustic panels for deep work.',
    city: 'Hyderabad',
    workspaceType: 'desk',
    capacity: 12,
    pricePerHour: 9,
    pricePerDay: 55,
    pricePerMonth: 900,
    amenities: ['WiFi', 'Coffee']
  },
  {
    title: 'Startup Collaboration Floor',
    description: 'Large open workspace for teams with breakout lounges and unlimited hot beverages.',
    city: 'Delhi',
    workspaceType: 'co-working',
    capacity: 30,
    pricePerHour: 14,
    pricePerDay: 85,
    pricePerMonth: 1200,
    amenities: ['WiFi', 'AC', 'Parking', 'Coffee']
  }
];

async function run() {
  await connectDB();

  let host = await User.findOne({ email: 'testhost@workbnb.dev' });
  if (!host) {
    host = await User.create({
      name: 'Test Host',
      email: 'testhost@workbnb.dev',
      password: 'Password123!',
      role: 'host'
    });
  }

  await Listing.deleteMany({ hostId: host._id });

  const docs = seedListings.map((item, idx) => ({
    hostId: host._id,
    title: item.title,
    description: item.description,
    address: {
      city: item.city,
      state: 'India',
      country: 'India',
      zipCode: '000000'
    },
    workspaceType: item.workspaceType,
    capacity: item.capacity,
    pricePerHour: item.pricePerHour,
    pricePerDay: item.pricePerDay,
    pricePerMonth: item.pricePerMonth,
    amenities: item.amenities,
    images: imageSets[idx % imageSets.length],
    rating: Number((4.5 + (idx % 4) * 0.1).toFixed(1)),
    totalReviews: 8 + idx
  }));

  await Listing.insertMany(docs);

  console.log('Seeded test workspaces successfully');
  console.log('Host login email: testhost@workbnb.dev');
  console.log('Host login password: Password123!');

  await mongoose.connection.close();
}

run().catch(async (error) => {
  console.error('Seeding failed:', error.message);
  await mongoose.connection.close();
  process.exit(1);
});
