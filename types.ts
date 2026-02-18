
export type UniformSize = 'S' | 'M' | 'L' | 'XL' | '2XL';

export interface StudentInfo {
  studentId: string;
  englishName: string;
  arabicName: string;
  grade: string;
  className: string;
  existingShirt?: string;
  existingTrousers?: string;
  existingJacket?: string;
  status?: string;
}

export interface UniformRequest {
  shirt: UniformSize | '';
  trousers: UniformSize | '';
  jacket: UniformSize | '';
  notes: string;
}

export interface AdminRequestRow extends StudentInfo {
  row: number;
  shirt: UniformSize;
  trousers: UniformSize;
  jacket: UniformSize;
  notes: string;
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
