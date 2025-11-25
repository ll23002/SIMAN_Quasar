<template>
  <q-layout view="lHh Lpr lff" class="bg-dark-page text-white">
    <q-header class="bg-transparent text-white q-py-sm" height-hint="58">
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-toolbar-title class="text-weight-bold">SIMAN Dashboard</q-toolbar-title>
        <q-space />
        <q-btn round flat icon="notifications" class="q-mr-sm" />
        <q-avatar size="36px">
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
        </q-avatar>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :width="240"
      class="bg-dark text-white"
      bordered
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md flex flex-center">
          <q-icon name="analytics" size="40px" color="primary" />
          <span class="text-h6 q-ml-sm">SIMAN</span>
        </div>

        <q-list padding class="text-grey-4">
          <q-item-label header class="text-grey-6 text-uppercase text-weight-bold">Menu</q-item-label>

          <q-item clickable v-ripple to="/" active-class="text-primary bg-blue-10">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ name: 'ventas'}">
            <q-item-section avatar>
              <q-icon name="shopping_cart" />
            </q-item-section>
            <q-item-section>Ventas</q-item-section>

          </q-item>

          <q-item clickable v-ripple :to="{ name: 'facturas' }">
            <q-item-section avatar>
              <q-icon name="receipt_long" />
            </q-item-section>
            <q-item-section>Facturación Digital</q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ name: 'ventas_diarias' }">
            <q-item-section avatar>
              <q-icon name="shopping_basket" />
            </q-item-section>
            <q-item-section>Ventas Diarias</q-item-section>
          </q-item>


          <q-item clickable v-ripple :to="{ name: 'cuentas' }">
            <q-item-section avatar>
              <q-icon name="account_balance" />
            </q-item-section>
            <q-item-section>Catálogo de Cuentas</q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ name: 'asientos' }">
            <q-item-section avatar>
              <q-icon name="book" />
            </q-item-section>
            <q-item-section>Partidas de Diario</q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ name: 'mayor' }">
            <q-item-section avatar>
              <q-icon name="library_books" />
            </q-item-section>
            <q-item-section>Mayorización</q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ name: 'balance' }">
            <q-item-section avatar>
              <q-icon name="balance" />
            </q-item-section>
            <q-item-section>Balanza Comp.</q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ name: 'balance_general' }">
            <q-item-section avatar>
              <q-icon name="assessment" />
            </q-item-section>

            <q-item-section>
              Balance General
            </q-item-section>
          </q-item>


          <q-item clickable v-ripple :to="{ name: 'perdidas_ganancias' }">
            <q-item-section avatar>
              <q-icon name="library_books" />
            </q-item-section>
  
            <q-item-section>
              Perdidas y Ganancias
            </q-item-section>
          </q-item>

        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
const drawer = ref(false)
</script>


