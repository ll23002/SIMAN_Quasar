<template>
  <q-page class="q-pa-md bg-dark-page">
    <div class="row items-center q-mb-lg">
      <div class="text-h5 text-white text-weight-bold">Gestión de Cuentas Contables</div>
    </div>

    <div class="row justify-center">
      <div class="col-12 col-lg-10">
        <q-card class="bg-dark-page text-white no-shadow" bordered>
          <q-card-section class="q-pb-sm">
            <div class="row items-center">
              <q-icon name="account_balance" size="sm" class="q-mr-sm text-cyan-4" />
              <div class="text-h6">Crear Nueva Cuenta</div>
            </div>
            <div class="text-caption text-grey-5 q-mt-xs">Agrega una nueva rama al árbol contable</div>
          </q-card-section>

          <q-separator dark class="q-my-md" />

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="q-mb-md">
                  <label class="text-grey-5 text-caption text-uppercase q-mb-xs block">Cuenta Padre *</label>
                  <q-input
                    dark
                    outlined
                    v-model="parentNameDisplay"
                    readonly
                    placeholder="Seleccione una cuenta padre..."
                    @click="showTreeDialog = true"
                    class="cursor-pointer modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="account_tree" color="cyan-4" />
                    </template>
                    <template v-slot:append>
                      <q-icon name="arrow_drop_down" class="cursor-pointer" @click="showTreeDialog = true" />
                    </template>
                  </q-input>
                  <div class="text-xs text-red-4 q-mt-xs" v-if="!CuentaPadre">
                    <q-icon name="warning" size="xs" class="q-mr-xs" />
                    Debes seleccionar una rama base
                  </div>
                </div>

                <div class="q-mb-md">
                  <label class="text-grey-5 text-caption text-uppercase q-mb-xs block">Código Contable *</label>
                  <q-input
                    dark
                    outlined
                    type="text"
                    v-model="CodigoSufijo"
                    :prefix="codigoPrefijo"
                    placeholder="01"
                    :disable="!CuentaPadre"
                    hint="Ingresa solo los últimos dígitos"
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="tag" color="cyan-4" />
                    </template>
                  </q-input>
                </div>

                <div class="q-mb-md">
                  <label class="text-grey-5 text-caption text-uppercase q-mb-xs block">Nombre de la Cuenta *</label>
                  <q-input
                    dark
                    outlined
                    type="text"
                    v-model="Nombre"
                    placeholder="Ej: Banco Agrícola"
                    class="modern-input"
                    :rules="[val => !!val || 'El nombre es requerido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="edit" color="cyan-4" />
                    </template>
                  </q-input>
                </div>

                <div class="q-mb-md">
                  <label class="text-grey-5 text-caption text-uppercase q-mb-xs block">Descripción</label>
                  <q-input
                    dark
                    outlined
                    type="textarea"
                    v-model="Descripcion"
                    rows="3"
                    placeholder="Detalles adicionales sobre esta cuenta..."
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="description" color="cyan-4" style="align-self: flex-start; margin-top: 8px;" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <q-card flat bordered class="bg-dark-page q-mb-md" style="border: 1px solid rgba(34, 211, 238, 0.2);">
                  <q-card-section class="q-pa-md">
                    <div class="text-caption text-cyan-4 text-uppercase text-weight-bold q-mb-md">
                      <q-icon name="info" size="xs" class="q-mr-xs" />
                      Propiedades Heredadas
                    </div>

                    <div class="q-mb-sm">
                      <div class="text-caption text-grey-5">Tipo de Cuenta</div>
                      <div class="text-body1 text-white q-mt-xs">
                        <q-chip
                          dense
                          :color="Tipo ? 'blue-9' : 'grey-8'"
                          :text-color="Tipo ? 'blue-2' : 'grey-4'"
                          icon="category"
                          class="q-px-sm"
                        >
                          {{ Tipo || 'No seleccionado' }}
                        </q-chip>
                      </div>
                    </div>

                    <div class="q-mb-sm">
                      <div class="text-caption text-grey-5">Naturaleza</div>
                      <div class="text-body1 text-white q-mt-xs">
                        <q-chip
                          dense
                          :color="Naturaleza === 'D' ? 'green-9' : Naturaleza === 'C' ? 'purple-9' : 'grey-8'"
                          :text-color="Naturaleza === 'D' ? 'green-2' : Naturaleza === 'C' ? 'purple-2' : 'grey-4'"
                          :icon="Naturaleza === 'D' ? 'add_circle' : Naturaleza === 'C' ? 'remove_circle' : 'help'"
                          class="q-px-sm"
                        >
                          {{ NaturalezaDisplay || 'No seleccionado' }}
                        </q-chip>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <div class="q-mb-md">
                  <label class="text-grey-5 text-caption text-uppercase q-mb-xs block">¿Acepta Movimientos? *</label>
                  <q-select
                    dark
                    outlined
                    v-model="Movimientos"
                    :options="opcionesMovimiento"
                    option-value="val"
                    option-label="label"
                    emit-value
                    map-options
                    class="modern-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="swap_horiz" color="cyan-4" />
                    </template>
                    <template v-slot:selected>
                      <div class="row items-center">
                        <q-icon
                          :name="Movimientos ? 'check_circle' : 'folder'"
                          :color="Movimientos ? 'green-4' : 'orange-4'"
                          size="xs"
                          class="q-mr-sm"
                        />
                        <span>{{ Movimientos ? 'SÍ (Cuenta Transaccional)' : 'NO (Carpeta/Contenedor)' }}</span>
                      </div>
                    </template>
                  </q-select>
                </div>

                <q-card flat bordered class="bg-dark-page" style="border: 1px solid rgba(34, 211, 238, 0.2);">
                  <q-card-section class="q-pa-md">
                    <div class="text-caption text-cyan-4 text-uppercase text-weight-bold q-mb-sm">
                      <q-icon name="visibility" size="xs" class="q-mr-xs" />
                      Vista Previa
                    </div>
                    <div class="text-caption text-grey-5 q-mb-xs">Código Final</div>
                    <div class="text-h6 text-cyan-3 text-weight-bold">
                      {{ CodigoFinal || '---' }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>

          <q-separator dark class="q-my-md" />

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn
              outline
              color="grey-5"
              label="Limpiar"
              icon="clear"
              @click="limpiarFormulario"
              class="no-shadow"
            />
            <q-btn
              unelevated
              color="cyan-5"
              label="Guardar Cuenta"
              icon="save"
              @click="enviarDatos"
              :disable="!esFormularioValido"
              class="no-shadow text-weight-bold"
              :class="{ 'pulse-animation': esFormularioValido }"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="showTreeDialog" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-dark-card text-white tree-dialog-card">
        <q-card-section class="row items-center q-pb-none bg-gradient-header">
          <q-avatar color="cyan-9" text-color="cyan-2" icon="account_tree" size="md" class="q-mr-md" />
          <div>
            <div class="text-h6 text-weight-bold">Seleccionar Cuenta Padre</div>
            <div class="text-caption text-grey-4">Elige la cuenta base para tu nueva cuenta</div>
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="grey-5" size="md">
            <q-tooltip>Cerrar</q-tooltip>
          </q-btn>
        </q-card-section>

        <q-separator dark class="q-my-sm" />

        <q-card-section class="q-pb-none">
          <q-input
            dark
            outlined
            dense
            v-model="filterTree"
            placeholder="🔍 Buscar por código o nombre de cuenta..."
            class="search-input-large modern-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="cyan-4" size="sm" />
            </template>
            <template v-slot:append v-if="filterTree">
              <q-btn
                icon="close"
                flat
                round
                dense
                @click="filterTree = ''"
                color="grey-5"
                size="sm"
              >
                <q-tooltip>Limpiar búsqueda</q-tooltip>
              </q-btn>
            </template>
          </q-input>

          <div class="text-caption text-grey-5 q-mt-sm q-mb-md" v-if="filterTree">
            <q-icon name="filter_alt" size="xs" class="q-mr-xs" />
            Filtrando resultados...
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="tree-container-improved">
            <q-scroll-area class="tree-scroll-area">
              <q-tree
                :nodes="treeData"
                node-key="id"
                label-key="label"
                :filter="filterTree"
                default-expand-all
                v-model:selected="selectedNodeKey"
                selected-color="cyan-4"
                @update:selected="onNodeSelected"
                dark
                class="modern-tree-improved"
              >
                <template v-slot:default-header="prop">
                  <div class="tree-node-custom">
                    <div class="tree-node-icon-wrapper">
                      <q-icon
                        :name="prop.node.icon"
                        :color="prop.node.iconColor"
                        size="sm"
                      />
                    </div>
                    <div class="tree-node-content">
                      <div class="tree-node-title">
                        <span class="node-codigo">{{ prop.node.codigo }}</span>
                        <span class="node-label">{{ prop.node.label }}</span>
                      </div>
                      <div class="tree-node-meta">
                        <q-chip
                          dense
                          size="xs"
                          :color="prop.node.tipo_cuenta === 'Activo' ? 'green-9' :
                                  prop.node.tipo_cuenta === 'Pasivo' ? 'red-9' :
                                  prop.node.tipo_cuenta === 'Patrimonio' ? 'blue-9' :
                                  prop.node.tipo_cuenta === 'Ingresos' ? 'purple-9' : 'orange-9'"
                          :text-color="prop.node.tipo_cuenta === 'Activo' ? 'green-2' :
                                       prop.node.tipo_cuenta === 'Pasivo' ? 'red-2' :
                                       prop.node.tipo_cuenta === 'Patrimonio' ? 'blue-2' :
                                       prop.node.tipo_cuenta === 'Ingresos' ? 'purple-2' : 'orange-2'"
                          class="node-chip"
                        >
                          {{ prop.node.tipo_cuenta }}
                        </q-chip>
                        <q-chip
                          dense
                          size="xs"
                          :color="prop.node.naturaleza === 'D' ? 'teal-9' : 'pink-9'"
                          :text-color="prop.node.naturaleza === 'D' ? 'teal-2' : 'pink-2'"
                          :icon="prop.node.naturaleza === 'D' ? 'add_circle' : 'remove_circle'"
                          class="node-chip"
                        >
                          {{ prop.node.naturaleza === 'D' ? 'Deudora' : 'Acreedora' }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                </template>
              </q-tree>

              <div v-if="treeData.length === 0" class="text-center q-pa-xl text-grey-5">
                <q-icon name="folder_off" size="xl" class="q-mb-md" />
                <div class="text-subtitle2">No se encontraron cuentas padre</div>
                <div class="text-caption">Las cuentas padre son contenedores que no aceptan movimientos</div>
              </div>
            </q-scroll-area>
          </div>
        </q-card-section>

        <q-separator dark class="q-mt-md" />

        <q-card-actions align="right" class="q-pa-md bg-dark-page">
          <q-btn
            outline
            color="grey-5"
            label="Cancelar"
            @click="showTreeDialog = false"
            icon="cancel"
            class="no-shadow"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
import { useQuasar, Notify } from 'quasar'

const $q = useQuasar()

const rawData = ref([])
const treeData = ref([])
const showTreeDialog = ref(false)
const filterTree = ref('')
const selectedNodeKey = ref(null)

const CuentaPadre = ref(null)
const Nombre = ref('')
const CodigoSufijo = ref('')
const Tipo = ref('')
const Naturaleza = ref('')
const Movimientos = ref(true)
const Descripcion = ref('')

const opcionesMovimiento = [
  { label: 'SÍ (Cuenta Transaccional)', val: true },
  { label: 'NO (Carpeta/Contenedor)', val: false }
]

const parentNameDisplay = computed(() => {
  return CuentaPadre.value ? `${CuentaPadre.value.codigo} - ${CuentaPadre.value.nombre}` : ''
})

const codigoPrefijo = computed(() => {
  return CuentaPadre.value ? CuentaPadre.value.codigo : ''
})

const CodigoFinal = computed(() => {
  return `${codigoPrefijo.value}${CodigoSufijo.value}`.trim()
})

const NaturalezaDisplay = computed(() => {
  if (!Naturaleza.value) return ''
  return Naturaleza.value === 'D' ? 'DEUDORA' : 'ACREEDORA'
})

const esFormularioValido = computed(() => {
  return CuentaPadre.value && Nombre.value && CodigoSufijo.value
})


const obtenerCuentas = async () => {
  try {
    const response = await axios.get('http://178.128.79.42:8000/api/contabilidad/obtener/cuentas_padre/')

    let data = response.data.map(c => c.cuenta ?? c)
    rawData.value = data

    const contenedores = data.filter(c => c.movimientos === false)

    treeData.value = buildTree(contenedores)

  } catch (error) {
    console.error("💥 Error obteniendo cuentas:", error)
    $q.notify({ type: 'negative', message: 'Error cargando datos' })
  }
}

const buildTree = (items, parentId = null) => {
  return items
    .filter(item => {
      if (parentId === null) {
        return item.cuenta_padre_id == null
      }

      return item.cuenta_padre_id == parentId
    })
    .map(item => ({
      id: item.id,
      label: item.nombre,
      codigo: item.codigo,
      tipo_cuenta: item.tipo,
      naturaleza: item.naturaleza,
      icon: item.cuenta_padre_id ? 'folder_open' : 'account_balance',
      iconColor: 'primary',
      children: buildTree(items, item.id)
    }))
}

const onNodeSelected = (key) => {
  if (!key) return

  const node = rawData.value.find(x => x.id === key)
  if (node) {
    CuentaPadre.value = node
    Tipo.value = node.tipo
    Naturaleza.value = node.naturaleza

    CodigoSufijo.value = ''

    showTreeDialog.value = false
  }
}

const enviarDatos = async () => {
  try {
    const existe = rawData.value.some(c => c.codigo === CodigoFinal.value)
    if (existe) {
      Notify.create({ type: 'warning', message: '¡Ese código ya existe en el sistema!' })
      return
    }

    const payload = [{
      nombre: Nombre.value,
      codigo: CodigoFinal.value,
      tipo_cuenta: Tipo.value,
      naturaleza: Naturaleza.value,
      descripcion: Descripcion.value,
      permite_movimientos: Movimientos.value,
      cuenta_padre_codigo: CuentaPadre.value.codigo,
    }]

    await axios.post('http://178.128.79.42:8000/api/contabilidad/cuentas/crear/', payload)

    Notify.create({ type: 'positive', message: 'Cuenta creada exitosamente' })
    limpiarFormulario()
    obtenerCuentas()
  } catch (error) {
    console.error(error)
    Notify.create({ type: 'negative', message: 'Error al guardar. Revisa la consola.' })
  }
}

const limpiarFormulario = () => {
  CuentaPadre.value = null
  Nombre.value = ''
  CodigoSufijo.value = ''
  Tipo.value = ''
  Naturaleza.value = ''
  Descripcion.value = ''
  Movimientos.value = true
  selectedNodeKey.value = null
}

onMounted(() => {
  obtenerCuentas()
})
</script>

<style scoped lang="scss">
.bg-dark-page {
  background-color: #0b1120;
}

.bg-dark-card {
  background-color: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.modern-input {
  :deep(.q-field__control) {
    background-color: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
      border-color: rgba(34, 211, 238, 0.3);
    }
  }

  :deep(.q-field__native),
  :deep(.q-field__prefix),
  :deep(.q-field__input) {
    color: #fff;
  }

  :deep(.q-placeholder) {
    color: rgba(255, 255, 255, 0.3);
  }

  :deep(.q-field--focused) {
    .q-field__control {
      border-color: rgba(34, 211, 238, 0.6);
      box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.2);
    }
  }
}

.modern-tree {
  :deep(.q-tree__node-header) {
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }

  :deep(.q-tree__node--selected) {
    .q-tree__node-header {
      background-color: rgba(34, 211, 238, 0.15);
      border-left: 3px solid #22d3ee;
    }
  }
}

.tree-container {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 12px;
  background-color: rgba(11, 17, 32, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tree-dialog-card {
  width: 900px;
  max-width: 95vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.bg-gradient-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  padding: 20px 24px;
}

.search-input-large {
  :deep(.q-field__control) {
    height: 48px;
    font-size: 0.95rem;
  }
}

.tree-container-improved {
  background: linear-gradient(180deg, rgba(11, 17, 32, 0.8) 0%, rgba(11, 17, 32, 0.4) 100%);
  border-radius: 12px;
  border: 1px solid rgba(34, 211, 238, 0.15);
  padding: 4px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tree-scroll-area {
  height: 450px;
  max-height: 50vh;
}

.modern-tree-improved {
  padding: 8px;

  :deep(.q-tree__node) {
    margin-bottom: 4px;
  }

  :deep(.q-tree__node-header) {
    padding: 0;
    border-radius: 8px;
    transition: all 0.3s ease;
    margin: 2px 0;

    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
      transform: translateX(4px);
    }
  }

  :deep(.q-tree__node--selected) {
    .q-tree__node-header {
      background: linear-gradient(90deg, rgba(34, 211, 238, 0.2) 0%, rgba(34, 211, 238, 0.05) 100%);
      border-left: 4px solid #22d3ee;
      box-shadow: 0 2px 8px rgba(34, 211, 238, 0.2);
    }
  }

  :deep(.q-tree__arrow) {
    color: #22d3ee;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.2);
    }
  }

  :deep(.q-tree__node--parent > .q-tree__node-header) {
    font-weight: 600;
  }
}

.tree-node-custom {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  width: 100%;
  gap: 12px;
}

.tree-node-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(34, 211, 238, 0.1);
  border-radius: 8px;
  flex-shrink: 0;
}

.tree-node-content {
  flex: 1;
  min-width: 0;
}

.tree-node-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.node-codigo {
  font-weight: 700;
  font-size: 0.9rem;
  color: #22d3ee;
  font-family: 'Courier New', monospace;
  background: rgba(34, 211, 238, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.node-label {
  color: #e5e7eb;
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-node-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.node-chip {
  font-size: 0.65rem;
  padding: 2px 6px;
  height: 20px;
}

@keyframes fadeInNode {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modern-tree-improved :deep(.q-tree__node) {
  animation: fadeInNode 0.3s ease forwards;
}

.tree-scroll-area :deep(.q-scrollarea__thumb) {
  background: rgba(34, 211, 238, 0.4);
  border-radius: 4px;
  width: 6px;

  &:hover {
    background: rgba(34, 211, 238, 0.6);
  }
}

.tree-scroll-area :deep(.q-scrollarea__track) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

@media (max-width: 768px) {
  .tree-dialog-card {
    width: 100%;
    max-width: 100vw;
    max-height: 90vh;
  }

  .tree-node-custom {
    padding: 10px 12px;
  }

  .tree-node-meta {
    .node-chip {
      font-size: 0.6rem;
    }
  }
}
</style>
