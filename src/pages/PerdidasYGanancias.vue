<template>
  <q-page padding>
    <div class="q-pa-md">

      <!-- FILTRO DE FECHAS -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-4">
          <q-input filled v-model="fechaInicio" label="Fecha Inicio" mask="####-##-##">
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="fechaInicio" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-4">
          <q-input filled v-model="fechaFin" label="Fecha Fin" mask="####-##-##">
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="fechaFin" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-12 col-md-4 flex flex-center">
          <q-btn color="primary" label="Filtrar" @click="fetchEstadoResultados" />
        </div>
      </div>


      <!-- RESUMEN EN TARJETAS -->
      <div class="row q-col-gutter-md q-mb-lg">

        <div class="col-12 col-md-3">
          <q-card bordered>
            <q-card-section class="text-center">
              <div class="text-h6 text-primary">Ingresos</div>
              <div class="text-h5">{{ formatCurrency(data.ingresos_operativos) }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card bordered>
            <q-card-section class="text-center">
              <div class="text-h6 text-negative">Costos</div>
              <div class="text-h5">{{ formatCurrency(data.costos_operativos) }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card bordered>
            <q-card-section class="text-center">
              <div class="text-h6 text-negative">Gastos</div>
              <div class="text-h5">{{ formatCurrency(data.gastos_operativos) }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-3">
          <q-card bordered>
            <q-card-section class="text-center">
              <div class="text-h6 text-positive">Utilidad Neta</div>
              <div
                :class="['text-h5', data.utilidad_neta >= 0 ? 'text-positive' : 'text-negative']"
              >
                {{ formatCurrency(data.utilidad_neta) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>


      <!-- TABLA DE DETALLE -->
      <q-table
        title="Estado de Resultados"
        :rows="rows"
        :columns="columns"
        row-key="label"
        dense
        flat
        bordered
        hide-bottom
        :rows-per-page-options="[0]"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const data = ref({
  ingresos_operativos: 0,
  costos_operativos: 0,
  gastos_operativos: 0,
  utilidad_bruta: 0,
  utilidad_operativa: 0,
  otros_ingresos: 0,
  otros_gastos: 0,
  utilidad_neta: 0
});

const rows = ref([]);

const fechaInicio = ref(null);
const fechaFin = ref(null);

const columns = [
  { name: "label", label: "Cuenta", field: "label", align: "left" },
  { name: "valor", label: "Monto", field: "valor", align: "right",
    format: (val) => formatCurrency(val)
  }
];

const formatCurrency = (value) => {
  if (!value) return "$0.00";
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

const fetchEstadoResultados = async () => {
  try {
    let url = "http://localhost:8000/api/contabilidad/estado_resultados/";

    const params = [];
    if (fechaInicio.value) params.push(`fecha_inicio=${fechaInicio.value}`);
    if (fechaFin.value) params.push(`fecha_fin=${fechaFin.value}`);

    if (params.length > 0) url += "?" + params.join("&");

    const response = await axios.get(url);
    data.value = response.data;

    rows.value = [
      { label: "Ingresos Operativos", valor: data.value.ingresos_operativos },
      { label: "Costos Operativos", valor: data.value.costos_operativos },
      { label: "Gastos Operativos", valor: data.value.gastos_operativos },
      { label: "Utilidad Bruta", valor: data.value.utilidad_bruta },
      { label: "Utilidad Operativa", valor: data.value.utilidad_operativa },
      { label: "Otros Ingresos", valor: data.value.otros_ingresos },
      { label: "Otros Gastos", valor: data.value.otros_gastos },
      { label: "UTILIDAD NETA", valor: data.value.utilidad_neta },
    ];

  } catch (error) {
    console.error("Error cargando estado de resultados:", error);
  }
};

onMounted(() => {
  fetchEstadoResultados();
});
</script>
