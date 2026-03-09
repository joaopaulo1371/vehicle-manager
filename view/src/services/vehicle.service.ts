import { api } from 'boot/axios';
import type { Vehicle, VehicleListResponse, VehicleStatus } from 'src/types/vehicle';

export interface VehicleListParams {
  search?: string;
  status?: VehicleStatus | '';
  sortBy?: 'year' | 'value' | 'brand' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export function listVehicles(params: VehicleListParams) {
  return api.get<VehicleListResponse>('/vehicles', { params });
}

export function getVehicle(id: string) {
  return api.get<Vehicle>(`/vehicles/${id}`);
}

export function createVehicle(formData: FormData) {
  return api.post<Vehicle>('/vehicles', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function updateVehicle(id: string, formData: FormData) {
  return api.patch<Vehicle>(`/vehicles/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function deleteVehicle(id: string) {
  return api.delete(`/vehicles/${id}`);
}
