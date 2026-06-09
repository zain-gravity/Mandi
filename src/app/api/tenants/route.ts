import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { Company, User } from '@/lib/db/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import * as bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const tenants = await Company.find().sort({ createdAt: -1 }).lean();
    
    // For each tenant, get user count
    const tenantsWithCounts = await Promise.all(tenants.map(async (t: any) => {
       const usersCount = await User.countDocuments({ companyId: t._id });
       return { 
         id: t._id.toString(), 
         name: t.name, 
         slug: t.slug, 
         license: t.licenseType, 
         status: t.isActive ? 'ACTIVE' : 'INACTIVE', 
         users: usersCount 
       };
    }));

    return NextResponse.json(tenantsWithCounts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const body = await req.json();
    const { name, slug, licenseType, adminPhone, adminPassword, adminName } = body;
    
    // Validate
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const existingCompany = await Company.findOne({ slug });
    if (existingCompany) {
      return NextResponse.json({ error: 'Tenant slug already exists' }, { status: 400 });
    }

    // Create Tenant
    const company = await Company.create({
      name,
      slug: slug.toLowerCase(),
      licenseType: licenseType || 'TRIAL',
      isActive: true,
    });

    // Provision admin user if provided
    if (adminPhone && adminPassword) {
       const existingUser = await User.findOne({ phone: adminPhone });
       if (existingUser) {
           // Rollback company if user exists to prevent orphaned companies
           await Company.findByIdAndDelete(company._id);
           return NextResponse.json({ error: 'Phone number already registered to another user' }, { status: 400 });
       }
       
       const passwordHash = await bcrypt.hash(adminPassword, 10);
       await User.create({
          companyId: company._id,
          name: adminName || 'Company Admin',
          phone: adminPhone,
          passwordHash,
          role: 'COMPANY_ADMIN',
          isActive: true
       });
    }

    return NextResponse.json({ success: true, company });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
