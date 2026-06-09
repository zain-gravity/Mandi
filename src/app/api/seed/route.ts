import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { User } from '@/lib/db/models';
import * as bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();

    const adminPhone = '9876543210';
    const adminPassword = 'admin'; // Easy to type, they can change later
    
    // Check if super admin already exists
    const existingAdmin = await User.findOne({ phone: adminPhone });
    if (existingAdmin) {
      return NextResponse.json({ 
        message: 'Super Admin already exists!', 
        credentials: { phone: adminPhone, password: adminPassword } 
      });
    }

    // Create Super Admin
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    await User.create({
      name: 'Super Admin',
      phone: adminPhone,
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    });

    return NextResponse.json({ 
      message: 'Super Admin created successfully!',
      credentials: { phone: adminPhone, password: adminPassword },
      instruction: 'Go to /login and enter these credentials.'
    });

  } catch (error: any) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
