<template>
  <q-page class="page-container" :class="$q.dark.isActive ? 'custom-dark-bg' : 'custom-light-bg'">
    <!-- Page-specific toolbar for search and add task -->
    <div style="min-height: 60px; max-height: 60px;" class="row items-center q-pa-sm shadow-1" :class="$q.dark.isActive ? 'bg-black' : 'bg-white'">
      <div class="col">
        <div class="text-h6" style="margin-left: 10px;" :class="$q.dark.isActive ? 'text-white' : 'text-grey-8'">
          Tasks
        </div>
      </div>
      <q-input
        v-if="tasks.size > 0 && !$q.platform.is.mobile"
        v-model="searchQuery"
        label="Search Tasks"
        rounded=false
        clearable
        standout="bg-teal text-white"
        :loading="searchingTasks"
        debounce="100"
        dense
        style="margin-right: 20px;"
        class="search-input"
        @focus="() => {inputFocused = true;}"
        @blur="() => {inputFocused = false;}"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn
        size="md"
        icon="add"
        flat
        @click="showDialog = true"
        label="Add Task"
        class='bg-teal text-white'
      />
    </div>


    <div class="container">
    <div style="margin-block:10px; display: flex; justify-content: space-between; align-items: center;" v-if="tasks.size > 0">
      <span>Total: {{ filteredTasks.length }}</span>
                <q-select
                v-model="selectedFilter"
                :options="filterOptions"
                label="Filter Tasks"
                dense
                outlined
                emit-value
                map-options
                style="width:150px;"
                color="teal"
                :bg-color="$q.dark.isActive ? 'bg-black' : 'bg-white'"
                :dark="$q.dark.isActive"
                :style="$q.dark.isActive ? 'background:black;' : 'background:white;'"
              >
                  <template v-slot:prepend>
                    <q-icon name="filter_alt" />
                  </template>
              </q-select>
    </div>
    <q-card bordered class="shadow-12">
      <q-card-section v-if="loading" class="text-center">
        <q-spinner color="primary" size="3em" />
      </q-card-section>

      <!-- Empty State -->
      <q-card-section v-if="!loading && tasks.size === 0" class="text-center q-pa-xl">
        <q-icon name="task_alt" size="6em" color="grey-5" class="q-mb-md" />
        <div class="text-h5 text-grey-7 q-mb-sm">No tasks found</div>
        <div class="text-body1 text-grey-6 q-mb-md">Get started by creating your first task.</div>
        <q-btn
          glossy
          label="Create Task"
          icon="add"
          @click="showDialog = true"
          size="md"
        />
      </q-card-section>

      <q-list v-if="filteredTasks.length > 0" bordered>
        <template v-for="(task, index) in filteredTasks" :key="task.id">
          <q-expansion-item
            :class="{ 'task-active': task.isActive }"
            :default-opened="index === 0"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-checkbox
                  :model-value="task.complete"
                  @update:model-value="toggleTask(task)"
                  color="teal"
                  @click.stop
                />
              </q-item-section>

              <q-item-section>
                <q-item-label 
                  class="text-weight-bold" 
                  :class="{ 'text-strike text-grey-6': task.complete }"
                >
                  {{ task.title }}
                </q-item-label>
                <q-item-label caption v-if="task.dueDate" class="text-red-8">
                  Due: {{ formatDate(task.dueDate) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row items-center q-gutter-sm">
                  <q-btn-dropdown
                    style="min-width:75px;"
                    no-icon-animation
                    flat
                    dense
                    dropdown-icon="more_horiz"
                    :color="$q.dark.isActive ? 'white' : 'grey-7'"
                    @click.stop
                  >
                    <q-list>
                      <q-item clickable v-close-popup @click="toggleActiveStatus(task)">
                        <q-item-section avatar>
                          <q-icon :name="task.isActive ? 'check_circle' : 'radio_button_unchecked'" color="positive" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label :class="task.isActive ? 'text-positive' : ''">
                            {{ task.isActive ? 'Active' : 'Set Active' }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      <q-separator />
                      
                      <q-item clickable v-close-popup @click="openEditDialog(task)">
                        <q-item-section avatar>
                          <q-icon name="edit" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Edit</q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      <q-separator />
                      
                      <q-item clickable v-close-popup @click="deleteTask(task)">
                        <q-item-section avatar>
                          <q-icon name="delete" color="negative" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-negative">Delete</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </div>
              </q-item-section>
            </template>

            <q-card v-if="task.description" :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-2'">
              <q-card-section>
                <div class="text-subtitle2 text-grey-7 q-mb-sm">Description</div>
                <div>{{ task.description }}</div>
              </q-card-section>
            </q-card>
            <q-card v-else>
              <q-card-section class="text-grey-6 text-italic">
                No description provided
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-separator v-if="index < filteredTasks.length - 1" />
        </template>
      </q-list>
    </q-card>
    </div>

    <!-- Create/Edit Task Dialog -->
    <q-dialog v-model="showDialog" backdrop-filter="blur(1px)">
      <q-card style="min-width: 400px" >
        <q-card-section class="flex justify-between items-center">
          <div class="text-h6">{{ editMode ? 'Edit Task' : 'Create New Task' }}</div>
          <q-btn round flat icon="close" @click="closeDialog" />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="editMode ? updateTask() : createTask()" class="q-gutter-md">
            <q-input
              v-model="newTask.title"
              label="Task Title"
              filled
              dense
            />

            <q-input
              v-model="newTask.description"
              label="Description (optional)"
              type="textarea"
              filled
              rows="3"
            />

            <q-input
              v-model="newTask.dueDate"
              label="Due Date (optional)"
              filled
              dense
              type="date"
            />

            <q-separator />
            <div class="row justify-end">
              <q-btn
                label="Cancel"
                flat
                color="grey-7"
                @click="closeDialog"
                style="margin-right:5px;"
              />
              <q-btn
                :label="editMode ? 'Update' : 'Create'"
                type="submit"
                glossy
                :loading="creating"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import confetti from 'canvas-confetti'
import { fetchAPI } from 'src/utils/api'

import { useToast } from 'vue-toastification'

const toast = useToast()

// Toast variations / check boot file for modifications.
// toast.success('Success message!')
// toast.error('Error message!')
// toast.info('Info message!')
// toast.warning('Warning message!')

const router = useRouter()
const $q = useQuasar()

const tasks = ref(new Set())
const loading = ref(false)
const showDialog = ref(false)
const creating = ref(false)
const editMode = ref(false)
const searchingTasks = ref(false)
const editingTaskId = ref(null)
const inputFocused = ref(false)

const items = ref([
  1,2,3,4,5,6,7,8,9,10
])

// Filter and search states
const selectedFilter = ref('all')
const selectedSort = ref('newest')
const searchQuery = ref('')

const newTask = ref({
  title: '',
  description: '',
  dueDate: ''
})

// Filter and sort options
const filterOptions = [
  { label: 'All Tasks', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Due Today', value: 'today' },
  { label: 'Due This Week', value: 'week' }
]

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Due Date (Earliest)', value: 'due_asc' },
  { label: 'Due Date (Latest)', value: 'due_desc' },
  { label: 'Alphabetical', value: 'alpha' },
  { label: 'Completed First', value: 'completed_first' },
  { label: 'Pending First', value: 'pending_first' }
]
// Computed metrics

function celebrate() {
  if(confetti) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

// Filtered and sorted tasks
const filteredTasks = computed(() => {
  let filtered = Array.from(tasks.value)
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    )
  } 
  
  // Apply status filter
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  switch (selectedFilter.value) {
    case 'completed':
      filtered = filtered.filter(task => task.complete)
      localStorage.setItem('filter', selectedFilter.value)
      break
    case 'pending':
      filtered = filtered.filter(task => !task.complete)
        localStorage.setItem('filter', selectedFilter.value)
      break
    case 'overdue':
      filtered = filtered.filter(task => {
        if (!task.dueDate || task.complete) return false
        const [year, month, day] = task.dueDate.split('-')
        const dueDate = new Date(year, month - 1, day)
        return dueDate < today
      })
        localStorage.setItem('filter', selectedFilter.value)
      break
    case 'today':
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false
        const [year, month, day] = task.dueDate.split('-')
        const dueDate = new Date(year, month - 1, day)
        return dueDate.getTime() === today.getTime()
      })
        localStorage.setItem('filter', selectedFilter.value)
      break
    case 'week':
      const weekFromNow = new Date()
      weekFromNow.setDate(today.getDate() + 7)
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false
        const [year, month, day] = task.dueDate.split('-')
        const dueDate = new Date(year, month - 1, day)
        return dueDate >= today && dueDate <= weekFromNow
      })
      break
  }
  
  // Apply sorting
  switch (selectedSort.value) {
    case 'newest':
      filtered.sort((a, b) => b.id - a.id)
      break
    case 'oldest':
      filtered.sort((a, b) => a.id - b.id)
      break
    case 'due_asc':
      filtered.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      })
      break
    case 'due_desc':
      filtered.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return -1
        if (!b.dueDate) return 1
        return b.dueDate.localeCompare(a.dueDate)
      })
      break
    case 'alpha':
      filtered.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'completed_first':
      filtered.sort((a, b) => {
        if (a.complete === b.complete) return 0
        return a.complete ? -1 : 1
      })
      break
    case 'pending_first':
      filtered.sort((a, b) => {
        if (a.complete === b.complete) return 0
        return a.complete ? 1 : -1
      })
      break
  }
  
  // Default sort by due date (earliest first)
  if (selectedSort.value === 'newest') {
    filtered.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return b.id - a.id
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    })
  }
   
  return filtered
})

const fetchTasks = async () => {
  loading.value = true
  try {
    const response = await fetchAPI('/api/tasks')

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        logout()
        return
      }
      throw new Error(data.error || 'Failed to fetch tasks')
    }

    // Initialize isActive property for each task and convert to Set
    const tasksWithActive = data.tasks.map(task => ({
      ...task,
      isActive: task.isActive || false
    }))
    
    // Sort by due date (earliest first, tasks without due date at the end)
    tasksWithActive.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate)
    })
    
    // Convert to Set
    tasks.value = new Set(tasksWithActive)
    console.log('TASKS: ', data.tasks)

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const createTask = async () => {
  creating.value = true
  
  try {
    const response = await fetchAPI('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: newTask.value.title,
        description: newTask.value.description,
        dueDate: newTask.value.dueDate,
        complete: false
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create task')
    }
    closeDialog()
    fetchTasks()

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message,
      position: 'top'
    })
  } finally {
    creating.value = false
  }
}

const openEditDialog = (task) => {
  editMode.value = true
  editingTaskId.value = task.id
  
  newTask.value = {
    title: task.title,
    description: task.description || '',
    dueDate: task.dueDate || '' // Use the date string directly without parsing
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editMode.value = false
  editingTaskId.value = null
  newTask.value = { title: '', description: '', dueDate: '' }
}

const goToTaskDetail = (taskId) => {
  router.push(`/tasks/${taskId}`)
}

const updateTask = async () => {
  creating.value = true
  
  try {
    // Find the current task to preserve its complete status
    const currentTask = Array.from(tasks.value).find(t => t.id === editingTaskId.value)
    
    const response = await fetchAPI(`/api/tasks/${editingTaskId.value}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: newTask.value.title,
        description: newTask.value.description,
        dueDate: newTask.value.dueDate,
        complete: currentTask?.complete || false
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update task')
    }

    closeDialog()
    fetchTasks()

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message,
      position: 'top'
    })
  } finally {
    creating.value = false
  }
}

const toggleActiveStatus = (task) => {
  // Toggle the active status (front-end only)
  task.isActive = !task.isActive
}

const toggleTask = async (task) => {
  try {
    const response = await fetchAPI(`/api/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        complete: !task.complete
      })
    })
    if(task.complete === false) {
      celebrate()
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update task')
    }
    // Refresh tasks list
    fetchTasks();
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message,
      position: 'top'
    })
  }
}

const deleteTask = async (task) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${task.title}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await fetchAPI(`/api/tasks/${task.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete task')
      }

      // Refresh tasks list
      fetchTasks()

    } catch (err) {
      $q.notify({
        type: 'negative',
        message: err.message,
        position: 'top'
      })
    }
  })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  // Parse the date string as local date (YYYY-MM-DD) without timezone conversion
  const [year, month, day] = dateString.split('-')
  const date = new Date(year, month - 1, day) // month is 0-indexed
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const clearFilters = () => {
  selectedFilter.value = 'all'
  selectedSort.value = 'newest'
  searchQuery.value = ''
}

onMounted(async () => {
  await fetchTasks()
  const filterSelection = localStorage.getItem('filter')
  console.log('local storage filter: ', filterSelection)
  if(filterSelection) {
    selectedFilter.value = filterSelection
  }
})

watch(selectedFilter, (newVal, oldVal) => {
  if(oldVal === newVal) {
    return
  } else {
    localStorage.setItem('filter', newVal)
    
    // Show toast if filter results in no tasks
    if (tasks.value.size > 0 && filteredTasks.value.length === 0) {
      const filterLabel = filterOptions.find(opt => opt.value === newVal)?.label || newVal
      toast.info(`No ${filterLabel} tasks found. `)
    }
  }
})
</script>

<style>

.container {margin:50px auto; max-width:1200px; padding-inline: 10px;}
.filter-container{display: flex;justify-content: space-between; gap:10px;}

/* Search input expansion on focus */
.search-expanded {
  width: 100%;
  max-width:400px;
}

/* Active task pulsating border */
.task-active {
  border-left: 4px solid #21baa0 !important;
  animation: pulse-border 2s ease-in-out infinite;
}
.page-container{opacity: 0; filter: blur(3px); animation: fade-page 300ms linear forwards;}
@keyframes pulse-border {
  0%, 100% {
    border-left-color: #21BA45;
  }
  50% {
    border-left-color: #4ade80;
  }
}
@keyframes fade-page {
  from {opacity: 0; filter: blur(3px);} 
  to {opacity: 1; filter: blur(0px);}
}

@media(max-width:560px) {.filter-container{flex-direction: column;}}
.custom-dark-bg {
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%2310bbc6' fill-opacity='0.04' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V2h-58.1zm0 96a5 5 0 1 1 0-2H137l32-32h39V21.9a5 5 0 1 1 2 0V66h-40.17l-32 32H117.9zm28.1 90.1a5 5 0 1 1-2 0v-76.51L175.59 80H224V21.9a5 5 0 1 1 2 0V82h-49.59L146 112.41v75.69zm16 32a5 5 0 1 1-2 0v-99.51L184.59 96H300.1a5 5 0 0 1 3.9-3.9v2.07a3 3 0 0 0 0 5.66v2.07a5 5 0 0 1-3.9-3.9H185.41L162 121.41v98.69zm-144-64a5 5 0 1 1-2 0v-3.51l48-48V48h32V0h2v50H66v55.41l-48 48v2.69zM50 53.9v43.51l-48 48V208h26.1a5 5 0 1 1 0 2H0v-65.41l48-48V53.9a5 5 0 1 1 2 0zm-16 16V89.41l-34 34v-2.82l32-32V69.9a5 5 0 1 1 2 0zM12.1 32a5 5 0 1 1 0 2H9.41L0 43.41V40.6L8.59 32h3.51zm265.8 18a5 5 0 1 1 0-2h18.69l7.41-7.41v2.82L297.41 50H277.9zm-16 160a5 5 0 1 1 0-2H288v-71.41l16-16v2.82l-14 14V210h-28.1zm-208 32a5 5 0 1 1 0-2H64v-22.59L40.59 194H21.9a5 5 0 1 1 0-2H41.41L66 216.59V242H53.9zm150.2 14a5 5 0 1 1 0 2H96v-56.6L56.6 162H37.9a5 5 0 1 1 0-2h19.5L98 200.6V256h106.1zm-150.2 2a5 5 0 1 1 0-2H80v-46.59L48.59 178H21.9a5 5 0 1 1 0-2H49.41L82 208.59V258H53.9zM34 39.8v1.61L9.41 66H0v-2h8.59L32 40.59V0h2v39.8zM2 300.1a5 5 0 0 1 3.9 3.9H3.83A3 3 0 0 0 0 302.17V256h18v48h-2v-46H2v42.1zM34 241v63h-2v-62H0v-2h34v1zM17 18H0v-2h16V0h2v18h-1zm273-2h14v2h-16V0h2v16zm-32 273v15h-2v-14h-14v14h-2v-16h18v1zM0 92.1A5.02 5.02 0 0 1 6 97a5 5 0 0 1-6 4.9v-2.07a3 3 0 1 0 0-5.66V92.1zM80 272h2v32h-2v-32zm37.9 32h-2.07a3 3 0 0 0-5.66 0h-2.07a5 5 0 0 1 9.8 0zM5.9 0A5.02 5.02 0 0 1 0 5.9V3.83A3 3 0 0 0 3.83 0H5.9zm294.2 0h2.07A3 3 0 0 0 304 3.83V5.9a5 5 0 0 1-3.9-5.9zm3.9 300.1v2.07a3 3 0 0 0-1.83 1.83h-2.07a5 5 0 0 1 3.9-3.9zM97 100a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-48 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 96a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-144a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM49 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM33 68a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 240a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm80-176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm112 176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 180a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 84a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'%3E%3C/path%3E%3C/svg%3E"), linear-gradient(black, #060707);
}
.custom-light-bg {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%236b9f91' fill-opacity='0.08' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V2h-58.1zm0 96a5 5 0 1 1 0-2H137l32-32h39V21.9a5 5 0 1 1 2 0V66h-40.17l-32 32H117.9zm28.1 90.1a5 5 0 1 1-2 0v-76.51L175.59 80H224V21.9a5 5 0 1 1 2 0V82h-49.59L146 112.41v75.69zm16 32a5 5 0 1 1-2 0v-99.51L184.59 96H300.1a5 5 0 0 1 3.9-3.9v2.07a3 3 0 0 0 0 5.66v2.07a5 5 0 0 1-3.9-3.9H185.41L162 121.41v98.69zm-144-64a5 5 0 1 1-2 0v-3.51l48-48V48h32V0h2v50H66v55.41l-48 48v2.69zM50 53.9v43.51l-48 48V208h26.1a5 5 0 1 1 0 2H0v-65.41l48-48V53.9a5 5 0 1 1 2 0zm-16 16V89.41l-34 34v-2.82l32-32V69.9a5 5 0 1 1 2 0zM12.1 32a5 5 0 1 1 0 2H9.41L0 43.41V40.6L8.59 32h3.51zm265.8 18a5 5 0 1 1 0-2h18.69l7.41-7.41v2.82L297.41 50H277.9zm-16 160a5 5 0 1 1 0-2H288v-71.41l16-16v2.82l-14 14V210h-28.1zm-208 32a5 5 0 1 1 0-2H64v-22.59L40.59 194H21.9a5 5 0 1 1 0-2H41.41L66 216.59V242H53.9zm150.2 14a5 5 0 1 1 0 2H96v-56.6L56.6 162H37.9a5 5 0 1 1 0-2h19.5L98 200.6V256h106.1zm-150.2 2a5 5 0 1 1 0-2H80v-46.59L48.59 178H21.9a5 5 0 1 1 0-2H49.41L82 208.59V258H53.9zM34 39.8v1.61L9.41 66H0v-2h8.59L32 40.59V0h2v39.8zM2 300.1a5 5 0 0 1 3.9 3.9H3.83A3 3 0 0 0 0 302.17V256h18v48h-2v-46H2v42.1zM34 241v63h-2v-62H0v-2h34v1zM17 18H0v-2h16V0h2v18h-1zm273-2h14v2h-16V0h2v16zm-32 273v15h-2v-14h-14v14h-2v-16h18v1zM0 92.1A5.02 5.02 0 0 1 6 97a5 5 0 0 1-6 4.9v-2.07a3 3 0 1 0 0-5.66V92.1zM80 272h2v32h-2v-32zm37.9 32h-2.07a3 3 0 0 0-5.66 0h-2.07a5 5 0 0 1 9.8 0zM5.9 0A5.02 5.02 0 0 1 0 5.9V3.83A3 3 0 0 0 3.83 0H5.9zm294.2 0h2.07A3 3 0 0 0 304 3.83V5.9a5 5 0 0 1-3.9-5.9zm3.9 300.1v2.07a3 3 0 0 0-1.83 1.83h-2.07a5 5 0 0 1 3.9-3.9zM97 100a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-48 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 96a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-144a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM49 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM33 68a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 240a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm80-176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm112 176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 180a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 84a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'%3E%3C/path%3E%3C/svg%3E"), linear-gradient(white, #f0f0f0);
}
</style>