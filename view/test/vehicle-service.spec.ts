import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('boot/axios', () => ({
  api: apiMock,
}));

import {
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  updateVehicle,
} from 'src/services/vehicle.service';

describe('vehicle.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista veiculos com params', async () => {
    apiMock.get.mockResolvedValue({ data: { items: [], meta: {} } });

    await listVehicles({ search: 'toyota', page: 2, limit: 12 });

    expect(apiMock.get).toHaveBeenCalledWith('/vehicles', {
      params: { search: 'toyota', page: 2, limit: 12 },
    });
  });

  it('usa endpoint correto para create/update/delete', async () => {
    const form = new FormData();
    apiMock.post.mockResolvedValue({ data: {} });
    apiMock.patch.mockResolvedValue({ data: {} });
    apiMock.delete.mockResolvedValue({ data: {} });
    apiMock.get.mockResolvedValue({ data: {} });

    await createVehicle(form);
    await updateVehicle('v1', form);
    await deleteVehicle('v1');
    await getVehicle('v1');

    expect(apiMock.post).toHaveBeenCalledWith(
      '/vehicles',
      form,
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
    expect(apiMock.patch).toHaveBeenCalledWith(
      '/vehicles/v1',
      form,
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
    expect(apiMock.delete).toHaveBeenCalledWith('/vehicles/v1');
    expect(apiMock.get).toHaveBeenCalledWith('/vehicles/v1');
  });
});
