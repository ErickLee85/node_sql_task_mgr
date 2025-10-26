<template>
  <q-page class="page-container" :class="$q.dark.isActive ? 'bg-dark-mode' : 'bg-light-mode'">
    <!-- Page-specific toolbar for search and add task -->
    <div style="min-height: 60px; max-height: 60px;" class="row items-center q-pa-sm shadow-1" :class="$q.dark.isActive ? 'bg-black shadow-0' : 'bg-white'">
      <div class="col">
        <div class="text-h6" style="margin-left: 15px; font-weight: 900;" :class="$q.dark.isActive ? 'text-white' : 'text-grey-8'">
          Tasks
        </div>
      </div>
      <q-input
        v-if="tasks.size > 0 && !$q.platform.is.mobile"
        v-model="searchQuery"
        label="Search Tasks"
        rounded=false
        color="teal"
        dense
        style="margin-right: 20px;"
        @focus="() => {inputFocused = true;}"
        @blur="() => {inputFocused = false;}"
        clearable
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn
        size="md"
        icon="add"
        flat
        @click="() => {showDialog = true; addTaskSound()}"
        label="Add Task"
        class='bg-teal text-white'
      />
    </div>


    <div class="container">
    <div style="margin-block:15px; display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap;" v-if="tasks.size > 0">
        <q-chip>
        <q-avatar color="teal" text-color="white">{{ filteredTasks.length }}</q-avatar>
        {{ filteredTasks.length > 1 ? 'Tasks' : 'Task' }}
      </q-chip>
    
      <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
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
              <q-select
                v-model="selectedSort"
                :options="sortOptions"
                label="Sort By"
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
                    <q-icon name="sort" />
                  </template>
              </q-select>
      </div>
    </div>
    <q-card v-if="filteredTasks.length > 0" bordered class="shadow-12 custom-card" :class="$q.dark.isActive ? 'shadow-0' : ''">
      <q-list  bordered>
        <template v-for="(task, index) in filteredTasks" :key="task.id">
          <q-expansion-item
            :class="{ 'task-active': task.isActive }"
            @before-show="playClickSound"
            @before-hide="playClickSound"
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
                  class="text-weight-bold text-h5" 
                  :class="{ 'text-strike text-grey-6': task.complete }"
                >
                   <q-icon :name="taskFlag(task.priority)" :color="taskFlagColor(task.priority)" size="sm" style="margin-right: 15px;">
                        <q-tooltip>
                          {{ task.priority }} Priority
                        </q-tooltip>
                      </q-icon>
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
                    <q-list style="min-width: 100px;">
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
                      
                      <q-item clickable v-close-popup @click="openSubtaskDialog(task)">
                        <q-item-section avatar>
                          <q-icon name="add_task" color="teal" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Add Subtask</q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      <q-item clickable v-close-popup @click="openEditDialog(task)">
                        <q-item-section avatar>
                          <q-icon name="edit" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Edit</q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      
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
                <div style="font-size: 1.1rem; padding-bottom: 10px;">{{ task.description }}</div>
              </q-card-section>
            </q-card>
            <q-card v-else  :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-2'">
              <q-card-section class="text-grey-6 text-italic" >
                <div style="padding:5px;">
                  No description provided
                </div>
              </q-card-section>
            </q-card>

            <!-- Subtasks Section -->
            <q-card v-if="task.subtasks && task.subtasks.length > 0" :class="$q.dark.isActive ? 'bg-black q-mt-sm' : 'bg-grey-1 q-mt-sm'" style="border-top: 1px solid red; margin-top: -15px;">
              <q-card-section>
                <div class="text-subtitle2 text-grey-7 q-mb-sm" style="padding-bottom:5px;display: flex; align-items: center; justify-content: space-between; gap: 8px;" :style="$q.dark.isActive ? 'border-bottom:1px solid gray;' : 'border-bottom:1px solid gainsboro;'">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span>Subtasks</span>
                    <q-toggle
                      :model-value="task.subtasks.every(s => s.complete)"
                      @update:model-value="toggleAllSubtasks(task, $event)"
                      color="green"
                    >
                      <q-tooltip>{{ task.subtasks.every(s => s.complete) ? 'Mark all incomplete' : 'Complete all subtasks' }}</q-tooltip>
                    </q-toggle>
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="display: flex; align-items: center;">
                      <div 
                        :style="{
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          border: '2px solid ' + ($q.dark.isActive ? '#000' : '#f5f5f5')
                        }"
                      ></div>
                      <div 
                        :style="{
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          backgroundColor: '#ef4444',
                          marginLeft: '-5px',
                          border: '2px solid ' + ($q.dark.isActive ? '#000' : '#f5f5f5')
                        }"
                      ></div>
                      <div 
                        :style="{
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          backgroundColor: '#f97316',
                          marginLeft: '-5px',
                          border: '2px solid ' + ($q.dark.isActive ? '#000' : '#f5f5f5')
                        }"
                      ></div>
                      <div 
                        :style="{
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          backgroundColor: '#9ca3af',
                          marginLeft: '-5px',
                          border: '2px solid ' + ($q.dark.isActive ? '#000' : '#f5f5f5')
                        }"
                      ></div>
                      <div 
                        :style="{
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          backgroundColor: '#d1d5db',
                          marginLeft: '-5px',
                          border: '2px solid ' + ($q.dark.isActive ? '#000' : '#f5f5f5')
                        }"
                      ></div>
                      <div 
                        :style="{
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          marginLeft: '-5px',
                          border: '2px solid ' + ($q.dark.isActive ? '#000' : '#f5f5f5')
                        }"
                      ></div>
                    </div>
                    <span style="font-size: 0.9rem; font-weight: 500;">
                      {{ task.subtasks.filter(s => s.complete).length }}/{{ task.subtasks.length }}
                    </span>
                  </div>
                </div>
                <q-list dense :ref="el => setSubtaskListRef(task.id, el)" class="subtask-sortable">
                  <q-item v-for="subtask in task.subtasks" :key="subtask.id" :data-id="subtask.id" class="q-px-none subtask-item" style="" v-ripple>
                    <q-item-section avatar style="min-width: 30px; cursor: grab;" class="drag-handle">
                      <q-icon name="drag_indicator" :color="$q.dark.isActive ? 'grey-5' : 'grey-7'" size="sm" />
                    </q-item-section>
                    <q-item-section avatar style="min-width: 20px;">
                      {{ subtask.orderId + 1 }}.
                    </q-item-section>
                    <q-item-section avatar>
                      <q-checkbox 
                        :model-value="subtask.complete" 
                        @update:model-value="toggleSubtask(task.id, subtask.id, $event)"
                        :disable="isSubtaskLocked(task, subtask)"
                        color="green"
                        size="sm"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label 
                      style="font-size: 1rem;"
                      :class="{ 
                        'text-strike text-grey-6': subtask.complete,
                        'text-grey-5': isSubtaskLocked(task, subtask) && !subtask.complete
                      }">
                        {{ subtask.title }}
                        <q-icon v-if="subtask.dependsOn" name="link" size="xs" color="primary" class="q-ml-sm">
                          <q-tooltip>
                            Depends on: {{ getDependentSubtaskTitle(task, subtask.dependsOn) }}
                          </q-tooltip>
                        </q-icon>
                      </q-item-label>
                      <q-item-label v-if="isSubtaskLocked(task, subtask)" caption class="text-orange-8">
                        <q-icon name="lock" size="xs" /> Complete "{{ getDependentSubtaskTitle(task, subtask.dependsOn) }}" first
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn-dropdown
                        style="min-width:45px;"
                        no-icon-animation
                        flat
                        dense
                        dropdown-icon="more_horiz"
                        size="sm"
                        :color="$q.dark.isActive ? 'white' : 'grey-7'"
                        @click.stop
                        
                      >
                        <q-list dense>
                          <q-item clickable v-close-popup @click="editSubtask(task, subtask)">
                            <q-item-section avatar>
                              <q-icon name="edit" color="primary" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>Edit</q-item-label>
                            </q-item-section>
                          </q-item>
                          
                          <q-separator />
                          
                          <q-item clickable v-close-popup @click="deleteSubtask(task.id, subtask.id, true)">
                            <q-item-section avatar>
                              <q-icon name="delete" color="negative" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-negative">Delete</q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-btn-dropdown>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-separator v-if="index < filteredTasks.length - 1" />
        </template>
      </q-list>
    </q-card>
    </div>

    <!-- Create/Edit Task Dialog -->
    <q-dialog v-model="showDialog" backdrop-filter="blur(5px)">
      <q-card style="min-width: 400px" :class="$q.dark.isActive ? 'bg-black shadow-10' : 'bg-white shadow-10'">
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
              color="teal"
            />

            <q-input
              v-model="newTask.description"
              label="Description (optional)"
              type="textarea"
              filled
              rows="3"
              color="teal"
            />

            <q-input
              v-model="newTask.dueDate"
              label="Due Date (optional)"
              filled
              dense
              type="date"
              color="teal"
            />
             <q-select
              filled
              v-model="newTask.priority"
              :options="priorityLevles"
              label="Priority"
              color="teal"
              clearable
              options-selected-class="text-red"
              emit-value
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" :color="scope.opt.color" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

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

    <!-- Add Subtask Dialog -->
    <q-dialog v-model="showSubtaskDialog" backdrop-filter="blur(5px)">
      <q-card style="min-width: 400px" :class="$q.dark.isActive ? 'bg-black shadow-10' : 'bg-white shadow-10'">
        <q-card-section class="flex justify-between items-center">
          <div class="text-h6">{{ editingSubtask ? 'Edit Subtask' : 'Add Subtask' }}</div>
          <q-btn round flat icon="close" @click="closeSubtaskDialog" />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="editingSubtask ? updateSubtask() : createSubtask()" class="q-gutter-md">
            <q-input
              v-model="newSubtask.title"
              label="Subtask Title"
              filled
              dense
              color="teal"
              autofocus
              autogrow
              @keydown.enter="createSubtask"
            />

            <!-- Show dependency options if there are existing subtasks -->
            <div v-if="currentTaskForSubtask?.subtasks?.length > 0">
              <q-select
                v-model="newSubtask.dependsOn"
                :options="subtaskDependencyOptions"
                label="Dependency (Optional)"
                filled
                dense
                color="teal"
                emit-value
                map-options
                clearable
                hint="Select a subtask that must be completed first"
              >
                <template v-slot:prepend>
                  <q-icon name="link" />
                </template>
              </q-select>
            </div>

            <q-separator />
            <div class="row justify-end">
              <q-btn
                label="Cancel"
                flat
                color="grey-7"
                @click="closeSubtaskDialog"
                style="margin-right:5px;"
              />
              <q-btn
                :label="editingSubtask ? 'Update' : 'Create'"
                type="submit"
                color="teal"
                glossy
                :loading="creatingSubtask"
              >
              <template #loading>
                <q-spinner-pie />
              </template>
              </q-btn>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import confetti from 'canvas-confetti'
import { fetchAPI } from 'src/utils/api'
import Sortable from 'sortablejs'

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

// Subtask refs
const showSubtaskDialog = ref(false)
const creatingSubtask = ref(false)
const currentTaskForSubtask = ref(null)
const editingSubtask = ref(null)
const newSubtask = ref({
  title: '',
  dependsOn: null
})

// Store refs for subtask lists
const subtaskListRefs = ref({})
const sortableInstances = ref({})

const setSubtaskListRef = (taskId, el) => {
  if (el) {
    subtaskListRefs.value[taskId] = el
  }
}

// Computed property for subtask dependency options
const subtaskDependencyOptions = computed(() => {
  if (!currentTaskForSubtask.value?.subtasks) return []
  
  return currentTaskForSubtask.value.subtasks.map(sub => ({
    label: sub.title,
    value: sub.id
  }))
})

const items = ref([
  1,2,3,4,5,6,7,8,9,10
])

const priorityLevles = ref([
  {
    label: 'Low',
    value: 'Low',
    description: 'Low Priority',
    icon: 'low_priority',
    color: 'positive'
  },
  {
    label: 'Medium',
    value: 'Medium',
    description: 'Urgent Priority',
    icon: 'flag_circle',
    color: 'primary'
  },
  {
    label: 'High',
    value: 'High',
    description: 'High Priority',
    icon: 'notification_important',
    color: 'red'
  }
])

const addTaskSound = () => {
  const audio = new Audio('/assets/subtle_click.wav')
  audio.volume = 0.1
  audio.play().catch(err => console.log('Audio play failed:', err))
}
// Click sound
const playClickSound = () => {
  return;
  const audio = new Audio('/assets/click.mp3')
  audio.volume = 0.3
  audio.play().catch(err => console.log('Audio play failed:', err))
}

// Filter and search states
const selectedFilter = ref('all')
const selectedSort = ref('newest')
const searchQuery = ref('')

const newTask = ref({
  title: '',
  description: '',
  dueDate: '',
  priority: ''
})

// Filter and sort options
const filterOptions = [
  { label: 'All Tasks', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Due Today', value: 'today' },
  { label: 'Due This Week', value: 'week' },
  { label: 'Low Priority', value: 'low' },
  { label: 'Medium Priority', value: 'medium' },
  { label: 'High Priority', value: 'high' }
]

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Due Date (Ascending)', value: 'due_asc' },
  { label: 'Due Date (Descending)', value: 'due_desc' },
  { label: 'Alphabetical', value: 'alpha' },
  { label: 'Completed First', value: 'completed_first' },
  { label: 'Pending First', value: 'pending_first' }
]
// Computed metrics

const taskFlag = (flag) => {
  let flagIcon;
  switch(flag) {
    case "Low":
      flagIcon = 'low_priority'
      break;
    case "Medium":
      flagIcon = 'flag_circle'
      break;
    case "High":
      flagIcon = 'notification_important'
      break;
  }
  return flagIcon
}

const taskFlagColor = (flag) => {
  let flagColor;
  switch(flag) {
    case "Low":
      flagColor = 'positive'
      break;
    case "Medium":
      flagColor = 'primary'
      break;
    case "High":
      flagColor = 'red'
      break;
  }
  return flagColor
}

function celebrate(task) {
  task.complete = !task.complete
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
      localStorage.setItem('filter', selectedFilter.value)
      break
    case 'low':
      filtered = filtered.filter(task => task.priority === 'Low')
      localStorage.setItem('filter', selectedFilter.value)
      break
    case 'medium':
      filtered = filtered.filter(task => task.priority === 'Medium')
      localStorage.setItem('filter', selectedFilter.value)
      break
    case 'high':
      filtered = filtered.filter(task => task.priority === 'High')
      localStorage.setItem('filter', selectedFilter.value)
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
   
  return filtered
})

const fetchTasks = async () => {
  loading.value = true
  try {
    const response = await fetchAPI('/api/tasks')

    const data = await response.json()
    console.log('Tasks: ', data)

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
    
    // Initialize sortable for each task's subtasks after DOM updates
    nextTick(() => {
      initializeSortable()
    })

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

// Initialize sortable for all subtask lists
const initializeSortable = () => {
  // Destroy existing instances
  Object.values(sortableInstances.value).forEach(instance => {
    if (instance) instance.destroy()
  })
  sortableInstances.value = {}
  
  // Create new instances for each task
  Array.from(tasks.value).forEach(task => {
    if (task.subtasks && task.subtasks.length > 0) {
      const listEl = subtaskListRefs.value[task.id]
      if (listEl && listEl.$el) {
        sortableInstances.value[task.id] = Sortable.create(listEl.$el, {
          animation: 150,
          handle: '.drag-handle',
          ghostClass: 'sortable-ghost',
          dragClass: 'sortable-drag',
          onEnd: (evt) => handleSubtaskReorder(task, evt)
        })
      }
    }
  })
}

// Handle subtask reordering
const handleSubtaskReorder = async (task, evt) => {
  const { oldIndex, newIndex } = evt
  
  if (oldIndex === newIndex) return
  
  // Reorder the subtasks array
  const subtasks = [...task.subtasks]
  const [movedSubtask] = subtasks.splice(oldIndex, 1)
  subtasks.splice(newIndex, 0, movedSubtask)
  
  // Update order_id for all subtasks and determine dependencies
  subtasks.forEach((subtask, index) => {
    subtask.orderId = index
    
    // Auto-update dependency: if not first item, depend on previous item
    // unless it already has a different dependency that makes sense
    if (index > 0) {
      const previousSubtask = subtasks[index - 1]
      subtask.dependsOn = previousSubtask.id
    } else {
      subtask.dependsOn = null // First item has no dependency
    }
  })
  
  // Update the task's subtasks
  task.subtasks = subtasks
  
  // Send updates to backend
  try {
    for (const subtask of subtasks) {
      await fetchAPI(`/api/tasks/${task.id}/subtasks/${subtask.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          orderId: subtask.orderId,
          dependsOn: subtask.dependsOn
        })
      })
    }
    
    toast.success('Subtasks reordered!')
  } catch (err) {
    toast.error('Failed to update subtask order')
    fetchTasks() // Restore correct state
  }
}

const createTask = async () => {
  creating.value = true
  
  console.log('Submitted task: ', newTask.value)
  try {
    const response = await fetchAPI('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: newTask.value.title,
        description: newTask.value.description,
        dueDate: newTask.value.dueDate,
        complete: false,
        priority: newTask.value.priority
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create task')
    }
    tasks.value.add({
      id: data.taskId,
      title: newTask.value.title,
      description: newTask.value.description,
      dueDate: newTask.value.dueDate,
      complete: false,
      priority: newTask.value.priority
    })
    closeDialog()
    
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
    dueDate: task.dueDate || '', // Use the date string directly without parsing
    priority: task.priority || ''
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editMode.value = false
  editingTaskId.value = null
  newTask.value = { title: '', description: '', dueDate: '', priority: '' }
}

const goToTaskDetail = (taskId) => {
  router.push(`/tasks/${taskId}`)
}

const updateTask = async () => {
  creating.value = true
  
  try {
    // Find the current task to preserve its complete status
    const currentTask = Array.from(tasks.value).find(t => t.id === editingTaskId.value)
    const oldTask = currentTask
    currentTask.title = newTask.value.title
    currentTask.description = newTask.value.description
    currentTask.dueDate = newTask.value.dueDate
    currentTask.complete = currentTask.complete || false
    currentTask.priority = newTask.value.priority
    
    const response = await fetchAPI(`/api/tasks/${editingTaskId.value}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: newTask.value.title,
        description: newTask.value.description,
        dueDate: newTask.value.dueDate,
        complete: currentTask?.complete || false,
        priority: newTask.value.priority
      })
    })

    const data = await response.json()

    if (!response.ok) {
      currentTask.title = oldTask.title
      currentTask.description = oldTask.description
      currentTask.dueDate = oldTask.dueDate
      currentTask.complete = oldTask.complete
      currentTask.priority = oldTask.priority
      
      throw new Error(data.error || 'Failed to update task')
    }
   
    closeDialog()
    

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

// Subtask functions
const openSubtaskDialog = (task) => {
  currentTaskForSubtask.value = task
  newSubtask.value.title = ''
  showSubtaskDialog.value = true
}

const closeSubtaskDialog = () => {
  showSubtaskDialog.value = false
  currentTaskForSubtask.value = null
  editingSubtask.value = null
  newSubtask.value.title = ''
  newSubtask.value.dependsOn = null
}

const editSubtask = (task, subtask) => {
  currentTaskForSubtask.value = task
  editingSubtask.value = subtask
  newSubtask.value.title = subtask.title
  newSubtask.value.dependsOn = subtask.dependsOn
  showSubtaskDialog.value = true
}

const updateSubtask = async () => {
  if (!newSubtask.value.title.trim()) {
    toast.warning('Please enter a subtask title')
    return
  }

  creatingSubtask.value = true
  
  try {
    const response = await fetchAPI(`/api/tasks/${currentTaskForSubtask.value.id}/subtasks/${editingSubtask.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: newSubtask.value.title,
        dependsOn: newSubtask.value.dependsOn || null
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update subtask')
    }

    // Optimistically update the UI
    editingSubtask.value.title = newSubtask.value.title
    editingSubtask.value.dependsOn = newSubtask.value.dependsOn
    
    toast.success('Subtask updated successfully!')
    closeSubtaskDialog()
    
  } catch (err) {
    toast.error(err.message)
    fetchTasks() // Refresh on error to restore correct state
  } finally {
    creatingSubtask.value = false
  }
}

const createSubtask = async () => {
  if (!newSubtask.value.title.trim()) {
    toast.warning('Please enter a subtask title')
    return
  }

  creatingSubtask.value = true
  
  try {
    const response = await fetchAPI(`/api/tasks/${currentTaskForSubtask.value.id}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({
        title: newSubtask.value.title,
        dependsOn: newSubtask.value.dependsOn || null
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create subtask')
    }

    // Optimistically update the UI
    const newSubtaskObj = {
      id: data.subtaskId,
      taskId: currentTaskForSubtask.value.id,
      title: newSubtask.value.title,
      complete: false,
      orderId: currentTaskForSubtask.value.subtasks?.length || 0,
      dependsOn: newSubtask.value.dependsOn || null,
      createdAt: new Date().toISOString()
    }
    
    // Add the new subtask to the current task
    if (!currentTaskForSubtask.value.subtasks) {
      currentTaskForSubtask.value.subtasks = []
    }
    currentTaskForSubtask.value.subtasks.push(newSubtaskObj)
    
    toast.success('Subtask created successfully!')
    newSubtask.value.title = ''
    newSubtask.value.dependsOn = null
  } catch (err) {
    toast.error(err.message)
    // Only fetch tasks on error to restore correct state
    fetchTasks()
  } finally {
    creatingSubtask.value = false
  }
}

const toggleSubtask = async (taskId, subtaskId, complete) => {
  const foundTask = Array.from(tasks.value).find((task) => task.id === taskId)
  const foundSubTask = foundTask.subtasks.find((task) => task.id === subtaskId)
  
  // Check if subtask is locked
  if (isSubtaskLocked(foundTask, foundSubTask)) {
    const dependentSubtask = foundTask.subtasks.find(s => s.id === foundSubTask.dependsOn)
    toast.warning(`Please complete "${dependentSubtask?.title}" first`)
    return
  }
  
  if(foundSubTask) {
    foundSubTask.complete = !foundSubTask.complete
  }
  console.log('FOUND TASK: ', foundTask)
  console.log('FOUND SUBTASK: ', foundSubTask)
  try {
    const response = await fetchAPI(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PUT',
      body: JSON.stringify({
        complete: complete
      })
    })

    const data = await response.json()

    if (!response.ok) {
      foundSubTask.complete = !foundSubTask.complete
      throw new Error(data.error || 'Failed to update subtask')
    }

  } catch (err) {
    toast.error(err.message)
  }
}

// Toggle all subtasks at once
const toggleAllSubtasks = async (task, complete) => {
  try {
    // Update all subtasks
    for (const subtask of task.subtasks) {
      // Optimistically update UI
      subtask.complete = complete
      
      // Send update to server
      await fetchAPI(`/api/tasks/${task.id}/subtasks/${subtask.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          complete: complete
        })
      })
    }
    
    const action = complete ? 'completed' : 'marked incomplete'
    toast.success(`All subtasks ${action}!`)
    
  } catch (err) {
    toast.error(err.message)
    // Refresh to restore correct state
    fetchTasks()
  } finally {
  }
}

// Check if a subtask is locked due to dependencies
const isSubtaskLocked = (task, subtask) => {
  if (!subtask.dependsOn || subtask.complete) return false
  
  const dependentSubtask = task.subtasks.find(s => s.id === subtask.dependsOn)
  return dependentSubtask && !dependentSubtask.complete
}

// Get the title of the dependent subtask
const getDependentSubtaskTitle = (task, dependsOnId) => {
  const dependentSubtask = task.subtasks.find(s => s.id === dependsOnId)
  return dependentSubtask?.title || 'Unknown'
}

const deleteSubtask = async (taskId, subtaskId, fromButton = false) => {
  // Find the task and subtask
  const foundTask = Array.from(tasks.value).find((task) => task.id === taskId)
  const foundSubtask = foundTask?.subtasks.find((sub) => sub.id === subtaskId)
  
  // If subtask is locked and click didn't come from button, don't allow deletion
  if (!fromButton && foundSubtask && isSubtaskLocked(foundTask, foundSubtask)) {
    return
  }
  
  $q.dialog({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this subtask?',
    cancel: true,
    persistent: true,
    color: 'red'
  }).onOk(async () => {
    try {
      const response = await fetchAPI(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete subtask')
      }

      toast.success('Subtask deleted successfully!')
      fetchTasks()

    } catch (err) {
      toast.error(err.message)
    }
  })
}

const toggleTask = async (task) => {
  // Check if task is being marked as complete and has incomplete subtasks
  if (!task.complete && task.subtasks && task.subtasks.length > 0) {
    const incompleteSubtasks = task.subtasks.filter(s => !s.complete)
    
    if (incompleteSubtasks.length > 0) {
      // Show dialog asking user what to do
      $q.dialog({
        title: 'Incomplete Subtasks',
        message: `This task has ${incompleteSubtasks.length} incomplete subtask(s). Do you want to mark the task as complete?`,
        cancel: {
          label: 'Cancel',
          color: 'grey',
          flat: true
        },
        ok: {
          label: 'Mark Complete',
          color: 'teal'
        },
        options: {
          type: 'checkbox',
          model: [],
          items: [
            { label: 'Also complete all subtasks', value: 'completeSubtasks', color: 'teal' }
          ]
        },
        persistent: true
      }).onOk(async (data) => {
        // If user checked the option, complete all subtasks first
        if (data && data.includes('completeSubtasks')) {
          // Update all subtasks to complete
          for (const subtask of incompleteSubtasks) {
            try {
              await fetchAPI(`/api/tasks/${task.id}/subtasks/${subtask.id}`, {
                method: 'PUT',
                body: JSON.stringify({ complete: true })
              })
              subtask.complete = true
            } catch (err) {
              console.error('Failed to complete subtask:', err)
            }
          }
        }
        
        // Now mark task as complete and update
        task.complete = false
        celebrate(task)
        
        // Update the parent task
        try {
          const response = await fetchAPI(`/api/tasks/${task.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              title: task.title,
              description: task.description,
              dueDate: task.dueDate,
              complete: task.complete,
              priority: task.priority
            })
          })
          
          const responseData = await response.json()
          
          if (!response.ok) {
            throw new Error(responseData.error || 'Failed to update task')
          }
        } catch (err) {
          fetchTasks()
          $q.notify({
            type: 'negative',
            message: err.message,
            position: 'top'
          })
        }
      }).onCancel(() => {
        // Do nothing, checkbox stays unchecked
      })
      
      return // Exit early, don't proceed with normal toggle
    }
  }
  
  // Normal toggle logic (no incomplete subtasks or task being uncompleted)
  if(task.complete === false) {
    celebrate(task)
  } else {
    task.complete = !task.complete
  }

  try {
    const response = await fetchAPI(`/api/tasks/${task.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        complete: task.complete,
        priority: task.priority
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update task')
    }
  } catch (err) {
    fetchTasks()
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
    persistent: true,
    color: 'red'
  }).onOk(async () => {
    const set = new Set(Array.from(tasks.value).filter(obj => obj.id !== task.id))
    tasks.value = set;
    try {
      const response = await fetchAPI(`/api/tasks/${task.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete task')
      }

      // Refresh tasks list
      toast.success(`${task.title} deleted successfully`)
   
      // fetchTasks()

    } catch (err) {
      fetchTasks()
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
    // Check if the new filter would result in 0 tasks
    let testFiltered = Array.from(tasks.value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Apply the same filter logic to test
    switch (newVal) {
      case 'completed':
        testFiltered = testFiltered.filter(task => task.complete)
        break
      case 'pending':
        testFiltered = testFiltered.filter(task => !task.complete)
        break
      case 'overdue':
        testFiltered = testFiltered.filter(task => {
          if (!task.dueDate || task.complete) return false
          const [year, month, day] = task.dueDate.split('-')
          const dueDate = new Date(year, month - 1, day)
          return dueDate < today
        })
        break
      case 'today':
        testFiltered = testFiltered.filter(task => {
          if (!task.dueDate) return false
          const [year, month, day] = task.dueDate.split('-')
          const dueDate = new Date(year, month - 1, day)
          return dueDate.getTime() === today.getTime()
        })
        break
      case 'week':
        const weekFromNow = new Date()
        weekFromNow.setDate(today.getDate() + 7)
        testFiltered = testFiltered.filter(task => {
          if (!task.dueDate) return false
          const [year, month, day] = task.dueDate.split('-')
          const dueDate = new Date(year, month - 1, day)
          return dueDate >= today && dueDate <= weekFromNow
        })
        break
      case 'low':
        testFiltered = testFiltered.filter(task => task.priority === 'Low')
        break
      case 'medium':
        testFiltered = testFiltered.filter(task => task.priority === 'Medium')
        break
      case 'high':
        testFiltered = testFiltered.filter(task => task.priority === 'High')
        break
    }
    
    // If no results, revert to previous filter and show toast
    if (tasks.value.size > 0 && testFiltered.length === 0) {
      const filterLabel = filterOptions.find(opt => opt.value === newVal)?.label || newVal
      toast.info(`No ${filterLabel} tasks found.`)
      // Revert to the old filter value
      selectedFilter.value = oldVal
    } else {
      // Update localStorage only if filter is applied successfully
      localStorage.setItem('filter', newVal)
    }
  }
})
</script>

<style>

.container {margin:50px auto; max-width:1200px; padding-inline: 15px;}
.filter-container{display: flex;justify-content: space-between; gap:15px;}

/* Search input styles with smooth expansion */
.search-input {
  width: 200px;
  max-width: 200px;
  transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input.search-expanded {
  width: 500px;
  max-width: 500px;
}

/* Active task pulsating border */
.task-active {
  border-left: 4px solid #21baa0 !important;
  animation: pulse-border 2s ease-in-out infinite;
}

.page-container{opacity: 0; animation: fade-page 300ms linear forwards;}
.custom-card{transform: translateY(300px);transform: scale(1.3);animation: page-load 300ms linear forwards}
@keyframes pulse-border {
  0%, 100% {
    border-left-color: #21BA45;
  }
  50% {
    border-left-color: #4ade80;
  }
}
@keyframes fade-page {
  from {opacity: 0;} 
  to {opacity: 1;}
}
@keyframes page-load {to{transform: translateY(0px); transform: scale(1);}}

@media(max-width:560px) {.filter-container{flex-direction: column;}}
/* .page-container {
  background-image: url('/assets/sci_fi_bg.jpg');
  background-size: cover;
  position: relative;
}
.page-container::before {
  position: absolute;
  content: '';
  inset: 0;
  height: 100%;
  width:100%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(15px);
} */
 .bg-light-mode {
  background-color: #f0f0f0;
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%23d9e0e0' fill-opacity='0.4' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V2h-58.1zm0 96a5 5 0 1 1 0-2H137l32-32h39V21.9a5 5 0 1 1 2 0V66h-40.17l-32 32H117.9zm28.1 90.1a5 5 0 1 1-2 0v-76.51L175.59 80H224V21.9a5 5 0 1 1 2 0V82h-49.59L146 112.41v75.69zm16 32a5 5 0 1 1-2 0v-99.51L184.59 96H300.1a5 5 0 0 1 3.9-3.9v2.07a3 3 0 0 0 0 5.66v2.07a5 5 0 0 1-3.9-3.9H185.41L162 121.41v98.69zm-144-64a5 5 0 1 1-2 0v-3.51l48-48V48h32V0h2v50H66v55.41l-48 48v2.69zM50 53.9v43.51l-48 48V208h26.1a5 5 0 1 1 0 2H0v-65.41l48-48V53.9a5 5 0 1 1 2 0zm-16 16V89.41l-34 34v-2.82l32-32V69.9a5 5 0 1 1 2 0zM12.1 32a5 5 0 1 1 0 2H9.41L0 43.41V40.6L8.59 32h3.51zm265.8 18a5 5 0 1 1 0-2h18.69l7.41-7.41v2.82L297.41 50H277.9zm-16 160a5 5 0 1 1 0-2H288v-71.41l16-16v2.82l-14 14V210h-28.1zm-208 32a5 5 0 1 1 0-2H64v-22.59L40.59 194H21.9a5 5 0 1 1 0-2H41.41L66 216.59V242H53.9zm150.2 14a5 5 0 1 1 0 2H96v-56.6L56.6 162H37.9a5 5 0 1 1 0-2h19.5L98 200.6V256h106.1zm-150.2 2a5 5 0 1 1 0-2H80v-46.59L48.59 178H21.9a5 5 0 1 1 0-2H49.41L82 208.59V258H53.9zM34 39.8v1.61L9.41 66H0v-2h8.59L32 40.59V0h2v39.8zM2 300.1a5 5 0 0 1 3.9 3.9H3.83A3 3 0 0 0 0 302.17V256h18v48h-2v-46H2v42.1zM34 241v63h-2v-62H0v-2h34v1zM17 18H0v-2h16V0h2v18h-1zm273-2h14v2h-16V0h2v16zm-32 273v15h-2v-14h-14v14h-2v-16h18v1zM0 92.1A5.02 5.02 0 0 1 6 97a5 5 0 0 1-6 4.9v-2.07a3 3 0 1 0 0-5.66V92.1zM80 272h2v32h-2v-32zm37.9 32h-2.07a3 3 0 0 0-5.66 0h-2.07a5 5 0 0 1 9.8 0zM5.9 0A5.02 5.02 0 0 1 0 5.9V3.83A3 3 0 0 0 3.83 0H5.9zm294.2 0h2.07A3 3 0 0 0 304 3.83V5.9a5 5 0 0 1-3.9-5.9zm3.9 300.1v2.07a3 3 0 0 0-1.83 1.83h-2.07a5 5 0 0 1 3.9-3.9zM97 100a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-48 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 96a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-144a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM49 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM33 68a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 240a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm80-176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm112 176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 180a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 84a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'%3E%3C/path%3E%3C/svg%3E");
 }
 .bg-dark-mode{
  background-color: #000000;
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%23041717' fill-opacity='1' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V2h-58.1zm0 96a5 5 0 1 1 0-2H137l32-32h39V21.9a5 5 0 1 1 2 0V66h-40.17l-32 32H117.9zm28.1 90.1a5 5 0 1 1-2 0v-76.51L175.59 80H224V21.9a5 5 0 1 1 2 0V82h-49.59L146 112.41v75.69zm16 32a5 5 0 1 1-2 0v-99.51L184.59 96H300.1a5 5 0 0 1 3.9-3.9v2.07a3 3 0 0 0 0 5.66v2.07a5 5 0 0 1-3.9-3.9H185.41L162 121.41v98.69zm-144-64a5 5 0 1 1-2 0v-3.51l48-48V48h32V0h2v50H66v55.41l-48 48v2.69zM50 53.9v43.51l-48 48V208h26.1a5 5 0 1 1 0 2H0v-65.41l48-48V53.9a5 5 0 1 1 2 0zm-16 16V89.41l-34 34v-2.82l32-32V69.9a5 5 0 1 1 2 0zM12.1 32a5 5 0 1 1 0 2H9.41L0 43.41V40.6L8.59 32h3.51zm265.8 18a5 5 0 1 1 0-2h18.69l7.41-7.41v2.82L297.41 50H277.9zm-16 160a5 5 0 1 1 0-2H288v-71.41l16-16v2.82l-14 14V210h-28.1zm-208 32a5 5 0 1 1 0-2H64v-22.59L40.59 194H21.9a5 5 0 1 1 0-2H41.41L66 216.59V242H53.9zm150.2 14a5 5 0 1 1 0 2H96v-56.6L56.6 162H37.9a5 5 0 1 1 0-2h19.5L98 200.6V256h106.1zm-150.2 2a5 5 0 1 1 0-2H80v-46.59L48.59 178H21.9a5 5 0 1 1 0-2H49.41L82 208.59V258H53.9zM34 39.8v1.61L9.41 66H0v-2h8.59L32 40.59V0h2v39.8zM2 300.1a5 5 0 0 1 3.9 3.9H3.83A3 3 0 0 0 0 302.17V256h18v48h-2v-46H2v42.1zM34 241v63h-2v-62H0v-2h34v1zM17 18H0v-2h16V0h2v18h-1zm273-2h14v2h-16V0h2v16zm-32 273v15h-2v-14h-14v14h-2v-16h18v1zM0 92.1A5.02 5.02 0 0 1 6 97a5 5 0 0 1-6 4.9v-2.07a3 3 0 1 0 0-5.66V92.1zM80 272h2v32h-2v-32zm37.9 32h-2.07a3 3 0 0 0-5.66 0h-2.07a5 5 0 0 1 9.8 0zM5.9 0A5.02 5.02 0 0 1 0 5.9V3.83A3 3 0 0 0 3.83 0H5.9zm294.2 0h2.07A3 3 0 0 0 304 3.83V5.9a5 5 0 0 1-3.9-5.9zm3.9 300.1v2.07a3 3 0 0 0-1.83 1.83h-2.07a5 5 0 0 1 3.9-3.9zM97 100a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-48 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 96a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-144a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM49 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM33 68a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 240a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm80-176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm112 176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 180a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 84a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'%3E%3C/path%3E%3C/svg%3E");
 }

/* Sortable.js drag-and-drop styles */
.sortable-ghost {
  opacity: 0.4;
  background: rgba(200, 200, 200, 0.3);
}

.sortable-drag {
  opacity: 0.8;
  cursor: grabbing !important;
}

.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

</style>