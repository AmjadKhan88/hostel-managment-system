import { config } from '@/config/env';

/**
 * CSV export is a file download, not a JSON response, so it bypasses
 * apiClient (whose interceptor assumes JSON) and does a plain fetch with
 * credentials so the auth cookie is still sent.
 */
export async function downloadReportCsv(path, params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries({ ...params, format: 'csv' }).filter(([, v]) => v !== undefined))
  ).toString();
  const url = `${config.apiBaseUrl}${path}?${query}`;

  const response = await fetch(url, { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to download report');
  }
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${path.split('/').pop()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}