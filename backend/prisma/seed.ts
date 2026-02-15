import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

const PER_ORG = 150;
const NUM_ORGS = 5;
const LOCATIONS_PER_ORG = 30;
const FUEL_PER_ORG = 200;
const DOCUMENTS_PER_ORG = 150;

const ORG_NAMES = [
  'Demo Transport DOO',
  'Brzi Prevoz DOO',
  'Logistik Plus DOO',
  'Fleet Solutions DOO',
  'Auto Park DOO',
];

const vehicleMakesModels = [
  { make: 'Mercedes-Benz', model: 'Actros 2651', mileage: 125_000 },
  { make: 'Scania', model: 'R 450', mileage: 89_500 },
  { make: 'Volvo', model: 'FH 500', mileage: 210_000 },
  { make: 'MAN', model: 'TGX 26.480', mileage: 45_000 },
  { make: 'DAF', model: 'XF 480', mileage: 167_000 },
  { make: 'Iveco', model: 'Stralis NP 460', mileage: 78_000 },
  { make: 'Mercedes-Benz', model: 'Atego 1825', mileage: 95_000 },
  { make: 'Scania', model: 'P 320', mileage: 112_000 },
  { make: 'Volvo', model: 'FE 320', mileage: 88_000 },
  { make: 'MAN', model: 'TGS 35.440', mileage: 134_000 },
  { make: 'DAF', model: 'CF 430', mileage: 201_000 },
  { make: 'Renault', model: 'T Range T 520', mileage: 156_000 },
  { make: 'Mercedes-Benz', model: 'Econic 2628', mileage: 67_000 },
  { make: 'Scania', model: 'L 320', mileage: 91_000 },
];

const trailerTemplates = [
  { make: 'Schmitz Cargobull', model: 'S.KO COOL 25' },
  { make: 'Krone', model: 'Cool Liner' },
  { make: 'Schmitz Cargobull', model: 'S.KO MEGA 25' },
  { make: 'Krone', model: 'Profi Liner' },
  { make: 'Lamberet', model: 'Refrigerated' },
  { make: 'Gray Adams', model: 'Drop Deck' },
  { make: 'Schmitz Cargobull', model: 'S.KO CURTAIN' },
  { make: 'Krone', model: 'Mega Liner' },
];

const driverNameTemplates = [
  'Marko Petrović', 'Jovan Jovanović', 'Ana Nikolić', 'Stefan Đorđević', 'Milica Pavlović',
  'Nikola Ilić', 'Jelena Stojanović', 'Dušan Marković', 'Sandra Todorović', 'Ivan Kostić',
  'Maja Popović', 'Luka Simić', 'Petar Nikolić', 'Milan Jovanović', 'Teodora Pavlović',
];

const locationTemplates = [
  { name: 'Depo Beograd Centar', type: 'PARKING' as const, address: 'Bulevar oslobođenja 123, Beograd' },
  { name: 'Depo Novi Sad', type: 'PARKING' as const, address: 'Bulevar cara Lazara 45, Novi Sad' },
  { name: 'Parking Niš', type: 'PARKING' as const, address: 'Obrenovićeva 78, Niš' },
  { name: 'Servis Beograd', type: 'SERVICE' as const, address: 'Industrijska 12, Beograd' },
  { name: 'Servis Novi Sad', type: 'SERVICE' as const, address: 'Industrijska zona 5, Novi Sad' },
  { name: 'Parking Subotica', type: 'PARKING' as const, address: 'Matije Korvina 20, Subotica' },
  { name: 'Depo Kragujevac', type: 'PARKING' as const, address: 'Jovana Cvijića 100, Kragujevac' },
  { name: 'Servis Niš', type: 'SERVICE' as const, address: 'Trupale putev 8, Niš' },
  { name: 'Parking Pančevo', type: 'PARKING' as const, address: 'Vojvođanska 33, Pančevo' },
  { name: 'Depo Šabac', type: 'PARKING' as const, address: 'Despota Stefana 15, Šabac' },
];

const tripStatuses: Array<'PRE_TRIP' | 'IN_PROGRESS' | 'POST_TRIP' | 'COMPLETED'> = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'POST_TRIP', 'COMPLETED'];

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

function addHours(d: Date, h: number): Date {
  const out = new Date(d);
  out.setHours(out.getHours() + h);
  return out;
}

async function seedOrganization(orgIndex: number) {
  const orgName = ORG_NAMES[orgIndex];
  const orgId = `00000000-0000-0000-0000-${String(orgIndex + 1).padStart(12, '0')}`;
  const prefix = `org${orgIndex + 1}`;

  const org = await prisma.organization.upsert({
    where: { id: orgId },
    create: { id: orgId, name: orgName },
    update: { name: orgName },
  });
  console.log(`[${orgName}] Organization ready.`);

  const adminEmail = `admin@${prefix}.vehicles.local`;
  const driverEmail = `driver@${prefix}.vehicles.local`;
  const passwordHash = await bcrypt.hash('Password123!', SALT_ROUNDS);
  await prisma.user.upsert({
    where: { provider_providerId: { provider: 'email', providerId: adminEmail } },
    create: { email: adminEmail, name: `Admin ${orgName}`, provider: 'email', providerId: adminEmail, passwordHash, role: 'ADMIN', orgId: org.id },
    update: { name: `Admin ${orgName}`, passwordHash, orgId: org.id },
  });
  await prisma.user.upsert({
    where: { provider_providerId: { provider: 'email', providerId: driverEmail } },
    create: { email: driverEmail, name: `Driver ${orgName}`, provider: 'email', providerId: driverEmail, passwordHash, role: 'DRIVER', orgId: org.id },
    update: { name: `Driver ${orgName}`, passwordHash, orgId: org.id },
  });
  if (orgIndex === 0) {
    await prisma.user.upsert({
      where: { provider_providerId: { provider: 'email', providerId: 'admin@vehicles.local' } },
      create: { email: 'admin@vehicles.local', name: 'Admin User', provider: 'email', providerId: 'admin@vehicles.local', passwordHash, role: 'ADMIN', orgId: org.id },
      update: { orgId: org.id },
    });
    await prisma.user.upsert({
      where: { provider_providerId: { provider: 'email', providerId: 'driver@vehicles.local' } },
      create: { email: 'driver@vehicles.local', name: 'Driver One', provider: 'email', providerId: 'driver@vehicles.local', passwordHash, role: 'DRIVER', orgId: org.id },
      update: { orgId: org.id },
    });
  }
  const adminUser = await prisma.user.findFirst({ where: { orgId: org.id, role: 'ADMIN' } });

  const vehicleIds: string[] = [];
  const statuses: Array<'ACTIVE' | 'PAUSED' | 'FROZEN' | 'IN_SERVICE'> = ['ACTIVE', 'ACTIVE', 'PAUSED', 'IN_SERVICE', 'ACTIVE'];
  for (let i = 0; i < PER_ORG; i++) {
    const v = vehicleMakesModels[i % vehicleMakesModels.length];
    const created = await prisma.vehicle.create({
      data: {
        orgId: org.id,
        make: v.make,
        model: v.model,
        vin: `VIN-${orgIndex}-${i}-${Date.now().toString(36)}`,
        registration: `BG-${orgIndex}-${String(i).padStart(5, '0')}`,
        mileage: v.mileage + i * 1000,
        purchaseDate: addDays(new Date(), -1000 - i * 10),
        status: statuses[i % statuses.length],
      },
    });
    vehicleIds.push(created.id);
  }
  console.log(`[${orgName}] Vehicles: ${vehicleIds.length}`);

  const driverIds: string[] = [];
  const driverUser = await prisma.user.findFirst({ where: { orgId: org.id, role: 'DRIVER' } });
  for (let i = 0; i < PER_ORG; i++) {
    const name = `${driverNameTemplates[i % driverNameTemplates.length]} #${i + 1}`;
    const created = await prisma.driver.create({
      data: {
        orgId: org.id,
        name,
        licenseNumber: `DL-${orgIndex}-${String(i).padStart(6, '0')}`,
        licenseExpiry: addDays(new Date(), 180 + i * 10),
        phone: `+381 6${(i % 9)} ${String(1000000 + i).slice(1)}`,
        status: i % 10 === 0 ? 'PAUSED' : 'ACTIVE',
        userId: i === 0 && driverUser ? driverUser.id : null,
      },
    });
    driverIds.push(created.id);
  }
  console.log(`[${orgName}] Drivers: ${driverIds.length}`);

  const trailerData = Array.from({ length: PER_ORG }, (_, i) => {
    const t = trailerTemplates[i % trailerTemplates.length];
    return {
      orgId: org.id,
      make: t.make,
      model: t.model,
      registration: `BG-T-${orgIndex}-${String(i).padStart(5, '0')}`,
      mileage: 70_000 + i * 500,
      purchaseDate: addDays(new Date(), -800 - i),
      status: i % 15 === 0 ? 'PAUSED' : ('ACTIVE' as const),
    };
  });
  await prisma.trailer.createMany({ data: trailerData });
  console.log(`[${orgName}] Trailers: ${PER_ORG}`);

  const locData = Array.from({ length: LOCATIONS_PER_ORG }, (_, i) => {
    const loc = locationTemplates[i % locationTemplates.length];
    return {
      orgId: org.id,
      name: `${loc.name} (${orgName}) ${i + 1}`,
      type: loc.type,
      address: loc.address,
      status: 'ACTIVE' as const,
    };
  });
  await prisma.location.createMany({ data: locData });
  console.log(`[${orgName}] Locations: ${LOCATIONS_PER_ORG}`);

  const trips: { id: string; vehicleId: string; driverId: string }[] = [];
  for (let i = 0; i < PER_ORG; i++) {
    const startAt = addDays(new Date(), -90 + (i % 60));
    startAt.setHours(6 + (i % 12), (i % 60) % 60, 0, 0);
    const endAt = addHours(startAt, 4 + (i % 8));
    const status = tripStatuses[i % tripStatuses.length];
    const startMileage = 50_000 + i * 300;
    const endMileage = startMileage + 200 + (i % 500);
    const created = await prisma.trip.create({
      data: {
        orgId: org.id,
        vehicleId: vehicleIds[i],
        driverId: driverIds[i],
        startAt,
        endAt: status !== 'PRE_TRIP' && status !== 'IN_PROGRESS' ? endAt : null,
        startMileage,
        endMileage: status === 'COMPLETED' || status === 'POST_TRIP' ? endMileage : null,
        status,
        notes: i % 7 === 0 ? `Vožnja ${i + 1}` : null,
      },
    });
    trips.push({ id: created.id, vehicleId: vehicleIds[i], driverId: driverIds[i] });
  }
  console.log(`[${orgName}] Trips: ${trips.length}`);

  const fuelData = Array.from({ length: FUEL_PER_ORG }, (_, i) => {
    const tIdx = i % trips.length;
    const t = trips[tIdx];
    return {
      orgId: org.id,
      vehicleId: t.vehicleId,
      tripId: t.id,
      amountLiters: 60 + (i % 80),
      costCents: (100 + (i % 50)) * 100,
      recordedAt: addDays(new Date(), -60 + (i % 40)),
      notes: i % 5 === 0 ? 'Full tank' : null,
    };
  });
  await prisma.fuelRecord.createMany({ data: fuelData });
  console.log(`[${orgName}] Fuel records: ${FUEL_PER_ORG}`);

  if (adminUser) {
    const docData: { orgId: string; entityType: 'TRIP' | 'VEHICLE' | 'DRIVER'; entityId: string; fileName: string; fileUrl: string | null; mimeType: string; uploadedBy: string }[] = [];
    const perType = Math.floor(DOCUMENTS_PER_ORG / 3);
    for (let i = 0; i < perType && i < trips.length; i++) {
      docData.push({ orgId: org.id, entityType: 'TRIP', entityId: trips[i].id, fileName: `trip-${i + 1}.pdf`, fileUrl: null, mimeType: 'application/pdf', uploadedBy: adminUser.id });
    }
    for (let i = 0; i < perType && i < vehicleIds.length; i++) {
      docData.push({ orgId: org.id, entityType: 'VEHICLE', entityId: vehicleIds[i], fileName: `vehicle-${i + 1}.pdf`, fileUrl: null, mimeType: 'application/pdf', uploadedBy: adminUser.id });
    }
    for (let i = 0; i < perType && i < driverIds.length; i++) {
      docData.push({ orgId: org.id, entityType: 'DRIVER', entityId: driverIds[i], fileName: `driver-${i + 1}.pdf`, fileUrl: null, mimeType: 'application/pdf', uploadedBy: adminUser.id });
    }
    await prisma.document.createMany({ data: docData });
    console.log(`[${orgName}] Documents: ${docData.length}`);
  }

  const usersForAudit = await prisma.user.findMany({ where: { orgId: org.id }, take: 2 });
  for (const user of usersForAudit) {
    await prisma.loginAudit.createMany({
      data: Array.from({ length: 5 }, (_, a) => ({
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        ip: `192.168.${orgIndex}.${10 + a}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
        createdAt: addDays(new Date(), -14 + a),
      })),
    });
  }
  console.log(`[${orgName}] Login audit created.`);
}

async function main() {
  console.log('Seeding database: 5 organizations, 150 vehicles/drivers/trailers/trips per org...');

  const existingOrgs = await prisma.organization.count();
  if (existingOrgs >= NUM_ORGS) {
    const vCount = await prisma.vehicle.count();
    const dCount = await prisma.driver.count();
    console.log(`Already have ${existingOrgs} orgs, ${vCount} vehicles, ${dCount} drivers.`);
    console.log('To re-seed from scratch run: cd backend && npx prisma migrate reset');
    console.log('Seed finished.');
    return;
  }

  for (let o = 0; o < NUM_ORGS; o++) {
    await seedOrganization(o);
  }

  console.log('Seed finished successfully.');
  console.log(`Summary: ${NUM_ORGS} orgs, ${PER_ORG} vehicles/drivers/trailers/trips per org, ${FUEL_PER_ORG} fuel, ${DOCUMENTS_PER_ORG} docs.`);
  console.log('Login: admin@vehicles.local ili admin@org1.vehicles.local ... admin@org5.vehicles.local / Password123!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
