<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">
          {{ isEdit ? 'Editar veículo' : 'Novo veículo' }}
        </div>
        <div class="text-grey-7">
          {{ isEdit ? 'Atualize os dados e fotos do veículo' : 'Cadastre um veículo no estoque' }}
        </div>
      </div>
      <q-btn flat color="secondary" icon="arrow_back" label="Voltar" @click="goBack" />
    </div>

    <q-form class="q-gutter-md" @submit.prevent="submitForm">
      <q-card flat bordered>
        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input v-model="form.brand" outlined label="Marca" :rules="[required]" />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="form.model" outlined label="Modelo" :rules="[required]" />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model.number="form.year" outlined type="number" label="Ano" :rules="[required]" />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="form.plate" outlined label="Placa" mask="AAA-#X##" :rules="[required]" />
          </div>
          <div class="col-12 col-md-3">
            <q-input v-model="form.color" outlined label="Cor" :rules="[required]" />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="formattedValue"
              outlined
              label="Valor"
              prefix="R$"
              :rules="[required]"
              @update:model-value="onValueInput"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="form.type"
              outlined
              label="Tipo"
              emit-value
              map-options
              :options="typeOptions"
              :rules="[required]"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="form.status"
              outlined
              label="Status"
              emit-value
              map-options
              :options="statusOptions"
              :rules="[required]"
            />
          </div>
          <div class="col-12">
            <q-input v-model="form.description" outlined type="textarea" label="Descrição" autogrow />
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered>
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-sm">Fotos</div>
          <q-file
            v-model="newPhotos"
            outlined
            label="Adicionar fotos (JPG, PNG, WEBP até 5MB)"
            multiple
            use-chips
            accept=".jpg,.jpeg,.png,.webp"
            @rejected="notifyRejected"
            :max-file-size="5 * 1024 * 1024"
            :max-files="8"
          />

          <div v-if="existingPhotos.length || previews.length" class="row q-col-gutter-md q-mt-md">
            <div v-for="photo in existingPhotos" :key="photo.id" class="col-6 col-md-3">
              <q-card bordered flat>
                <q-img :src="resolveImage(photo.url)" :ratio="16 / 10" />
                <q-card-actions align="right">
                  <q-btn
                    flat
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="removeExistingPhoto(photo.id)"
                  />
                </q-card-actions>
              </q-card>
            </div>
            <div v-for="preview in previews" :key="preview.name" class="col-6 col-md-3">
              <q-card bordered flat>
                <q-img :src="preview.url" :ratio="16 / 10" />
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-banner v-if="error" rounded class="bg-red-1 text-negative">{{ error }}</q-banner>

      <div class="row justify-end q-gutter-sm">
        <q-btn flat color="secondary" label="Cancelar" @click="goBack" />
        <q-btn type="submit" color="primary" :label="isEdit ? 'Salvar alterações' : 'Cadastrar'" :loading="saving" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { createVehicle, getVehicle, updateVehicle } from 'src/services/vehicle.service';
import type { VehiclePhoto } from 'src/types/vehicle';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const isEdit = computed(() => !!route.params.id);
const saving = ref(false);
const error = ref('');
const newPhotos = ref<File[] | null>(null);
const previews = ref<{ name: string; url: string }[]>([]);
const existingPhotos = ref<VehiclePhoto[]>([]);
const removedPhotoIds = ref<string[]>([]);

const form = ref({
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  plate: '',
  color: '',
  value: 0,
  type: 'CAR',
  status: 'AVAILABLE',
  description: '',
});

const formattedValue = ref('');

const typeOptions = [
  { label: 'Carro', value: 'CAR' },
  { label: 'Moto', value: 'MOTORCYCLE' },
  { label: 'Caminhão', value: 'TRUCK' },
];
const statusOptions = [
  { label: 'Disponível', value: 'AVAILABLE' },
  { label: 'Vendido', value: 'SOLD' },
  { label: 'Reservado', value: 'RESERVED' },
];

const required = (value: unknown) => !!value || 'Campo obrigatório';

watch(newPhotos, (files) => {
  previews.value = (files ?? []).map((file) => ({
    name: file.name,
    url: URL.createObjectURL(file),
  }));
});

function onValueInput(value: string | number | null) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) {
    formattedValue.value = '';
    form.value.value = 0;
    return;
  }

  const amount = Number(digits) / 100;
  form.value.value = amount;
  formattedValue.value = formatMoney(amount);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function resolveImage(url: string) {
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_UPLOADS_URL ?? 'http://localhost:3000'}${url}`;
}

function removeExistingPhoto(id: string) {
  removedPhotoIds.value.push(id);
  existingPhotos.value = existingPhotos.value.filter((photo) => photo.id !== id);
}

function notifyRejected() {
  $q.notify({
    type: 'negative',
    message: 'Arquivo inválido. Envie JPG, PNG ou WEBP até 5MB.',
  });
}

async function loadVehicle() {
  if (!isEdit.value || typeof route.params.id !== 'string') return;
  const { data } = await getVehicle(route.params.id);
  form.value = {
    brand: data.brand,
    model: data.model,
    year: data.year,
    plate: `${data.plate.slice(0, 3)}-${data.plate.slice(3)}`,
    color: data.color,
    value: Number(data.value),
    type: data.type,
    status: data.status,
    description: data.description ?? '',
  };
  existingPhotos.value = data.photos;
  formattedValue.value = formatMoney(Number(data.value));
}

function buildPayload() {
  const payload = new FormData();
  payload.append('brand', form.value.brand);
  payload.append('model', form.value.model);
  payload.append('year', String(form.value.year));
  payload.append('plate', form.value.plate);
  payload.append('color', form.value.color);
  payload.append('value', String(form.value.value));
  payload.append('type', form.value.type);
  payload.append('status', form.value.status);
  payload.append('description', form.value.description);
  removedPhotoIds.value.forEach((id) => payload.append('removedPhotoIds', id));
  (newPhotos.value ?? []).forEach((file) => payload.append('photos', file));
  return payload;
}

async function submitForm() {
  saving.value = true;
  error.value = '';
  const payload = buildPayload();

  try {
    if (isEdit.value && typeof route.params.id === 'string') {
      await updateVehicle(route.params.id, payload);
      $q.notify({ type: 'positive', message: 'Veiculo atualizado com sucesso' });
    } else {
      await createVehicle(payload);
      $q.notify({ type: 'positive', message: 'Veiculo cadastrado com sucesso' });
    }
  } catch (err) {
    console.error('Erro ao salvar veiculo:', err);
    error.value =
      'Nao foi possivel salvar o veiculo. Verifique os dados e tente novamente.';
    saving.value = false;
    return;
  }

  try {
    await router.push('/vehicles');
  } catch (err) {
    console.error('Erro ao navegar para listagem:', err);
    error.value =
      'Veiculo salvo, mas nao foi possivel redirecionar automaticamente.';
  } finally {
    saving.value = false;
  }
}

function goBack() {
  void router.push('/vehicles');
}

onMounted(async () => {
  if (!formattedValue.value) {
    formattedValue.value = formatMoney(form.value.value);
  }
  await loadVehicle();
});
</script>

