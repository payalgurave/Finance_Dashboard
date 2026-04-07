const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const FinancialRecord = require('./models/FinancialRecord');

const USERS = [
  { name: 'Admin User', email: 'admin@test.com', password: 'admin123', role: 'admin' },
  { name: 'Analyst User', email: 'analyst@test.com', password: 'analyst123', role: 'analyst' },
  { name: 'Viewer User', email: 'viewer@test.com', password: 'viewer123', role: 'viewer' },
];

const RECORDS = [
  { amount: 55000, type: 'income', category: 'Salary', notes: 'Monthly salary - January' },
  { amount: 55000, type: 'income', category: 'Salary', notes: 'Monthly salary - February' },
  { amount: 55000, type: 'income', category: 'Salary', notes: 'Monthly salary - March' },
  { amount: 55000, type: 'income', category: 'Salary', notes: 'Monthly salary - April' },
  { amount: 55000, type: 'income', category: 'Salary', notes: 'Monthly salary - May' },
  { amount: 55000, type: 'income', category: 'Salary', notes: 'Monthly salary - June' },
  { amount: 12000, type: 'expense', category: 'Rent', notes: 'Monthly rent payment' },
  { amount: 12000, type: 'expense', category: 'Rent', notes: 'Monthly rent payment' },
  { amount: 12000, type: 'expense', category: 'Rent', notes: 'Monthly rent payment' },
  { amount: 3500, type: 'expense', category: 'Food', notes: 'Groceries and dining' },
  { amount: 2800, type: 'expense', category: 'Food', notes: 'Groceries and dining' },
  { amount: 4100, type: 'expense', category: 'Food', notes: 'Groceries and dining' },
  { amount: 1500, type: 'expense', category: 'Transport', notes: 'Fuel and cab rides' },
  { amount: 1200, type: 'expense', category: 'Transport', notes: 'Monthly metro pass' },
  { amount: 800, type: 'expense', category: 'Transport', notes: 'Cab rides' },
  { amount: 15000, type: 'income', category: 'Freelance', notes: 'Web development project' },
  { amount: 8000, type: 'income', category: 'Freelance', notes: 'Logo design project' },
  { amount: 22000, type: 'income', category: 'Freelance', notes: 'Mobile app consulting' },
  { amount: 5000, type: 'expense', category: 'Utilities', notes: 'Electricity and internet bill' },
  { amount: 3200, type: 'expense', category: 'Utilities', notes: 'Water and gas bill' },
  { amount: 2500, type: 'expense', category: 'Healthcare', notes: 'Doctor consultation and medicines' },
  { amount: 8500, type: 'expense', category: 'Healthcare', notes: 'Annual health checkup' },
  { amount: 4000, type: 'expense', category: 'Entertainment', notes: 'OTT subscriptions and movies' },
  { amount: 6500, type: 'expense', category: 'Shopping', notes: 'Clothing and accessories' },
  { amount: 3000, type: 'expense', category: 'Shopping', notes: 'Electronics accessories' },
  { amount: 10000, type: 'income', category: 'Investment Returns', notes: 'Mutual fund returns' },
  { amount: 5500, type: 'income', category: 'Investment Returns', notes: 'Fixed deposit interest' },
  { amount: 7000, type: 'expense', category: 'Education', notes: 'Online course subscription' },
  { amount: 2000, type: 'expense', category: 'Education', notes: 'Books and study material' },
  { amount: 18000, type: 'income', category: 'Bonus', notes: 'Performance bonus Q1' },
  { amount: 1800, type: 'expense', category: 'Insurance', notes: 'Health insurance premium' },
  { amount: 3600, type: 'expense', category: 'Insurance', notes: 'Life insurance premium' },
  { amount: 9000, type: 'income', category: 'Freelance', notes: 'Content writing project' },
  { amount: 4500, type: 'expense', category: 'Food', notes: 'Restaurant and takeout' },
  { amount: 2200, type: 'expense', category: 'Transport', notes: 'Vehicle maintenance' },
  { amount: 55000, type: 'income', category: 'Salary', notes: 'Monthly salary - July' },
  { amount: 12000, type: 'expense', category: 'Rent', notes: 'Monthly rent payment' },
  { amount: 3900, type: 'expense', category: 'Food', notes: 'Groceries and dining' },
  { amount: 6000, type: 'income', category: 'Investment Returns', notes: 'Stock dividends' },
  { amount: 1100, type: 'expense', category: 'Entertainment', notes: 'Gaming and hobbies' },
  { amount: 25000, type: 'income', category: 'Freelance', notes: 'E-commerce website project' },
  { amount: 5500, type: 'expense', category: 'Utilities', notes: 'Electricity bill' },
  { amount: 3300, type: 'expense', category: 'Shopping', notes: 'Home essentials' },
  { amount: 55000, type: 'income', category: 'Salary', notes: 'Monthly salary - August' },
  { amount: 12000, type: 'expense', category: 'Rent', notes: 'Monthly rent payment' },
  { amount: 20000, type: 'income', category: 'Bonus', notes: 'Mid-year performance bonus' },
  { amount: 4200, type: 'expense', category: 'Food', notes: 'Groceries and dining' },
  { amount: 9500, type: 'expense', category: 'Healthcare', notes: 'Dental treatment' },
  { amount: 1600, type: 'expense', category: 'Transport', notes: 'Fuel expenses' },
  { amount: 7500, type: 'income', category: 'Investment Returns', notes: 'Mutual fund SIP returns' },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({ email: { $in: USERS.map(u => u.email) } });
  await FinancialRecord.deleteMany({});
  console.log('Cleared existing seed data');

  const createdUsers = await Promise.all(
    USERS.map(async (u) => {
      const hashed = await bcrypt.hash(u.password, 10);
      return User.create({ ...u, password: hashed });
    })
  );
  console.log(`Created ${createdUsers.length} users`);

  const admin = createdUsers.find(u => u.role === 'admin');
  const now = new Date();
  const records = RECORDS.map((r, i) => ({
    ...r,
    date: new Date(now.getFullYear(), now.getMonth() - Math.floor(i / 8), (i % 28) + 1),
    createdBy: admin._id,
  }));

  await FinancialRecord.insertMany(records);
  console.log(`Created ${records.length} financial records`);

  console.log('\n✅ Seed complete! Test credentials:');
  console.log('  Admin:   admin@test.com    / admin123');
  console.log('  Analyst: analyst@test.com  / analyst123');
  console.log('  Viewer:  viewer@test.com   / viewer123');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
