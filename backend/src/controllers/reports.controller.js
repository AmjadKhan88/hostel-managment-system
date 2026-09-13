import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendCsv } from '../utils/csv.js';
import * as reportsService from '../services/reports.service.js';
import * as invoiceService from '../services/invoice.service.js';

function wantsCsv(req) {
  return req.query.format === 'csv';
}

export const getOccupancyReport = asyncHandler(async (req, res) => {
  const report = await reportsService.occupancyReport(req.user, req.query.hostelId);
  if (wantsCsv(req)) {
    const rows = report.buildings.map((b) => ({
      building: b.buildingName,
      total: b.total,
      available: b.byStatus.available ?? 0,
      occupied: b.byStatus.occupied ?? 0,
      maintenance: b.byStatus.maintenance ?? 0,
      inactive: b.byStatus.inactive ?? 0,
    }));
    return sendCsv(res, 'occupancy-report.csv', rows);
  }
  new ApiResponse(200, report, 'Occupancy report fetched successfully').send(res);
});

export const getFeeCollectionReport = asyncHandler(async (req, res) => {
  const report = await reportsService.feeCollectionReport(req.user, req.query.hostelId, req.query);
  if (wantsCsv(req)) return sendCsv(res, 'fee-collection-report.csv', report.rows);
  new ApiResponse(200, report, 'Fee collection report fetched successfully').send(res);
});

export const getOutstandingDuesReport = asyncHandler(async (req, res) => {
  const balances = await invoiceService.getOutstandingBalances(req.user, req.query.hostelId);
  if (wantsCsv(req)) return sendCsv(res, 'outstanding-dues-report.csv', balances);
  new ApiResponse(200, { balances }, 'Outstanding dues report fetched successfully').send(res);
});

export const getAdmissionsReport = asyncHandler(async (req, res) => {
  const report = await reportsService.admissionsReport(req.user, req.query.hostelId, req.query);
  if (wantsCsv(req)) {
    const rows = Object.entries(report.byStatus).map(([status, count]) => ({ status, count }));
    return sendCsv(res, 'admissions-report.csv', rows);
  }
  new ApiResponse(200, report, 'Admissions report fetched successfully').send(res);
});

export const getComplaintsReport = asyncHandler(async (req, res) => {
  const report = await reportsService.complaintsReport(req.user, req.query.hostelId, req.query);
  if (wantsCsv(req)) {
    const rows = Object.entries(report.byStatus).map(([status, count]) => ({ status, count }));
    return sendCsv(res, 'complaints-report.csv', rows);
  }
  new ApiResponse(200, report, 'Complaints report fetched successfully').send(res);
});

export const getMaintenanceReport = asyncHandler(async (req, res) => {
  const report = await reportsService.maintenanceReport(req.user, req.query.hostelId, req.query);
  if (wantsCsv(req)) {
    const rows = Object.entries(report.byStatus).map(([status, count]) => ({ status, count }));
    return sendCsv(res, 'maintenance-report.csv', rows);
  }
  new ApiResponse(200, report, 'Maintenance report fetched successfully').send(res);
});

export const getVisitorsReport = asyncHandler(async (req, res) => {
  const report = await reportsService.visitorsReport(req.user, req.query.hostelId, req.query);
  if (wantsCsv(req)) return sendCsv(res, 'visitors-report.csv', report.rows);
  new ApiResponse(200, report, 'Visitors report fetched successfully').send(res);
});