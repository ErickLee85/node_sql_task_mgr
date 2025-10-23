<template>
  <q-page :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-2'" class="page-container">
    <!-- Page-specific toolbar for search and add task -->
    <div style="min-height: 60px; max-height: 60px;" class="row items-center q-pa-sm border-bottom" :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
      <div class="col">
        <div class="text-h6" style="margin-left: 10px;" :class="$q.dark.isActive ? 'text-white' : 'text-grey-8'">
          My Tasks
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
        size="sm"
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
      <span>Total Tasks: {{ filteredTasks.length }}</span>
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
              >
                  <template v-slot:prepend>
                    <q-icon name="filter_alt" />
                  </template>
              </q-select>
    </div>
    <q-card flat bordered>
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

  const liveUrl = 'https://nodesqltaskmgr-production.up.railway.app'
  const localUrl = 'http://localhost:1005'

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

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

const fetchTasks = async () => {
  loading.value = true
  try {
    const response = await fetch(`${liveUrl}/api/tasks`, {
      headers: getAuthHeaders()
    })

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
    const response = await fetch(`${liveUrl}}/api/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
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
    
    const response = await fetch(`${liveUrl}/api/tasks/${editingTaskId.value}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
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
    const response = await fetch(`${liveUrl}/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
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
      const response = await fetch(`${liveUrl}/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
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
.border-bottom {
    border-bottom: 1px solid gainsboro;
}
.container {margin:50px auto; max-width:1200px; padding-inline: 10px;}
.filter-container{display: flex;justify-content: space-between; gap:10px;}

/* Search input expansion on focus */
.search-expanded {
  width: 100%;
  max-width:400px;
}

/* Active task pulsating border */
.task-active {
  border-left: 4px solid #21BA45 !important;
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
</style>

