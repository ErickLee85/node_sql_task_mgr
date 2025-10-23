<template>
  <q-layout view="lHh Lpr lff">
    <q-header bordered :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
      <q-toolbar>
        <div class="col">
          <div class="row items-center q-gutter-sm">
            <q-btn-dropdown
              flat
              dense
              icon="settings"
              :color="$q.dark.isActive ? 'white' : 'grey-7'"
            >
              <q-list>
                <q-item clickable v-close-popup @click="showChangePasswordDialog = true">
                  <q-item-section avatar>
                    <q-icon name="lock" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Change Password</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-separator />
                
                <q-item clickable v-close-popup @click="showDeleteAccountDialog = true">
                  <q-item-section avatar>
                    <q-icon name="delete_forever" color="red" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-red">Delete Account</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <div v-if="!$q.platform.is.mobile" :class="$q.dark.isActive ? 'text-white' : 'text-grey-7'">
              <span class="text-weight-bold">Welcome</span>, {{ user?.name }}
            </div>
          </div>
        </div>

        <q-space />

        <div style="display:flex; gap:5px;">
          <q-btn
            size="md"
            dense
            flat
            :color="$q.dark.isActive ? 'white' : 'grey-7'"
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            @click="$q.dark.toggle()"
          />
          <q-btn
            icon="logout"
            :color="$q.dark.isActive ? 'white' : 'grey-7'"
            @click="logout"
            label="Exit"
            flat
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Change Password Dialog -->
    <q-dialog v-model="showChangePasswordDialog" backdrop-filter="blur(1px)">
      <q-card style="min-width: 400px">
        <q-card-section class="flex justify-between items-center">
          <div class="text-h6">Change Password</div>
          <q-btn round flat icon="close" @click="closeChangePasswordDialog" />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="changePassword" class="q-gutter-md">
            <q-input
              v-model="passwordForm.currentPassword"
              label="Current Password"
              :type="showCurrentPassword ? 'text' : 'password'"
              filled
              dense
            >
              <template v-slot:append>
                <q-icon
                  :name="showCurrentPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showCurrentPassword = !showCurrentPassword"
                />
              </template>
            </q-input>

            <q-input
              v-model="passwordForm.newPassword"
              label="New Password"
              :type="showNewPassword ? 'text' : 'password'"
              filled
              dense
            >
              <template v-slot:append>
                <q-icon
                  :name="showNewPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showNewPassword = !showNewPassword"
                />
              </template>
            </q-input>

            <q-input
              v-model="passwordForm.confirmPassword"
              label="Confirm New Password"
              :type="showConfirmPassword ? 'text' : 'password'"
              filled
              dense
            >
              <template v-slot:append>
                <q-icon
                  :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </q-input>

            <q-separator />
            <div class="row justify-end">
              <q-btn
                label="Cancel"
                flat
                color="grey-7"
                @click="closeChangePasswordDialog"
                style="margin-right:5px;"
              />
              <q-btn
                label="Change Password"
                type="submit"
                color="primary"
                flat
                :loading="changingPassword"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Account Dialog -->
    <q-dialog v-model="showDeleteAccountDialog" backdrop-filter="blur(1px)">
      <q-card style="min-width: 400px">
        <q-card-section class="flex justify-between items-center">
          <div class="text-h6 text-red">Delete Account</div>
          <q-btn round flat icon="close" @click="closeDeleteAccountDialog" />
        </q-card-section>

        <q-card-section>
          <div class="text-body1 q-mb-lg">
            This action cannot be undone. All your tasks will be permanently deleted.
          </div>
          
          <q-form @submit="deleteAccount" class="q-gutter-md">
            <q-input
              v-model="deleteAccountPassword"
              label="Enter your password to confirm"
              :type="showDeletePassword ? 'text' : 'password'"
              filled
              dense
              :rules="[val => !!val || 'Password is required']"
            >
              <template v-slot:append>
                <q-icon
                  :name="showDeletePassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showDeletePassword = !showDeletePassword"
                />
              </template>
            </q-input>

            <q-separator />
            <div class="row justify-end">
              <q-btn
                label="Cancel"
                flat
                color="grey-7"
                @click="closeDeleteAccountDialog"
                style="margin-right:5px;"
              />
              <q-btn
                label="Delete Account"
                type="submit"
                color="red"
                :loading="deletingAccount"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

// Settings dialog states
const showChangePasswordDialog = ref(false)
const showDeleteAccountDialog = ref(false)
const changingPassword = ref(false)
const deletingAccount = ref(false)

// Password visibility states
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const showDeletePassword = ref(false)

// Form data
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const deleteAccountPassword = ref('')

const user = computed(() => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
})

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const closeChangePasswordDialog = () => {
  showChangePasswordDialog.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

const changePassword = async () => {
  // Validate passwords match
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    $q.notify({
      type: 'negative',
      message: 'New passwords do not match',
      position: 'top'
    })
    return
  }

  changingPassword.value = true
  const liveUrl = 'https://nodesqltaskmgr-production.up.railway.app'
  const localUrl = 'http://localhost:1005'
  
  try {
    const response = await fetch(`${localUrl}/api/user/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to change password')
    }

    $q.notify({
      type: 'positive',
      message: 'Password changed successfully!',
      position: 'top'
    })

    closeChangePasswordDialog()

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message,
      position: 'top'
    })
  } finally {
    changingPassword.value = false
  }
}

const closeDeleteAccountDialog = () => {
  showDeleteAccountDialog.value = false
  deleteAccountPassword.value = ''
  showDeletePassword.value = false
}

const deleteAccount = async () => {
  deletingAccount.value = true
  
  try {
    const response = await fetch(`${localUrl}/api/user/account`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        password: deleteAccountPassword.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete account')
    }

    $q.notify({
      type: 'positive',
      message: 'Account deleted successfully',
      position: 'top'
    })

    closeDeleteAccountDialog()
    logout()

  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message,
      position: 'top'
    })
  } finally {
    deletingAccount.value = false
  }
}
</script>
