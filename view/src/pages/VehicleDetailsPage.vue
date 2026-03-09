<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">Detalhes do veículo</div>
        <div class="text-grey-7">Visualização completa e galeria de fotos</div>
      </div>
      <div class="q-gutter-sm">
        <q-btn flat color="secondary" icon="arrow_back" label="Voltar" @click="goBack" />
        <q-btn color="primary" icon="edit" label="Editar" @click="goEdit" />
      </div>
    </div>

    <div v-if="loading" class="row q-col-gutter-md">
      <div class="col-12 col-md-7"><q-skeleton height="420px" /></div>
      <div class="col-12 col-md-5"><q-skeleton height="420px" /></div>
    </div>

    <q-banner v-else-if="error" rounded class="bg-red-1 text-negative">{{ error }}</q-banner>

    <div v-else-if="vehicle" class="row q-col-gutter-lg">
      <div class="col-12 col-md-7">
        <q-card bordered flat>
          <q-carousel
            v-model="slide"
            swipeable
            animated
            arrows
            thumbnails
            infinite
            height="420px"
          >
            <q-carousel-slide
              v-for="(photo, index) in resolvedPhotos"
              :key="photo.id"
              :name="index"
              :img-src="photo.url"
              @click="showImage(photo.url)"
            />
          </q-carousel>

          <q-card-section v-if="resolvedPhotos.length === 0" class="text-center q-pa-xl">
            <q-icon name="image_not_supported" size="56px" color="grey-6" />
            <div class="q-mt-sm text-grey-7">Este veículo ainda não possui fotos.</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card bordered flat>
          <q-card-section>
            <div class="text-h6 text-weight-bold">{{ vehicle.brand }} {{ vehicle.model }}</div>
            <div class="text-subtitle2 text-grey-7">Placa {{ formattedPlate }}</div>
          </q-card-section>
          <q-separator />
          <q-list dense>
            <q-item><q-item-section>Ano</q-item-section><q-item-section side>{{ vehicle.year }}</q-item-section></q-item>
            <q-item><q-item-section>Cor</q-item-section><q-item-section side>{{ vehicle.color }}</q-item-section></q-item>
            <q-item><q-item-section>Tipo</q-item-section><q-item-section side>{{ typeLabel }}</q-item-section></q-item>
            <q-item><q-item-section>Status</q-item-section><q-item-section side><q-badge :color="statusColor">{{ statusLabel }}</q-badge></q-item-section></q-item>
            <q-item><q-item-section>Valor</q-item-section><q-item-section side class="text-weight-bold">{{ formattedValue }}</q-item-section></q-item>
          </q-list>
          <q-card-section v-if="vehicle.description">
            <div class="text-subtitle2 text-weight-medium q-mb-xs">Descrição</div>
            <div class="text-body2">{{ vehicle.description }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="imageDialog">
      <q-card style="max-width: 90vw; width: 960px">
        <q-img :src="dialogImage" fit="contain" style="height: 80vh" />
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getVehicle } from 'src/services/vehicle.service';
import type { Vehicle } from 'src/types/vehicle';

const route = useRoute();
const router = useRouter();
const vehicle = ref<Vehicle | null>(null);
const loading = ref(false);
const error = ref('');
const slide = ref(0);
const imageDialog = ref(false);
const dialogImage = ref('');

const resolvedPhotos = computed(() =>
  (vehicle.value?.photos ?? []).map((photo) => ({
    ...photo,
    url: photo.url.startsWith('http')
      ? photo.url
      : `${import.meta.env.VITE_UPLOADS_URL ?? 'http://localhost:3000'}${photo.url}`,
  })),
);

const formattedValue = computed(() =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(vehicle.value?.value ?? 0),
  ),
);

const formattedPlate = computed(() => {
  const raw = vehicle.value?.plate ?? '';
  return raw.length === 7 ? `${raw.slice(0, 3)}-${raw.slice(3)}` : raw;
});

const statusLabel = computed(() => {
  const map = { AVAILABLE: 'Disponível', SOLD: 'Vendido', RESERVED: 'Reservado' };
  return map[vehicle.value?.status ?? 'AVAILABLE'];
});

const statusColor = computed(() => {
  const map = { AVAILABLE: 'positive', SOLD: 'negative', RESERVED: 'warning' };
  return map[vehicle.value?.status ?? 'AVAILABLE'];
});

const typeLabel = computed(() => {
  const map = { CAR: 'Carro', MOTORCYCLE: 'Moto', TRUCK: 'Caminhão' };
  return map[vehicle.value?.type ?? 'CAR'];
});

async function loadVehicle() {
  if (typeof route.params.id !== 'string') return;
  loading.value = true;
  error.value = '';
  try {
    const { data } = await getVehicle(route.params.id);
    vehicle.value = data;
  } catch {
    error.value = 'Falha ao carregar os detalhes do veículo.';
  } finally {
    loading.value = false;
  }
}

function showImage(url: string) {
  dialogImage.value = url;
  imageDialog.value = true;
}

function goBack() {
  void router.push('/vehicles');
}

function goEdit() {
  if (!vehicle.value) return;
  void router.push(`/vehicles/${vehicle.value.id}/edit`);
}

onMounted(loadVehicle);
</script>
