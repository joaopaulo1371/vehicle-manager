<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold">Vehicle Manager</q-toolbar-title>

        <q-btn-dropdown flat no-caps icon="account_circle" :label="authStore.user?.name ?? 'Conta'">
          <q-list style="min-width: 220px">
            <q-item>
              <q-item-section>
                <q-item-label>{{ authStore.user?.email }}</q-item-label>
                <q-item-label caption>{{ authStore.user?.role }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="handleLogout">
              <q-item-section avatar><q-icon name="logout" /></q-item-section>
              <q-item-section>Logout</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Navegação</q-item-label>
        <q-item clickable to="/vehicles" exact>
          <q-item-section avatar><q-icon name="view_module" /></q-item-section>
          <q-item-section>Veículos</q-item-section>
        </q-item>
        <q-item clickable to="/vehicles/new">
          <q-item-section avatar><q-icon name="add_circle" /></q-item-section>
          <q-item-section>Novo veículo</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';

const leftDrawerOpen = ref(false);
const router = useRouter();
const authStore = useAuthStore();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function handleLogout() {
  await authStore.logout();
  await router.push('/login');
}
</script>
