
import { StudentInfo, AdminRequestRow, UniformRequest, AppMessage, SizeSummary } from '../types';
import { API_BASE_URL } from '../constants';

/**
 * Robust fetch wrapper for Google Apps Script.
 * Avoids CORS preflight by using simple requests (no custom headers).
 */
async function safeFetch(url: string, options: RequestInit = {}) {
  try {
    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      mode: 'cors',
      credentials: 'omit',
      redirect: 'follow',
      body: options.body,
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`Server connection failed with status ${response.status}`);
    }

    const text = await response.text();
    
    try {
      const json = JSON.parse(text);
      if (json.error) throw new Error(json.error);
      return json;
    } catch (e) {
      if (text.includes('<!DOCTYPE html>')) {
        throw new Error("Application configuration error: Backend access denied. Please contact school admin.");
      }
      throw new Error("Received an unexpected response format from the server.");
    }
  } catch (error: any) {
    console.error("API Communication Error:", error);
    throw error;
  }
}

export const getMessage = async (): Promise<AppMessage> => {
  try {
    const data = await safeFetch(`${API_BASE_URL}?action=getMessage`);
    return {
      english: data?.english || "",
      arabic: data?.arabic || "",
      modification: data?.modification || "enabled"
    };
  } catch (err) {
    return { english: "", arabic: "", modification: "enabled" };
  }
};

export const updateMessage = async (message: AppMessage, password: string): Promise<boolean> => {
  const data = await safeFetch(API_BASE_URL, { 
    method: 'POST', 
    body: JSON.stringify({ action: "updateMessage", password, ...message }) 
  });
  return data?.status === 'success';
};

export const searchStudent = async (studentId: string): Promise<StudentInfo | null> => {
  if (!studentId) return null;
  const url = `${API_BASE_URL}?action=search&studentId=${encodeURIComponent(studentId.trim())}`;
  const data = await safeFetch(url);
  if (data && data.found) {
    return {
      studentId: data.studentId.toString(),
      englishName: data.englishName || "",
      arabicName: data.arabicName || "",
      grade: data.grade || "",
      className: data.class || "",
      existingShirt: data.shirt || "",
      existingTrousers: data.trousers || "",
      existingJacket: data.jacket || "",
      status: data.status || ""
    };
  }
  return null;
};

export const requestModification = async (studentId: string): Promise<boolean> => {
  const data = await safeFetch(API_BASE_URL, { 
    method: 'POST', 
    body: JSON.stringify({ action: "requestModification", studentId }) 
  });
  return data?.status === 'success';
};

export const fetchSummary = async (password: string): Promise<SizeSummary> => {
  return await safeFetch(`${API_BASE_URL}?action=admin&subAction=summary&password=${encodeURIComponent(password)}`);
};

export const allowEdit = async (row: number, password: string): Promise<boolean> => {
  const data = await safeFetch(API_BASE_URL, { 
    method: 'POST', 
    body: JSON.stringify({ action: "allowEdit", row, password }) 
  });
  return data?.status === 'success';
};

export const submitRequest = async (student: StudentInfo, request: UniformRequest): Promise<{ success: boolean; message?: string }> => {
  const data = await safeFetch(API_BASE_URL, { 
    method: 'POST', 
    body: JSON.stringify({ action: "requestUpdate", studentId: student.studentId, ...request }) 
  });
  return { success: data?.status === 'success', message: data?.message };
};

export const fetchAdminRequests = async (password: string): Promise<AdminRequestRow[]> => {
  const data = await safeFetch(`${API_BASE_URL}?action=admin&password=${encodeURIComponent(password)}`);
  if (!Array.isArray(data)) return [];
  return data.map((item: any) => ({ ...item, className: item.class || "" }));
};

export const approveRequest = async (row: number, password: string): Promise<boolean> => {
  const data = await safeFetch(API_BASE_URL, { 
    method: 'POST', 
    body: JSON.stringify({ action: "approve", row, password }) 
  });
  return data?.status === 'success';
};
