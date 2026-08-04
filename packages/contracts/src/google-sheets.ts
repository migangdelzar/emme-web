import { API } from "./routes.js";
import type { HttpClient } from "./transport.js";

export interface SheetsExportRequest {
  exportType: "APPOINTMENTS" | "CLIENTS" | "FULL";
}

export interface SpreadsheetLink {
  id: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  exportType: string;
  lastExportedAt?: string;
  createdAt: string;
}

export interface GoogleSheetsApi {
  exportData(data: SheetsExportRequest): Promise<SpreadsheetLink>;
  reExport(spreadsheetId: string): Promise<SpreadsheetLink>;
  list(): Promise<SpreadsheetLink[]>;
}

export function createGoogleSheetsApi(http: HttpClient): GoogleSheetsApi {
  return {
    exportData: async (data) => http.post<SpreadsheetLink>(`${API.GOOGLE_SHEETS}/export`, data),
    reExport: async (id) => http.post<SpreadsheetLink>(`${API.GOOGLE_SHEETS}/export/${id}`),
    list: async () => http.get<SpreadsheetLink[]>(`${API.GOOGLE_SHEETS}/spreadsheets`),
  };
}
