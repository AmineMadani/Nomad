export interface ApiSuccessResponse {
  message: string;
}

export interface ApiErrorResponse {
  timestamp: Date;
  status: number;
  error: string;
  message: string;
  path: string;
}
