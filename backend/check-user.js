require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: 'salonisawant1312@gmail.com' });
    if (user) {
      console.log('User exists:', user.email, 'Role:', user.role);
    } else {
      console.log('User does not exist');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
