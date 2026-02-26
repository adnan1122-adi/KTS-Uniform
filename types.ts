
export type UniformSize = 'S' | 'M' | 'L' | 'XL' | '2XL';

export interface StudentInfo {
  studentId: string;
  englishName: string;
  grade: string;
  gender: string;
  parentName?: string;
  mobileNo?: string;
  greenHoodie?: string;
  greenPant?: string;
  greenPolo?: string;
  whiteTshirt?: string;
  beigePant?: string;
  skort?: string;
  notes?: string;
  status?: string;
}

export interface UniformRequest {
  parentName: string;
  mobileNo: string;
  greenHoodie: string;
  greenPant: string;
  greenPolo: string;
  whiteTshirt: string;
  beigePant: string;
  skort: string;
  notes: string;
}

export interface AdminRequestRow extends StudentInfo {
  row: number;
  requestStatus: string;
}

export interface AppMessage {
  english: string;
  arabic: string;
  modification: 'enabled' | 'disabled';
}

export interface SizeSummary {
  shirt: Record<string, number>;
  trousers: Record<string, number>;
  jacket: Record<string, number>;
}

export enum AppMode {
  STUDENT = 'student',
  ADMIN = 'admin'
}

export enum AdminTab {
  REQUESTS = 'requests',
  SUMMARY = 'summary',
  MESSAGE = 'message'
}
