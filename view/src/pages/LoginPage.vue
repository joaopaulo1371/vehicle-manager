<template>
  <div class="login-page flex flex-center">
    <q-card class="login-card q-pa-lg">
      <q-card-section>
        <div class="text-h5 text-weight-bold">Vehicle Manager</div>
        <div class="text-subtitle2 text-grey-7">Acesse sua conta para continuar</div>
      </q-card-section>

      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="onSubmit">
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
            label="Entrar"
            :loading="loading"
          />

          <div class="text-center">
            <q-btn
              flat
              no-caps
              color="secondary"
              label="Criar conta"
              @click="goRegister"
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

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

const emailRules = [
  (value: string) => !!value || 'E-mail é obrigatório',
  (value: string) => /.+@.+\..+/.test(value) || 'E-mail inválido',
];
const passwordRules = [(value: string) => !!value || 'Senha é obrigatória'];

async function onSubmit() {
  loading.value = true;
  error.value = '';
  try {
    await authStore.login(email.value, password.value);
    await router.push('/vehicles');
  } catch {
    error.value = 'Não foi possível autenticar. Verifique e-mail e senha.';
  } finally {
    loading.value = false;
  }
}

function goRegister() {
  void router.push('/register');
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
