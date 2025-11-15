<template>
  <div class="q-pa-md">
    <q-layout view="lHh Lpr lff" class="shadow-2 rounded-borders">
      <q-header elevated class="primary text-white">
        <q-toolbar>
          <q-toolbar-title>SIMAN</q-toolbar-title>
          <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="drawer"
        show-if-above
        :width="200"
        :breakpoint="400"
      >
        <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
          <q-list padding>
            <q-item clickable v-ripple :to="{name:'inicio'}">
              <q-item-section avatar>
                <q-icon name="inbox" />
              </q-item-section>
              <q-item-section>
                Inicio
              </q-item-section>
            </q-item>



            <q-item clickable v-ripple :to="{ name: 'facturas' }">
              <q-item-section avatar>
                <q-icon name="inbox" />
              </q-item-section>

              <q-item-section>
                Facturas
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{ name: 'cuentas' }">
              <q-item-section avatar>
                <q-icon name="star" />
              </q-item-section>

              <q-item-section>
                Agregar Cuentas
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{ name: 'asientos' }">
              <q-item-section avatar>
                <q-icon name="send" />
              </q-item-section>

              <q-item-section>
                Libro Diario
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{ name: 'mayor' }">
              <q-item-section avatar>
                <q-icon name="drafts" />
              </q-item-section>

              <q-item-section>
                Libro Mayor
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{ name: 'productos' }">
              <q-item-section avatar>
                <q-icon name="drafts" />
              </q-item-section>

              <q-item-section>
                Agregar Productos
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple :to="{ name: 'balance' }">
              <q-item-section avatar>
                <q-icon name="drafts" />
              </q-item-section>

              <q-item-section>
                Balanza de Comprobación
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <router-view />
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup () {
    return {
      drawer: ref(false)
    }
  }
}
</script>
