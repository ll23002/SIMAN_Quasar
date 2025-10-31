<template>
  <q-page padding>
    <q-btn
      label="Enviar datos"
      @click="enviarDatos"
      color="primary"
    />
    <div class="q-pa-md">
      <q-table
        class="my-sticky-header-column-table"
        flat bordered
        title="Treats"
        dense
        :rows="rows"
        :columns="columns"
        row-key="codigo"
        hide-bottom
        v-model:pagination="pagination"
      >
        <template v-slot:body-cell-Descripcion="props">
        <q-td :props="props">
          <div class="desc-cell">{{ props.row.Descripcion }}</div>
        </q-td>
        </template>
      </q-table>
    </div>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
const columns = [
  { name: 'Nombre', required: true, label: 'NOMBRE', align: 'left', field: 'Nombre', sortable: true },
  { name: 'Codigo', align: 'center', label: 'CODIGO', field: 'Codigo', sortable: true },
  { name: 'Tipo', label: 'TIPO', field: 'Tipo', sortable: true },
  { name: 'Naturaleza', label: 'NATURALEZA', field: 'Naturaleza', sortable: true },
  { name: 'Movimientos', label: 'MOVIMIENTOS', field: 'Movimientos', sortable: true },
  { name: 'CuentaPadre', label: 'CUENTA PADRE', field: 'CuentaPadre', sortable: true },
  { name: 'Descripcion', label: 'DESCRIPCIÓN', field: 'Descripcion', align: 'left', sortable: true}
]

const rows = ref([
  { Nombre: 'Activo', Codigo: '1' , Tipo: 'ACTIVO', Naturaleza: 'D', Movimientos: 'NO', CuentaPadre: null,
    Descripcion: 'Representa todos los bienes y derechos propiedad de la empresa' },

  { Nombre: 'Activo Corriente', Codigo: '11', Tipo: 'ACTIVO', Naturaleza: 'D', Movimientos: 'NO', CuentaPadre: 1 ,
    Descripcion: 'Agrupa los activos que se espera convertir en efectivo o consumir en el ciclo normal de operaciones'},

  { Nombre: 'Efectivo y Equivalentes', Codigo: '1101', Tipo: 'ACTIVO', Naturaleza: 'D', Movimientos: 'NO', CuentaPadre: 11,
  Descripcion: 'Fondos disponibles de forma inmediata (caja, bancos, inversiones a corto plazo)'},

  { Nombre: 'Caja General', Codigo: '1101.01', Tipo: 'ACTIVO', Naturaleza: 'D', Movimientos: 'SI', CuentaPadre: 1101 ,
  Descripcion: 'Registra el dinero físico disponible en la oficina o punto de venta para gastos menores o ingresos del día'},

  { Nombre: 'Inventarios', Codigo: '1102', Tipo: 'ACTIVO', Naturaleza: 'D', Movimientos: 'NO', CuentaPadre: 11 ,
  Descripcion: 'Agrupa las mercancías o productos destinados a la venta.'},

  { Nombre: 'Inventario de Mercadería', Codigo: '1102.01', Tipo: 'ACTIVO', Naturaleza: 'D', Movimientos: 'SI', CuentaPadre: 1102,
  Descripcion: 'Registra el valor de las existencias de productos listos para la venta. Se carga al comprar y se abona al vender'},

  { Nombre: 'Activo No Corriente', Codigo: '12', Tipo: 'ACTIVO', Naturaleza: 'D', Movimientos: 'NO', CuentaPadre: 1,
  Descripcion: 'Agrupa activos a largo plazo, como propiedades, planta y equipo'},

  { Nombre: 'Pasivo', Codigo: '2', Tipo: 'PASIVO', Naturaleza: 'C', Movimientos: 'NO', CuentaPadre: null,
  Descripcion: 'Representa todas las deudas y obligaciones de la empresa'},

  { Nombre: 'Pasivo Corriente', Codigo: '21', Tipo: 'PASIVO', Naturaleza: 'C', Movimientos: 'NO', CuentaPadre: 2,
  Descripcion: 'Agrupa obligaciones que deben liquidarse en un plazo menor a un año'},

  { Nombre: 'Impuestos por Pagar', Codigo: '2101', Tipo: 'PASIVO', Naturaleza: 'C', Movimientos: 'NO', CuentaPadre: 21,
  Descripcion: 'Deudas generadas por impuestos retenidos o cobrados a terceros y aún no pagados al gobierno'},

  { Nombre: 'IVA Débito Fiscal', Codigo: '2101.01', Tipo: 'PASIVO', Naturaleza: 'C', Movimientos: 'SI', CuentaPadre: 2101,
  Descripcion: 'IVA que la empresa cobra a sus clientes por las ventas. Representa una obligación a pagar al fisco'},

  { Nombre: 'Patrimonio', Codigo: '3', Tipo: 'PATRIMONIO', Naturaleza: 'C', Movimientos: 'NO', CuentaPadre: null,
  Descripcion: 'Valor residual de los activos una vez deducidos todos sus pasivos (Capital social, Reservas, Resultados)'},

  { Nombre: 'Ingresos', Codigo: '4', Tipo: 'INGRESO', Naturaleza: 'C', Movimientos: 'NO', CuentaPadre: null,
  Descripcion: 'Representa incrementos en el patrimonio por ventas u otros servicios'},

  { Nombre: 'Ingresos Operativos', Codigo: '41', Tipo: 'INGRESO', Naturaleza: 'C', Movimientos: 'NO', CuentaPadre: 4,
  Descripcion: 'Ingresos provenientes de la actividad principal del negocio (la venta de mercadería)'},

  { Nombre: 'Ventas Gravadas', Codigo: '4101', Tipo: 'INGRESO', Naturaleza: 'C', Movimientos: 'SI', CuentaPadre: 41,
  Descripcion: 'Registra el valor, sin IVA, de todas las ventas de bienes sujetas al impuesto'},

  { Nombre: 'Costos', Codigo: '5', Tipo: 'COSTO', Naturaleza: 'D', Movimientos: 'NO', CuentaPadre: null,
  Descripcion: 'Representa el valor de los bienes o servicios que se han vendido'},

  { Nombre: 'Costo de Venta', Codigo: '51', Tipo: 'COSTO', Naturaleza: 'D', Movimientos: 'NO', CuentaPadre: 5,
  Descripcion: 'Agrupa los costos directamente relacionados con la generación de los ingresos (el costo de la mercadería vendida)'},

  { Nombre: 'Costo de Mercaderia', Codigo: '5101', Tipo: 'COSTO', Naturaleza: 'D', Movimientos: 'SI', CuentaPadre: 51,
  Descripcion: 'Se carga cada vez que se realiza una venta y se abona el Inventario de Mercadería'},

])

const pagination = ref({
  page: 1,
  rowsPerPage: rows.value.length
})

const enviarDatos = async () => {
  try {
    const cuentas = rows.value.map(r => ({
      nombre: r.Nombre,
      codigo: r.Codigo,
      tipo_cuenta: r.Tipo,
      naturaleza: r.Naturaleza,
      descripcion: r.Descripcion,
      permite_movimientos: r.Movimientos.toUpperCase() === 'SI',
      cuenta_padre_codigo: r.CuentaPadre,
    }));

    const response = await axios.post(
      'http://localhost:8000/api/contabilidad/cuentas/crear/',
      cuentas
    )

    console.log('¡Cuentas agregadas con éxito!', response.data)
    alert('¡Éxito! Revisa la BD y la consola.')
  } catch (error) {
    console.error('Error al agregar cuentas:', error.response.data)
    alert('Error. Revisa la consola para ver los detalles.')
  }
}

</script>

<style lang="sass">
.my-sticky-header-column-table
  /* height or max-height is important */
  height: 600px

  /* specifying max-width so the example can
    highlight the sticky column on any browser window */
  max-width: 1000px

  td:first-child
    /* bg color is important for td; just specify one */
    background-color: #00b4ff

  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background: #00b4ff

  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
    /* highest z-index */
    z-index: 3
  thead tr:first-child th
    top: 0
    z-index: 1
  tr:first-child th:first-child
    /* highest z-index */
    z-index: 3

  td:first-child
    z-index: 1

  td:first-child, th:first-child
    position: sticky
    left: 0

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px

.desc-cell
  max-width: 300px
  white-space: normal
  overflow-wrap: anywhere
  word-break: break-word
</style>

