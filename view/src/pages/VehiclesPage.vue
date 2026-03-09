<template>
  <q-page padding>
    <div class="row items-center justify-between q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-8">
        <div class="text-h5 text-weight-bold">Catálogo de Veículos</div>
        <div class="text-grey-7">Gerencie o estoque com filtros e paginação</div>
      </div>
      <div class="col-12 col-md-auto">
        <q-btn color="primary" icon="add" label="Novo veículo" @click="goNew" />
      </div>
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-4">
          <q-input
            v-model="store.search"
            label="Buscar por marca/modelo"
            outlined
            clearable
            debounce="400"
            @update:model-value="onFilterChanged"
          />
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="store.status"
            label="Status"
            outlined
            emit-value
            map-options
            :options="statusOptions"
            @update:model-value="onFilterChanged"
          />
        </div>
        <div class="col-6 col-md-2">
          <q-select
            v-model="store.sortBy"
            label="Ordenar por"
            outlined
            emit-value
            map-options
            :options="sortByOptions"
            @update:model-value="onFilterChanged"
          />
        </div>
        <div class="col-6 col-md-2">
          <q-select
            v-model="store.sortOrder"
            label="Direção"
            outlined
            emit-value
            map-options
            :options="sortOrderOptions"
            @update:model-value="onFilterChanged"
          />
        </div>
        <div class="col-12 col-md-1">
          <q-btn
            flat
            color="secondary"
            icon="restart_alt"
            :disable="!store.hasFilters"
            @click="resetFilters"
          />
        </div>
      </q-card-section>
    </q-card>

    <div v-if="store.loading" class="row q-col-gutter-md">
      <div v-for="idx in 6" :key="idx" class="col-12 col-sm-6 col-lg-4">
        <q-card bordered>
          <q-skeleton height="180px" square />
          <q-card-section>
            <q-skeleton type="text" class="text-h6" />
            <q-skeleton type="text" />
            <q-skeleton type="text" width="40%" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-banner v-else-if="store.error" rounded class="bg-red-1 text-negative">
      {{ store.error }}
    </q-banner>

    <div v-else-if="store.vehicles.length === 0" class="empty-state q-pa-xl">
      <q-icon name="directions_car" size="56px" color="grey-6" />
      <div class="text-h6 q-mt-sm">Nenhum veículo encontrado</div>
      <div class="text-grey-7">
        Cadastre o primeiro veículo ou ajuste os filtros para tentar novamente.
      </div>
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="vehicle in store.vehicles" :key="vehicle.id" class="col-12 col-sm-6 col-lg-4">
        <VehicleCard
          :vehicle="vehicle"
          :can-delete="isAdmin"
          @details="goDetails(vehicle.id)"
          @edit="goEdit(vehicle.id)"
          @delete="confirmDelete(vehicle.id)"
        />
      </div>
    </div>

    <div class="row justify-center q-mt-lg">
      <q-pagination
        v-model="store.page"
        :max="store.totalPages"
        max-pages="8"
        direction-links
        boundary-links
        @update:model-value="store.fetchVehicles"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import VehicleCard from 'src/components/VehicleCard.vue';
import { useVehiclesStore } from 'src/stores/vehicles-store';
import { useAuthStore } from 'src/stores/auth-store';
import { deleteVehicle } from 'src/services/vehicle.service';

const $q = useQuasar();
const router = useRouter();
const store = useVehiclesStore();
const authStore = useAuthStore();

const isAdmin = computed(() => authStore.user?.role === 'ADMIN');

const statusOptions = [
  { label: 'Todos', value: '' },
  { label: 'Disponível', value: 'AVAILABLE' },
  { label: 'Vendido', value: 'SOLD' },
  { label: 'Reservado', value: 'RESERVED' },
];

const sortByOptions = [
  { label: 'Cadastro', value: 'createdAt' },
  { label: 'Ano', value: 'year' },
  { label: 'Valor', value: 'value' },
  { label: 'Marca', value: 'brand' },
];

const sortOrderOptions = [
  { label: 'Decrescente', value: 'desc' },
  { label: 'Crescente', value: 'asc' },
];

function onFilterChanged() {
  store.page = 1;
  void store.fetchVehicles();
}

function resetFilters() {
  store.resetFilters();
  void store.fetchVehicles();
}

function goNew() {
  void router.push('/vehicles/new');
}

function goDetails(id: string) {
  void router.push(`/vehicles/${id}`);
}

function goEdit(id: string) {
  void router.push(`/vehicles/${id}/edit`);
}

function confirmDelete(id: string) {
  $q.dialog({
    title: 'Excluir veículo',
    message: 'Tem certeza que deseja excluir este veículo?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await deleteVehicle(id);
        $q.notify({ type: 'positive', message: 'Veículo excluído com sucesso' });
        await store.fetchVehicles();
      } catch {
        $q.notify({ type: 'negative', message: 'Falha ao excluir veículo' });
      }
    })();
  });
}

onMounted(async () => {
  await store.fetchVehicles();
});
</script>

<style scoped>
.empty-state {
  border: 1px dashed #cfd8dc;
  border-radius: 14px;
  text-align: center;
}
</style>
