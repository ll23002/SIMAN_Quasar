<template>
  <q-page padding>
    <div>
      <q-input
        filled
        v-model="nombre"
        label="Nombre"
        style="width: 300px; padding-bottom: 20px"
      />
    </div>
    <div>
      <q-input
        filled
        v-model="dui"
        label="DUI"
        mask="########-#"
        style="width: 300px; padding-bottom: 20px"
      />
    </div>
    <div>
      <q-input
        filled
        v-model="gmail"
        label="Correo Electrónico"
        @blur="gmail = (gmail && !gmail.endsWith('@gmail.com')) ? gmail.replace(/@.*$/, '') + '@gmail.com' : gmail"
        type="email"
        hint="usuario@gmail.com"
        style="width: 300px"
      />
    </div>
    <q-space/>
    <div class="row q-gutter-md q-mb-md q-mt-md">
      <q-select
        filled
        v-model="productoSeleccionado"
        use-input
        hide-selected
        fill-input
        input-debounce="300"
        :options="opcionesFiltradas"
        @filter="filterFn"
        label="Buscar producto"
        style="width: 300px"
        option-label="label"
        option-value="id"
        clearable
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No hay resultados
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <q-btn label="Agregar" @click="agregarProducto" color="primary" class="q-mt-md" />
    </div>

    <q-table
      flat bordered
      title="Productos en Venta"
      :rows="filasVenta"
      :columns="columnas"
      row-key="name"
      hide-bottom
      v-model:pagination="pagination"
    >
      <template v-slot:body-cell-precio="props">
        <q-td :props="props">
          ${{ props.row.precio.toFixed(2) }}
          <q-popup-edit v-model.number="props.row.precio" title="Editar Precio" buttons v-slot="scope">
            <q-input type="number" v-model.number="scope.value" dense autofocus />
          </q-popup-edit>
        </q-td>
      </template>

      <template v-slot:body-cell-cantidad="props">
        <q-td :props="props">
          {{ props.row.cantidad }}
          <q-popup-edit v-model.number="props.row.cantidad" title="Editar Cantidad" buttons v-slot="scope">
            <q-input type="number" v-model.number="scope.value" dense autofocus />
          </q-popup-edit>
        </q-td>
      </template>

      <template v-slot:body-cell-subtotal="props">
        <q-td :props="props">
          ${{ (props.row.precio * props.row.cantidad).toFixed(2) }}
        </q-td>
      </template>

      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn
            icon="delete"
            color="red"
            flat
            round
            dense
            @click="eliminarProducto(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <div class="row justify-end q-mt-md">
      <q-chip
        size="lg"
        color="primary"
        text-color="white"
        icon="paid"
      >
        <strong>Total: ${{ totalVenta.toFixed(2) }}</strong>
      </q-chip>
    </div>

    <div class="row justify-end q-mt-md">
      <q-btn
        label="Enviar Venta"
        @click="enviarDatos"
        color="positive"
        icon="send"
        :loading="enviando"
      />
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

const enviarDatos = async () => {
  if (filasVenta.value.length === 0) {
    alert('No hay productos en la venta.')
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
    alert('¡Éxito! Venta registrada.')
    filasVenta.value = []

  } catch (error) {
    console.error('Error al registrar la venta:', error.response?.data || error.message)
    alert('Error. Revisa la consola para ver los detalles.')
  } finally {
    enviando.value = false
  }
}

</script>
