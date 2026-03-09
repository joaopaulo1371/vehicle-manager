import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { Vehicle, VehicleStatus } from 'src/types/vehicle';
import * as vehicleService from 'src/services/vehicle.service';

export const useVehiclesStore = defineStore('vehicles', () => {
  const vehicles = ref<Vehicle[]>([]);
  const loading = ref(false);
  const error = ref('');

  const search = ref('');
  const status = ref<VehicleStatus | ''>('');
  const sortBy = ref<'year' | 'value' | 'brand' | 'createdAt'>('createdAt');
  const sortOrder = ref<'asc' | 'desc'>('desc');
  const page = ref(1);
  const limit = ref(12);
  const total = ref(0);
  const totalPages = ref(1);

  const hasFilters = computed(() => !!search.value || !!status.value);

  async function fetchVehicles() {
    loading.value = true;
    error.value = '';
    try {
      const params: {
        search?: string;
        status?: VehicleStatus;
        sortBy: 'year' | 'value' | 'brand' | 'createdAt';
        sortOrder: 'asc' | 'desc';
        page: number;
        limit: number;
      } = {
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        page: page.value,
        limit: limit.value,
      };
      if (search.value) params.search = search.value;
      if (status.value) params.status = status.value;

      const { data } = await vehicleService.listVehicles({
        ...params,
      });
      vehicles.value = data.items;
      total.value = data.meta.total;
      totalPages.value = data.meta.totalPages;
    } catch (err) {
      console.error(err);
      error.value = 'Não foi possível carregar os veículos.';
    } finally {
      loading.value = false;
    }
  }

  function resetFilters() {
    search.value = '';
    status.value = '';
    sortBy.value = 'createdAt';
    sortOrder.value = 'desc';
    page.value = 1;
  }

  return {
    vehicles,
    loading,
    error,
    search,
    status,
    sortBy,
    sortOrder,
    page,
    limit,
    total,
    totalPages,
    hasFilters,
    fetchVehicles,
    resetFilters,
  };
});
