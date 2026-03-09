<template>
  <q-card class="vehicle-card">
    <q-img
      :src="mainImage"
      :ratio="16 / 9"
      spinner-color="primary"
      loading="lazy"
      fit="cover"
    >
      <div class="absolute-top-right q-pa-sm">
        <q-badge :color="statusColor" text-color="white">
          {{ statusLabel }}
        </q-badge>
      </div>
    </q-img>

    <q-card-section>
      <div class="text-h6 text-weight-bold">{{ vehicle.brand }} {{ vehicle.model }}</div>
      <div class="text-caption text-grey-7">Ano {{ vehicle.year }} • {{ formattedPlate }}</div>
      <div class="text-subtitle1 text-weight-medium q-mt-sm">
        {{ formattedValue }}
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat color="primary" icon="visibility" label="Detalhes" @click="$emit('details')" />
      <q-btn flat color="secondary" icon="edit" label="Editar" @click="$emit('edit')" />
      <q-btn
        v-if="canDelete"
        flat
        color="negative"
        icon="delete"
        label="Excluir"
        @click="$emit('delete')"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Vehicle } from 'src/types/vehicle';

const props = withDefaults(
  defineProps<{
    vehicle: Vehicle;
    canDelete?: boolean;
  }>(),
  { canDelete: true },
);

defineEmits<{
  details: [];
  edit: [];
  delete: [];
}>();

const statusLabel = computed(() => {
  const map = {
    AVAILABLE: 'Disponível',
    SOLD: 'Vendido',
    RESERVED: 'Reservado',
  };
  return map[props.vehicle.status];
});

const statusColor = computed(() => {
  const map = {
    AVAILABLE: 'positive',
    SOLD: 'negative',
    RESERVED: 'warning',
  };
  return map[props.vehicle.status];
});

const formattedValue = computed(() =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(props.vehicle.value)),
);

const formattedPlate = computed(() => {
  const plate = props.vehicle.plate.toUpperCase();
  return `${plate.slice(0, 3)}-${plate.slice(3)}`;
});

const mainImage = computed(() => {
  const first = props.vehicle.photos?.[0]?.url;
  if (!first) return 'https://placehold.co/800x450?text=Sem+foto';
  if (first.startsWith('http')) return first;
  return `${import.meta.env.VITE_UPLOADS_URL ?? 'http://localhost:3000'}${first}`;
});
</script>

<style scoped>
.vehicle-card {
  border-radius: 14px;
}
</style>
