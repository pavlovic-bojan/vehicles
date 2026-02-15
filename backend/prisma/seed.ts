import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const SEED_ORG = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Demo Transport DOO',
};

const seedUsers = [
  { email: 'admin@vehicles.local', name: 'Admin User', role: 'ADMIN' as const, password: 'Password123!' },
  { email: 'driver@vehicles.local', name: 'Driver One', role: 'DRIVER' as const, password: 'Password123!' },
  { email: 'auditor@vehicles.local', name: 'Auditor User', role: 'AUDITOR' as const, password: 'Password123!' },
];

const seedVehicles = [
  { make: 'Mercedes-Benz', model: 'Actros 2651', vin: 'WDB9630321L123456', registration: 'BG-12345-A', mileage: 125_000, purchaseDate: new Date('2021-03-15'), status: 'ACTIVE' as const },
  { make: 'Scania', model: 'R 450', vin: 'YS2R4X20005399401', registration: 'BG-67890-B', mileage: 89_500, purchaseDate: new Date('2022-06-01'), status: 'ACTIVE' as const },
  { make: 'Volvo', model: 'FH 500', vin: 'YV1LW58C8X1234567', registration: 'BG-11111-C', mileage: 210_000, purchaseDate: new Date('2019-11-20'), status: 'IN_SERVICE' as const },
  { make: 'MAN', model: 'TGX 26.480', vin: 'WMA13XZZ0K1234567', registration: 'BG-22222-D', mileage: 45_000, purchaseDate: new Date('2023-01-10'), status: 'ACTIVE' as const },
  { make: 'DAF', model: 'XF 480', vin: 'XLRTE47MS0Y123456', registration: 'BG-33333-E', mileage: 167_000, purchaseDate: new Date('2020-07-05'), status: 'PAUSED' as const },
];

const seedTrailers = [
  { make: 'Schmitz Cargobull', model: 'S.KO COOL 25', registration: 'BG-T-11111', mileage: 95_000, purchaseDate: new Date('2020-09-12'), status: 'ACTIVE' as const },
  { make: 'Krone', model: 'Cool Liner', registration: 'BG-T-22222', mileage: 72_000, purchaseDate: new Date('2021-05-20'), status: 'ACTIVE' as const },
];

const seedDrivers = [
  { name: 'Marko Petrović', licenseNumber: 'DL-123456', licenseExpiry: new Date('2026-12-31'), phone: '+381 64 123 4567', status: 'ACTIVE' as const },
  { name: 'Jovan Jovanović', licenseNumber: 'DL-234567', licenseExpiry: new Date('2025-06-15'), phone: '+381 65 234 5678', status: 'ACTIVE' as const },
  { name: 'Ana Nikolić', licenseNumber: 'DL-345678', licenseExpiry: new Date('2026-03-20'), phone: '+381 63 345 6789', status: 'ACTIVE' as const },
];

async function main() {
  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { id: SEED_ORG.id },
    create: { id: SEED_ORG.id, name: SEED_ORG.name },
    update: { name: SEED_ORG.name },
  });
  console.log('Organization:', org.name);

  // 2. Users (all linked to org)
  for (const u of seedUsers) {
    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
    await prisma.user.upsert({
      where: {
        provider_providerId: { provider: 'email', providerId: u.email },
      },
      create: {
        email: u.email,
        name: u.name,
        provider: 'email',
        providerId: u.email,
        passwordHash,
        role: u.role,
        orgId: org.id,
      },
      update: {
        name: u.name,
        passwordHash,
        role: u.role,
        orgId: org.id,
      },
    });
  }
  console.log('Users:', seedUsers.map((u) => u.email).join(', '));

  // 3. Vehicles (only create if none exist for this org; skip if vehicles table missing)
  try {
    const existingVehicles = await prisma.vehicle.count({ where: { orgId: org.id } });
    if (existingVehicles === 0) {
      for (const v of seedVehicles) {
        await prisma.vehicle.create({
          data: {
            orgId: org.id,
            make: v.make,
            model: v.model,
            vin: v.vin,
            registration: v.registration,
            mileage: v.mileage,
            purchaseDate: v.purchaseDate,
            status: v.status,
          },
        });
      }
      console.log('Vehicles created:', seedVehicles.length);
    } else {
      console.log('Vehicles already exist for org, skipped:', existingVehicles);
    }
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2021') {
      console.log('Vehicles table missing – run "npx prisma db push" then re-run seed to create vehicles.');
    } else {
      throw e;
    }
  }

  // 4. Trailers
  try {
    const existingTrailers = await prisma.trailer.count({ where: { orgId: org.id } });
    if (existingTrailers === 0) {
      for (const t of seedTrailers) {
        await prisma.trailer.create({
          data: {
            orgId: org.id,
            make: t.make,
            model: t.model,
            registration: t.registration,
            mileage: t.mileage,
            purchaseDate: t.purchaseDate,
            status: t.status,
          },
        });
      }
      console.log('Trailers created:', seedTrailers.length);
    } else {
      console.log('Trailers already exist for org, skipped:', existingTrailers);
    }
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2021') {
      console.log('Trailers table missing – run "npx prisma db push" then re-run seed to create trailers.');
    } else {
      throw e;
    }
  }

  // 5. Drivers (link first driver to driver@vehicles.local user if exists)
  try {
    const existingDrivers = await prisma.driver.count({ where: { orgId: org.id } });
    if (existingDrivers === 0) {
      const driverUser = await prisma.user.findUnique({
        where: { provider_providerId: { provider: 'email', providerId: 'driver@vehicles.local' } },
      });
      for (let i = 0; i < seedDrivers.length; i++) {
        const d = seedDrivers[i];
        await prisma.driver.create({
          data: {
            orgId: org.id,
            name: d.name,
            licenseNumber: d.licenseNumber,
            licenseExpiry: d.licenseExpiry,
            phone: d.phone,
            status: d.status,
            userId: i === 0 && driverUser ? driverUser.id : null,
          },
        });
      }
      console.log('Drivers created:', seedDrivers.length);
    } else {
      console.log('Drivers already exist for org, skipped:', existingDrivers);
    }
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2021') {
      console.log('Drivers table missing – run "npx prisma db push" then re-run seed to create drivers.');
    } else {
      throw e;
    }
  }

  // 6. Trips (create sample trips if we have vehicles and drivers)
  try {
    const tripCount = await prisma.trip.count({ where: { orgId: org.id } });
    if (tripCount === 0) {
      const [vList, dList] = await Promise.all([
        prisma.vehicle.findMany({ where: { orgId: org.id }, take: 1 }),
        prisma.driver.findMany({ where: { orgId: org.id }, take: 1 }),
      ]);
      if (vList.length > 0 && dList.length > 0) {
        await prisma.trip.create({
          data: {
            orgId: org.id,
            vehicleId: vList[0].id,
            driverId: dList[0].id,
            startAt: new Date(Date.now() - 86400000),
            startMileage: vList[0].mileage,
            status: 'COMPLETED',
            endAt: new Date(),
            endMileage: vList[0].mileage + 450,
          },
        });
        console.log('Sample trip created.');
      }
    }
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2021') {
      console.log('Trips table missing – run "npx prisma db push" then re-run seed.');
    } else {
      throw e;
    }
  }

  console.log('Seed finished.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
