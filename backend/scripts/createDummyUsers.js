require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');

const roles = [
  'Admin',
  'Vice President',
  'HR BP',
  'HR Manager',
  'HR Executive',
  'Team Manager',
  'Team Leader',
  'Employee'
];

const createDummyUsers = async () => {
  try {
    // Check if mongoose is already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB for dummy user creation');
    } else {
      console.log('Using existing MongoDB connection for dummy user creation');
    }

    // Fetch all departments and create a map of name to _id
    const departments = await Department.find({});
    const departmentMap = {};
    departments.forEach(dept => {
      departmentMap[dept.name] = dept._id;
    });

    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];
      const email = role.toLowerCase().replace(/ /g, '') + '@company.com';
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`User for role ${role} already exists: ${email}`);
        continue;
      }

      // Create unique employeeId
      const employeeId = role.replace(/ /g, '').substring(0, 3).toUpperCase() + String(i + 1).padStart(3, '0');

      // Determine department name string
      const departmentName = role.includes('HR') ? 'Human Resources' : role.includes('Team') ? 'Engineering' : role === 'Employee' ? 'Operations' : 'Management';

      const user = new User({
        email,
        password: 'password123',
        firstName: role.split(' ')[0],
        lastName: 'User',
        role,
        department: departmentMap[departmentName] || null,
        teamName: role.includes('Team') ? 'Development Team Alpha' : role.includes('HR') ? 'HR Operations' : role === 'Employee' ? 'Operations Team' : 'Executive Team',
        employeeId,
        phoneNumber: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        dateOfBirth: new Date(1985 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        address: {
          street: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
          city: 'New York',
          state: 'NY',
          zipCode: String(Math.floor(Math.random() * 90000) + 10000),
          country: 'USA'
        },
        joiningDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        emergencyContact: {
          name: `Emergency Contact ${i + 1}`,
          relationship: Math.random() > 0.5 ? 'Spouse' : 'Parent',
          phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          address: `${Math.floor(Math.random() * 9999) + 1} Emergency Street, New York, NY`
        },
        bankDetails: {
          accountNumber: `****${String(Math.floor(Math.random() * 9000) + 1000)}`,
          bankName: 'Chase Bank',
          ifscCode: 'CHAS0001234',
          pfNumber: `PF${String(Math.floor(Math.random() * 900000) + 100000)}`,
          esiNumber: `ESI${String(Math.floor(Math.random() * 900000) + 100000)}`,
          panNumber: `PAN${String(Math.floor(Math.random() * 900000) + 100000)}`
        },
        leaveBalance: {
          casual: Math.floor(Math.random() * 12) + 1,
          sick: Math.floor(Math.random() * 12) + 1,
          earned: Math.floor(Math.random() * 21) + 1,
          maternity: role.includes('Female') ? 90 : 0,
          paternity: role.includes('Male') ? 15 : 0
        },
        currentGoals: [
          {
            title: `Q1 Performance Goal for ${role}`,
            description: `Complete key objectives for ${role} position`,
            targetDate: new Date(2025, 2, 31),
            status: 'In Progress'
          }
        ],
        lastAppraisal: {
          rating: ['Excellent', 'Good', 'Satisfactory'][Math.floor(Math.random() * 3)],
          feedback: `Strong performance in ${role} responsibilities. Continue excellent work.`,
          date: new Date(2024, 11, 15)
        },
        isActive: true,
      });

      await user.save();
      console.log(`Created dummy user for role ${role}: ${email} / password123`);
    }

    console.log('Dummy user creation completed');
  } catch (error) {
    console.error('Error creating dummy users:', error);
  }
};

module.exports = createDummyUsers;
