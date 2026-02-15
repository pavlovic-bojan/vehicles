import { api } from '../boot/axios';

export interface ReportSummary {
  vehicles: number;
  drivers: number;
  trips: number;
  fuelRecords: number;
  locations: number;
}

export interface FuelReportItem {
  vehicleId: string;
  vehicleMake: string;
  vehicleModel: string;
  totalLiters: number;
  totalCostCents: number | null;
  recordCount: number;
}

export interface TripsReportItem {
  status: string;
  count: number;
}

export interface TripsReport {
  total: number;
  byStatus: TripsReportItem[];
}

export const reportsApi = {
  getSummary: () =>
    api.get<{ data: ReportSummary }>('/api/reports/summary'),

  getFuelReport: (params?: { from?: string; to?: string }) =>
    api.get<{ data: FuelReportItem[] }>('/api/reports/fuel', { params }),

  getTripsReport: (params?: { from?: string; to?: string }) =>
    api.get<{ data: TripsReport }>('/api/reports/trips', { params }),
};
