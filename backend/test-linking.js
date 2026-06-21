require('dotenv').config();
const crypto = require('crypto');
const razorpay = require('./config/razorpay');

const testLinking = async () => {
  try {
    const accountPayload = {
      name: 'Test Host',
      email: 'testhost123@example.com',
      contact: '9876543210',
      type: 'route',
      legal_business_name: 'Test Host Business',
      business_type: 'individual',
      profile: {
        category: 'real_estate',
        subcategory: 'real_estate_agent'
      }
    };

    console.log('Creating account with payload:', accountPayload);
    const account = await razorpay.accounts.create(accountPayload);
    console.log('Account created:', account.id);
  } catch (error) {
    console.error('Error creating account:', JSON.stringify(error, null, 2));
  }
};

testLinking();
