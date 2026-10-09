import { apiClient } from '@/lib/apiClient';

export async function downloadFile(path, filename) {
  const blob = await apiClient.get(path, { responseType: 'blob' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Some browsers cancel the download if the URL is revoked immediately.
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
