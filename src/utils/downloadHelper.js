import apiClient from "./apiClient";

export const downloadFile = async (url, params, defaultFilename) => {
  try {
    const response = await apiClient.get(url, {
      params,
      paramsSerializer: (p) =>
        Object.entries(p)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
          .join("&"),
      responseType: 'blob' // Important for handling binary data
    });
    
    // Extract filename from Content-Disposition header if available
    let filename = defaultFilename || "export.csv";
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // Create a Blob from the response data
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const downloadUrl = window.URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return true;
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
};
