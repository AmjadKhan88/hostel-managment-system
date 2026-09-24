import * as dashboardService from '../services/dashboard.service.js';
import * as invoiceService from '../services/invoice.service.js';
import * as residentService from '../services/resident.service.js';
import * as reportsService from '../services/reports.service.js';

/**
 * The fixed, allow-listed set of data-access functions the AI Admin
 * Assistant may call — the "controlled tool/function layer." The AI can
 * never run an arbitrary database query, only one of these, and every one
 * of them goes through the same hostel-scoped service functions the rest
 * of the app uses (resolveHostelScope runs inside each, using the real
 * authenticated user — the AI cannot use this to bypass authorization).
 */
export const AI_TOOLS = {
  get_dashboard_summary: {
    description:
      'Get occupancy stats, room/resident counts, and the 30-day admissions trend for the hostel.',
    parameters: {},
    execute: async (user, hostelId) => dashboardService.getDashboardSummary(user, hostelId),
  },
  get_outstanding_balances: {
    description: 'List residents with unpaid or partially paid invoices and how much each owes.',
    parameters: {},
    execute: async (user, hostelId) => invoiceService.getOutstandingBalances(user, hostelId),
  },
  list_residents: {
    description:
      'Search/list residents by status (pending, active, checked_out) or a name/phone/email search term.',
    parameters: {
      status: {
        type: 'string',
        enum: ['pending', 'active', 'checked_out'],
        description: 'Filter by resident status',
      },
      search: {
        type: 'string',
        description: 'Search by name, phone, email, or registration number',
      },
    },
    execute: async (user, hostelId, args) =>
      residentService.listResidents(user, {
        hostelId,
        status: args.status,
        search: args.search,
        limit: 20,
      }),
  },
  get_occupancy_report: {
    description: 'Get bed occupancy broken down by building.',
    parameters: {},
    execute: async (user, hostelId) => reportsService.occupancyReport(user, hostelId),
  },
  get_fee_collection_report: {
    description: 'Get total fees collected, optionally within a date range.',
    parameters: {
      from: { type: 'string', description: 'Start date, format YYYY-MM-DD' },
      to: { type: 'string', description: 'End date, format YYYY-MM-DD' },
    },
    execute: async (user, hostelId, args) =>
      reportsService.feeCollectionReport(user, hostelId, args),
  },
  get_complaints_report: {
    description: 'Get complaint counts by status and category, optionally within a date range.',
    parameters: {
      from: { type: 'string', description: 'Start date, format YYYY-MM-DD' },
      to: { type: 'string', description: 'End date, format YYYY-MM-DD' },
    },
    execute: async (user, hostelId, args) => reportsService.complaintsReport(user, hostelId, args),
  },
  get_maintenance_report: {
    description:
      'Get maintenance ticket counts by status and total maintenance cost, optionally within a date range.',
    parameters: {
      from: { type: 'string', description: 'Start date, format YYYY-MM-DD' },
      to: { type: 'string', description: 'End date, format YYYY-MM-DD' },
    },
    execute: async (user, hostelId, args) => reportsService.maintenanceReport(user, hostelId, args),
  },
};
