import { PrismaClient, Role, PropertyType, PaymentFrequency } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      fullName: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log('Created Admin:', admin.email);

  const staffPassword = await bcrypt.hash('staff123', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      fullName: 'Staff User',
      email: 'staff@example.com',
      passwordHash: staffPassword,
      role: Role.STAFF,
    },
  });
  console.log('Created Staff:', staff.email);

  // 2. Create Landlords
  const landlord1 = await prisma.landlord.create({
    data: {
      fullName: 'John Doe',
      email: 'john.doe@landlord.com',
      phone: '+1234567890',
      bankName: 'Chase',
      bankAccountNumber: '123456789',
    },
  });
  console.log('Created Landlord:', landlord1.fullName);

  // 3. Create Properties & Units
  const property1 = await prisma.property.create({
    data: {
      name: 'Sunset Apartments',
      addressLine1: '123 Sunset Blvd',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      type: PropertyType.APARTMENT,
      landlordId: landlord1.id,
      units: {
        create: [
          { name: 'A101', monthlyRentAmount: 1500, status: 'VACANT' },
          { name: 'A102', monthlyRentAmount: 1600, status: 'VACANT' },
        ],
      },
    },
  });
  console.log('Created Property:', property1.name);

  // 4. Create Tenants
  const tenant1 = await prisma.tenant.create({
    data: {
      fullName: 'Alice Smith',
      email: 'alice@example.com',
      phone: '+1987654321',
      status: 'PENDING',
    },
  });
  console.log('Created Tenant:', tenant1.fullName);

  // 5. Create Lease (and link Tenant to Unit)
  // We need to fetch the unit first to get its ID
  const unitA101 = await prisma.unit.findFirst({ where: { name: 'A101', propertyId: property1.id } });
  
  if (unitA101) {
    const lease = await prisma.lease.create({
      data: {
        tenantId: tenant1.id,
        unitId: unitA101.id,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        rentAmount: 1500,
        paymentFrequency: PaymentFrequency.MONTHLY,
        status: 'ACTIVE',
      },
    });

    // Update Unit and Tenant status manually as per our service logic (or just let the seed do it)
    await prisma.unit.update({
        where: { id: unitA101.id },
        data: { status: 'OCCUPIED' }
    });

    await prisma.tenant.update({
        where: { id: tenant1.id },
        data: { currentUnitId: unitA101.id, status: 'ACTIVE' }
    });

    console.log('Created Lease for Unit:', unitA101.name);
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
