import { prisma } from '../infrastructure/db.js';

export interface ReportSummary {
  vehicles: number;
  drivers: number;
  trips: number;
  fuelRecords: number;
  locations: number;
}

export async function getSummary(
  orgId: string | null,
  from?: Date,
  to?: Date
): Promise<ReportSummary> {
  if (!orgId) {
    return { vehicles: 0, drivers: 0, trips: 0, fuelRecords: 0, locations: 0 };
  }
  const tripWhere: { orgId: string; startAt?: { gte?: Date; lte?: Date } } = { orgId };
  const fuelWhere: { orgId: string; recordedAt?: { gte?: Date; lte?: Date } } = { orgId };
  if (from || to) {
    if (from) {
      tripWhere.startAt = { ...tripWhere.startAt, gte: from };
      fuelWhere.recordedAt = { ...fuelWhere.recordedAt, gte: from };
    }
    if (to) {
      tripWhere.startAt = { ...tripWhere.startAt, lte: to };
      fuelWhere.recordedAt = { ...fuelWhere.recordedAt, lte: to };
    }
  }
  const [vehicles, drivers, trips, fuelRecords, locations] = await Promise.all([
    prisma.vehicle.count({ where: { orgId } }),
    prisma.driver.count({ where: { orgId } }),
    prisma.trip.count({ where: tripWhere }),
    prisma.fuelRecord.count({ where: fuelWhere }),
    prisma.location.count({ where: { orgId } }),
  ]);
  return { vehicles, drivers, trips, fuelRecords, locations };
}

export interface FuelReportItem {
  vehicleId: string;
  orgName: string;
  vehicleMake: string;
  vehicleModel: string;
  totalLiters: number;
  totalCostCents: number | null;
  recordCount: number;
}

export async function getFuelReport(
  orgId: string | null,
  from?: Date,
  to?: Date
): Promise<FuelReportItem[]> {
  if (!orgId) return [];
  const where: { orgId: string; recordedAt?: { gte?: Date; lte?: Date } } = { orgId };
  if (from || to) {
    where.recordedAt = {};
    if (from) where.recordedAt.gte = from;
    if (to) where.recordedAt.lte = to;
  }
  const records = await prisma.fuelRecord.findMany({
    where,
    include: {
      vehicle: {
        select: {
          id: true,
          make: true,
          model: true,
          org: { select: { name: true } },
        },
      },
    },
  });
  const byVehicle = new Map<string, FuelReportItem>();
  for (const r of records) {
    const key = r.vehicleId;
    if (!byVehicle.has(key)) {
      byVehicle.set(key, {
        vehicleId: r.vehicle.id,
        orgName: r.vehicle.org.name,
        vehicleMake: r.vehicle.make,
        vehicleModel: r.vehicle.model,
        totalLiters: 0,
        totalCostCents: 0,
        recordCount: 0,
      });
    }
    const item = byVehicle.get(key)!;
    item.totalLiters += r.amountLiters;
    item.totalCostCents! += r.costCents ?? 0;
    item.recordCount += 1;
  }
  return Array.from(byVehicle.values()).map((i) => ({
    ...i,
    totalCostCents: (i.totalCostCents ?? 0) === 0 ? null : i.totalCostCents,
  }));
}

export interface TripsReportItem {
  status: string;
  count: number;
}

export interface TripsReportPerOrg {
  orgId: string;
  orgName: string;
  total: number;
  byStatus: TripsReportItem[];
}

export interface TripsReport {
  total: number;
  byStatus: TripsReportItem[];
  perOrg: TripsReportPerOrg[];
}

export async function getTripsReport(
  orgId: string | null,
  from?: Date,
  to?: Date
): Promise<TripsReport> {
  if (!orgId) return { total: 0, byStatus: [], perOrg: [] };
  const where: { orgId: string; startAt?: { gte?: Date; lte?: Date } } = { orgId };
  if (from || to) {
    where.startAt = {};
    if (from) where.startAt.gte = from;
    if (to) where.startAt.lte = to;
  }
  const [trips, org] = await Promise.all([
    prisma.trip.findMany({
      where,
      select: { status: true },
    }),
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    }),
  ]);
  const byStatus = new Map<string, number>();
  for (const t of trips) {
    byStatus.set(t.status, (byStatus.get(t.status) ?? 0) + 1);
  }
  const byStatusList = Array.from(byStatus.entries()).map(([status, count]) => ({ status, count }));
  const perOrg: TripsReportPerOrg[] = [
    {
      orgId,
      orgName: org?.name ?? '',
      total: trips.length,
      byStatus: byStatusList,
    },
  ];
  return {
    total: trips.length,
    byStatus: byStatusList,
    perOrg,
  };
}

export interface LocationsReportItem {
  id: string;
  orgName: string;
  name: string;
  type: string;
  address: string | null;
  status: string;
}

export async function getLocationsReport(orgId: string | null): Promise<LocationsReportItem[]> {
  if (!orgId) return [];
  const locations = await prisma.location.findMany({
    where: { orgId },
    include: { org: { select: { name: true } } },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });
  return locations.map((loc) => ({
    id: loc.id,
    orgName: loc.org.name,
    name: loc.name,
    type: loc.type,
    address: loc.address,
    status: loc.status,
  }));
}
