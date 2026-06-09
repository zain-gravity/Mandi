const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = "mongodb+srv://sellergravity_db_user:220kb9Lj7UQGVAPG@cluster0.sdc7vyi.mongodb.net/mandi?appName=Cluster0";

const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  passwordHash: String,
  role: String,
  isActive: Boolean,
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const adminPhone = '9876543210';
  
  const existingUser = await User.findOne({ phone: adminPhone });
  if (existingUser) {
    console.log('Super Admin already exists with phone:', adminPhone);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash('admin123', 10);

  const adminUser = new User({
    name: 'Super Admin',
    phone: adminPhone,
    passwordHash: passwordHash,
    role: 'SUPER_ADMIN',
    isActive: true,
  });

  await adminUser.save();
  console.log('Super Admin created successfully!');
  console.log('Phone:', adminPhone);
  console.log('Password: admin123');
  
  process.exit(0);
}

seed().catch(console.error);
