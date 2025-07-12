require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('../models/Department');

const departments = [
  {
    name: 'Human Resources',
    code: 'HR',
    description: 'Human Resources Department',
    isActive: true,
  },
  {
    name: 'Engineering',
    code: 'ENG',
    description: 'Engineering Department',
    isActive: true,
  },
  {
    name: 'Operations',
    code: 'OPS',
    description: 'Operations Department',
    isActive: true,
  },
  {
    name: 'Management',
    code: 'MGT',
    description: 'Management Department',
    isActive: true,
  }
];

const createDepartments = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB for department creation');
    } else {
      console.log('Using existing MongoDB connection for department creation');
    }

    for (const dept of departments) {
      const existing = await Department.findOne({ name: dept.name });
      if (existing) {
        console.log(`Department already exists: ${dept.name}`);
        continue;
      }
      const newDept = new Department(dept);
      await newDept.save();
      console.log(`Created department: ${dept.name}`);
    }

    console.log('Department creation completed');
    process.exit(0);
  } catch (error) {
    console.error('Error creating departments:', error);
    process.exit(1);
  }
};

createDepartments();
