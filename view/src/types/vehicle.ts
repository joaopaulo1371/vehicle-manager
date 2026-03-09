export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'TRUCK';
export type VehicleStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED';

export interface VehiclePhoto {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  value: number | string;
  type: VehicleType;
  status: VehicleStatus;
  description?: string;
  photos: VehiclePhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface VehicleListResponse {
  items: Vehicle[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
