const axios = require('axios');
const baseURL = 'http://localhost:5000/api';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'donor'
};

const testNGO = {
  name: 'Test NGO',
  email: 'testngo@example.com',
  description: 'A test NGO',
  location: 'Test Location',
  services: ['Education', 'Health'],
  contact: {
    phone: '1234567890',
    website: 'https://testngo.com'
  }
};

const testCampaign = {
  name: 'Test Campaign',
  description: 'A test campaign',
  goal: 10000,
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  category: 'Education',
  images: []
};

const testEvent = {
  name: 'Test Event',
  description: 'A test event',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  duration: {
    hours: 2,
    minutes: 30
  },
  location: {
    address: 'Test Address',
    city: 'Test City',
    state: 'Test State',
    coordinates: {
      type: 'Point',
      coordinates: [0, 0]
    }
  },
  category: 'Education',
  requiredSkills: ['Teaching'],
  maxVolunteers: 10
};

const testDonation = {
  amount: 1000,
  paymentMethod: 'UPI',
  category: 'Education',
  isAnonymous: false,
  message: 'Test donation'
};

let authToken = '';

async function testAuth() {
  console.log('\nTesting Authentication...');
  
  try {
    // Register
    console.log('1. Registering user...');
    const registerRes = await axios.post(`${baseURL}/auth/register`, testUser);
    console.log('Register successful:', registerRes.data);

    // Login
    console.log('\n2. Logging in...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    authToken = loginRes.data.token;
    console.log('Login successful:', loginRes.data);

    // Get Profile
    console.log('\n3. Getting user profile...');
    const profileRes = await axios.get(`${baseURL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Profile fetch successful:', profileRes.data);

  } catch (error) {
    console.error('Auth test failed:', error.response?.data || error.message);
  }
}

async function testNGO() {
  console.log('\nTesting NGO Operations...');
  
  try {
    // Create NGO
    console.log('1. Creating NGO...');
    const createRes = await axios.post(`${baseURL}/ngos`, testNGO, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('NGO creation successful:', createRes.data);

    // Get NGOs
    console.log('\n2. Getting all NGOs...');
    const getRes = await axios.get(`${baseURL}/ngos`);
    console.log('NGOs fetch successful:', getRes.data);

  } catch (error) {
    console.error('NGO test failed:', error.response?.data || error.message);
  }
}

async function testCampaign() {
  console.log('\nTesting Campaign Operations...');
  
  try {
    // Create Campaign
    console.log('1. Creating campaign...');
    const createRes = await axios.post(`${baseURL}/campaigns`, testCampaign, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Campaign creation successful:', createRes.data);

    // Get Campaigns
    console.log('\n2. Getting all campaigns...');
    const getRes = await axios.get(`${baseURL}/campaigns`);
    console.log('Campaigns fetch successful:', getRes.data);

  } catch (error) {
    console.error('Campaign test failed:', error.response?.data || error.message);
  }
}

async function testEvent() {
  console.log('\nTesting Event Operations...');
  
  try {
    // Create Event
    console.log('1. Creating event...');
    const createRes = await axios.post(`${baseURL}/events`, testEvent, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Event creation successful:', createRes.data);

    // Get Events
    console.log('\n2. Getting all events...');
    const getRes = await axios.get(`${baseURL}/events`);
    console.log('Events fetch successful:', getRes.data);

  } catch (error) {
    console.error('Event test failed:', error.response?.data || error.message);
  }
}

async function testDonation() {
  console.log('\nTesting Donation Operations...');
  
  try {
    // Create Donation
    console.log('1. Creating donation...');
    const createRes = await axios.post(`${baseURL}/donations`, testDonation, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Donation creation successful:', createRes.data);

    // Get Donations
    console.log('\n2. Getting all donations...');
    const getRes = await axios.get(`${baseURL}/donations`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('Donations fetch successful:', getRes.data);

  } catch (error) {
    console.error('Donation test failed:', error.response?.data || error.message);
  }
}

async function runTests() {
  try {
    await testAuth();
    await testNGO();
    await testCampaign();
    await testEvent();
    await testDonation();
  } catch (error) {
    console.error('Test suite failed:', error);
  }
}

runTests(); 