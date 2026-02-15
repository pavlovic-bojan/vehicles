import { prisma } from '../infrastructure/db.js';

export interface ReportSummary {
  vehicles: number;
  drivers: number;
  trips: number;
  fuelRecords: number;
  locations: number;
}

export async function getSummary(orgId: string | null): Promise<ReportSummary> {
  if (!orgId) {
    return { vehicles: 0, drivers: 0, trips: 0, fuelRecords: 0, locations: 0 };
  }
  const [vehicles, drivers, trips, fuelRecords, locations] = await Promise.all([
    prisma.vehicle.count({ where: { orgId } }),
    prisma.driver.count({ where: { orgId } }),
    prisma.trip.count({ where: { orgId } }),
    prisma.fuelRecord.count({ where: { orgId } }),
    prisma.location.count({ where: { orgId } }),
  ]);
  return { vehicles, drivers, trips, fuelRecords, locations };
}

export interface FuelReportItem {
  vehicleId: string;
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
    include: { vehicle: { select: { id: true, make: true, model: true } } },
  });
  const byVehicle = new Map<string, FuelReportItem>();
  for (const r of records) {
    const key = r.vehicleId;
    if (!byVehicle.has(key)) {
      byVehicle.set(key, {
        vehicleId: r.vehicle.id,
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

export interface TripsReport {
  total: number;
  byStatus: TripsReportItem[];
}

export async function getTripsReport(
  orgId: string | null,
  from?: Date,
  to?: Date
): Promise<TripsReport> {
  if (!orgId) return { total: 0, byStatus: [] };
  const where: { orgId: string; startAt?: { gte?: Date; lte?: Date } } = { orgId };
  if (from || to) {
    where.startAt = {};
    if (from) where.startAt.gte = from;
    if (to) where.startAt.lte = to;
  }
  const trips = await prisma.trip.findMany({
    where,
    select: { status: true },
  });
  const byStatus = new Map<string, number>();
  for (const t of trips) {
    byStatus.set(t.status, (byStatus.get(t.status) ?? 0) + 1);
  }
  return {
    total: trips.length,
    byStatus: Array.from(byStatus.entries()).map(([status, count]) => ({ status, count })),
  };
}
