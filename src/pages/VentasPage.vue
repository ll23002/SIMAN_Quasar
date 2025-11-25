<template>
  <q-page class="ventas-page bg-dark-page q-pa-md">
    <div class="page-container">
      <div class="page-header q-mb-lg">
        <div class="text-h4 text-weight-bold text-white">
          <q-icon name="point_of_sale" size="md" color="cyan-4" class="q-mr-sm" />
          Nueva Venta
        </div>
        <div class="text-subtitle2 text-grey-5 q-mt-xs">
          <q-icon name="shopping_cart" size="xs" class="q-mr-xs" />
          Registra una nueva transacción de venta
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-lg-5">
          <q-card class="bg-dark-card text-white no-shadow q-mb-lg" bordered>
            <q-card-section class="q-pb-sm">
              <div class="text-h6 text-weight-medium">
                <q-icon name="person" color="cyan-4" class="q-mr-sm" />
                Información del Cliente
              </div>
              <div class="text-caption text-grey-5">Datos del comprador</div>
            </q-card-section>

            <q-separator class="q-my-sm" color="grey-8" />

            <q-card-section>
              <div class="q-mb-md">
                <q-input
                  dark
                  outlined
                  v-model="nombre"
                  label="Nombre Completo"
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" color="cyan-4" />
                  </template>
                </q-input>
              </div>

              <div class="q-mb-md">
                <q-input
                  dark
                  outlined
                  v-model="dui"
                  label="DUI"
                  mask="########-#"
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="credit_card" color="cyan-4" />
                  </template>
                </q-input>
              </div>

              <div>
                <q-input
                  dark
                  outlined
                  v-model="gmail"
                  label="Correo Electrónico"
                  @blur="gmail = (gmail && !gmail.endsWith('@gmail.com')) ? gmail.replace(/@.*$/, '') + '@gmail.com' : gmail"
                  type="email"
                  hint="usuario@gmail.com"
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="email" color="cyan-4" />
                  </template>
                </q-input>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="bg-dark-card text-white no-shadow q-mb-lg" bordered>
            <q-card-section class="q-pb-sm">
              <div class="text-h6 text-weight-medium">
                <q-icon name="inventory_2" color="cyan-4" class="q-mr-sm" />
                Agregar Productos
              </div>
              <div class="text-caption text-grey-5">Busca y agrega productos</div>
            </q-card-section>

            <q-separator class="q-my-sm" color="grey-8" />

            <q-card-section>
              <div class="q-mb-md">
                <q-select
                  dark
                  outlined
                  v-model="productoSeleccionado"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="300"
                  :options="opcionesFiltradas"
                  @filter="filterFn"
                  label="Buscar producto"
                  option-label="label"
                  option-value="id"
                  clearable
                  dense
                >
                  <template v-slot:prepend>
                    <q-icon name="search" color="cyan-4" />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey-5">
                        No hay resultados
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <q-btn
                label="Agregar Producto"
                @click="agregarProducto"
                color="cyan-4"
                icon="add_shopping_cart"
                :disable="!productoSeleccionado"
                unelevated
                class="full-width"
              />
            </q-card-section>
          </q-card>

          <q-card class="bg-dark-card text-white no-shadow" bordered>
            <q-card-section>
              <div class="text-subtitle2 text-grey-5 q-mb-md">
                <q-icon name="receipt" class="q-mr-xs" />
                Resumen de la Venta
              </div>

              <div class="row items-center justify-between q-mb-lg bg-dark-page q-pa-md rounded-borders">
                <div class="text-h6 text-grey-4">Total:</div>
                <div class="text-h4 text-weight-bold text-green-4">
                  {{ formatearDinero(totalVenta) }}
                </div>
              </div>

              <q-btn
                label="Registrar Venta"
                @click="enviarDatos"
                color="green-4"
                icon="send"
                :loading="enviando"
                :disable="filasVenta.length === 0"
                unelevated
                class="full-width"
                size="lg"
              >
                <q-tooltip v-if="filasVenta.length === 0">
                  Agrega productos para continuar
                </q-tooltip>
              </q-btn>

              <div class="text-caption text-center text-grey-5 q-mt-sm">
                <q-icon name="info" size="xs" />
                Se generará la factura automáticamente
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-7">
          <q-card class="bg-dark-card text-white no-shadow" bordered style="min-height: 600px;">
            <q-card-section class="q-pb-sm">
              <div class="row items-center justify-between">
                <div class="text-h6 text-weight-medium">
                  <q-icon name="list_alt" color="cyan-4" class="q-mr-sm" />
                  Productos en la Venta
                </div>
                <q-chip
                  v-if="filasVenta.length > 0"
                  dense
                  color="cyan-9"
                  text-color="cyan-2"
                  icon="shopping_bag"
                >
                  {{ filasVenta.length }} producto{{ filasVenta.length !== 1 ? 's' : '' }}
                </q-chip>
              </div>
            </q-card-section>

            <q-separator class="q-my-sm" color="grey-8" />

            <q-table
              flat
              :rows="filasVenta"
              :columns="columnas"
              row-key="name"
              :pagination="pagination"
              class="modern-table bg-transparent text-grey-4"
            >
              <template v-slot:header="props">
                <q-tr :props="props" class="bg-dark-page text-grey-5">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props" class="hoverable-row">
                  <q-td key="name" :props="props">
                    <div class="row items-center no-wrap">
                      <q-icon name="shopping_bag" color="cyan-4" size="sm" class="q-mr-sm" />
                      <span class="text-weight-medium text-white">{{ props.row.name }}</span>
                    </div>
                  </q-td>

                  <q-td key="precio" :props="props" class="text-right">
                    <span class="text-weight-medium text-grey-4 cursor-pointer">
                      {{ formatearDinero(props.row.precio) }}
                    </span>
                    <q-popup-edit v-model.number="props.row.precio" title="Editar Precio" buttons v-slot="scope">
                      <q-input type="number" v-model.number="scope.value" dense autofocus dark />
                    </q-popup-edit>
                    <q-tooltip>Click para editar</q-tooltip>
                  </q-td>

                  <q-td key="cantidad" :props="props" class="text-center">
                    <q-chip
                      dense
                      color="cyan-9"
                      text-color="cyan-2"
                      class="cursor-pointer"
                    >
                      {{ props.row.cantidad }}
                    </q-chip>
                    <q-popup-edit v-model.number="props.row.cantidad" title="Editar Cantidad" buttons v-slot="scope">
                      <q-input type="number" v-model.number="scope.value" dense autofocus dark />
                    </q-popup-edit>
                    <q-tooltip>Click para editar</q-tooltip>
                  </q-td>

                  <q-td key="subtotal" :props="props" class="text-right">
                    <span class="text-weight-bold text-green-4">
                      {{ formatearDinero(props.row.precio * props.row.cantidad) }}
                    </span>
                  </q-td>

                  <q-td key="acciones" :props="props" class="text-center">
                    <q-btn
                      icon="delete"
                      color="red-4"
                      flat
                      round
                      dense
                      @click="eliminarProducto(props.row)"
                    >
                      <q-tooltip>Eliminar producto</q-tooltip>
                    </q-btn>
                  </q-td>
                </q-tr>
              </template>

              <template v-slot:no-data>
                <div class="full-width row flex-center q-gutter-sm q-pa-xl">
                  <div class="column items-center">
                    <q-icon name="shopping_cart" size="4em" color="grey-7" class="q-mb-md" />
                    <span class="text-h6 text-grey-5 q-mb-xs">
                      No hay productos agregados
                    </span>
                    <span class="text-caption text-grey-6">
                      Usa el buscador de la izquierda para agregar productos
                    </span>
                  </div>
                </div>
              </template>
            </q-table>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const filasVenta = ref([])
const enviando = ref(false)
const productoSeleccionado = ref(null)
const opcionesFiltradas = ref([])
const gmail = ref(null)
const nombre = ref(null)
const dui = ref(null)


async function filterFn (val, update) {
  if (val === '') {
    update(() => {
      opcionesFiltradas.value = []
    })
    return
  }

  try {
    const response = await axios.get('http://localhost:8000/api/contabilidad/productos/obtener/', {
      params: {
        search: val
      }
    })

    update(() => {
      opcionesFiltradas.value = response.data
    })

  } catch (error) {
    console.error('Error buscando productos:', error)
    update(() => {
      opcionesFiltradas.value = []
    })
  }
}


const columnas = [
  { name: 'name', required: true, label: 'Producto', align: 'left', field: 'name', sortable: true },
  { name: 'precio', align: 'right', label: 'Precio $', field: 'precio', sortable: true },
  { name: 'cantidad', align: 'center', label: 'Cantidad', field: 'cantidad', sortable: true },
  { name: 'subtotal', align: 'right', label: 'Subtotal $', field: 'subtotal' }, // Columna calculada
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

const pagination = ref({
  rowsPerPage: 0
})

const totalVenta = computed(() => {
  return filasVenta.value.reduce((total, item) => {
    return total + (item.precio * item.cantidad)
  }, 0)
})


function agregarProducto () {
  if (!productoSeleccionado.value) {
    return
  }

  const producto = productoSeleccionado.value

  const productoExistente = filasVenta.value.find(item => item.name === producto.label)

  if (productoExistente) {
    productoExistente.cantidad++
  } else {
    filasVenta.value.push({
      producto_id: producto.id,
      name: producto.label,
      precio: parseFloat(producto.precio),
      cantidad: 1
    })
  }

  productoSeleccionado.value = null
}

function eliminarProducto (productoParaEliminar) {
  filasVenta.value = filasVenta.value.filter(
    item => item.name !== productoParaEliminar.name
  )
}

function formatearDinero(val) {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD'
  }).format(val || 0)
}

const enviarDatos = async () => {
  if (filasVenta.value.length === 0) {
    return
  }

  enviando.value = true
  try {
    const payload = {
      items: filasVenta.value,
      total: totalVenta.value,
      nombre: nombre.value,
      dui: dui.value,
      correo_electronico: gmail.value
    }

    const response = await axios.post(
      'http://localhost:8000/api/contabilidad/ventas/registrar/', payload)

    console.log('¡Venta registrada con éxito!', response.data)

    // Limpiar formulario
    filasVenta.value = []
    nombre.value = null
    dui.value = null
    gmail.value = null
    productoSeleccionado.value = null

  } catch (error) {
    console.error('Error al registrar la venta:', error.response?.data || error.message)
  } finally {
    enviando.value = false
  }
}

</script>

<style scoped lang="scss">
.ventas-page {
  min-height: 100vh;
}

.page-container {
  max-width: 1600px;
  margin: 0 auto;
}

.bg-dark-page {
  background-color: #0b1120;
}

.bg-dark-card {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.page-header {
  padding: 1rem 0;
}

.modern-table {
  .q-table__container {
    background-color: transparent !important;
  }

  thead tr {
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }

  tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
}

.hoverable-row {
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
}

q-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.q-field__control) {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
}

:deep(.q-field__native) {
  color: #fff;
}

:deep(.q-field__label) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.q-field__bottom) {
  color: rgba(255, 255, 255, 0.5);
}

.q-chip {
  font-size: 0.7rem;
  padding: 4px 8px;
}

.rounded-borders {
  border-radius: 8px;
}

@media (max-width: 1023px) {
  .page-container {
    max-width: 100%;
  }
}
</style>
