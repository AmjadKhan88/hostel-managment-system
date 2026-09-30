import { apiClient } from '@/lib/apiClient';

export const automationApi = {
  status: (hostelId) => apiClient.get('/automation/status', { params: { hostelId } }),
  retryJob: (queue, jobId) => apiClient.post(`/automation/jobs/${queue}/${jobId}/retry`),
  triggerMonthlyInvoices: (hostelId) =>
    apiClient.post('/automation/trigger/monthly-invoices', { hostelId }),
  triggerPaymentReminders: (hostelId) =>
    apiClient.post('/automation/trigger/payment-reminders', { hostelId }),
};
