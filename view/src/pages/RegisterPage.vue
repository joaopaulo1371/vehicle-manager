<template>
  <div class="login-page flex flex-center">
    <q-card class="login-card q-pa-lg">
      <q-card-section>
        <div class="text-h5 text-weight-bold">Criar conta</div>
        <div class="text-subtitle2 text-grey-7">
          Informe nome, e-mail e senha para acessar o sistema
        </div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="onSubmit">
          <q-input
            v-model="name"
            outlined
            label="Nome"
            :rules="nameRules"
            lazy-rules
          />
          <q-input
            v-model="email"
            outlined
            type="email"
            label="E-mail"
            :rules="emailRules"
            lazy-rules
          />
          <q-input
            v-model="password"
            outlined
            :type="showPassword ? 'text' : 'password'"
            label="Senha"
            :rules="passwordRules"
            lazy-rules
          >
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-banner v-if="error" rounded class="bg-red-1 text-negative">
            {{ error }}
          </q-banner>

          <q-btn
            type="submit"
            color="primary"
            class="full-width"
            label="Criar conta"
            :loading="loading"
          />

          <div class="text-center">
            <q-btn
              flat
              no-caps
              color="secondary"
              label="Já tenho conta"
              @click="goLogin"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

const nameRules = [(value: string) => !!value || 'Nome e obrigatorio'];
const emailRules = [
  (value: string) => !!value || 'E-mail e obrigatorio',
  (value: string) => /.+@.+\..+/.test(value) || 'E-mail invalido',
];
const passwordRules = [
  (value: string) => !!value || 'Senha e obrigatoria',
  (value: string) => value.length >= 6 || 'Senha deve ter pelo menos 6 caracteres',
];

async function onSubmit() {
  loading.value = true;
  error.value = '';
  try {
    await authStore.register(name.value, email.value, password.value);
    await router.push('/vehicles');
  } catch {
    error.value = 'Nao foi possivel criar a conta. Verifique os dados.';
  } finally {
    loading.value = false;
  }
}

function goLogin() {
  void router.push('/login');
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  padding: 16px;
  background: linear-gradient(150deg, #e7f0ff 0%, #f7fbff 40%, #fff6ec 100%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
}
</style>
