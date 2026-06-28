const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('../models/User');

const seedModerators = async () => {
  const moderators = [
    { name: 'Shantanu Chorghe', email: 'shantanu@workbnb.com', password: 'moderators', role: 'moderator' },
    { name: 'Saloni Sawant', email: 'saloni.sawant@workbnb.com', password: 'moderators', role: 'regulator' },
    { name: 'Parineeta Shinde', email: 'parineeta@workbnb.com', password: 'moderators', role: 'moderator' },
    { name: 'Saloni Shinde', email: 'saloni.shinde@workbnb.com', password: 'moderators', role: 'regulator' }
  ];

  for (const mod of moderators) {
    const exists = await User.findOne({ email: mod.email });
    if (!exists) {
      await User.create(mod);
      console.log(`Seeded user: ${mod.name} as ${mod.role}`);
    }
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedModerators();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
