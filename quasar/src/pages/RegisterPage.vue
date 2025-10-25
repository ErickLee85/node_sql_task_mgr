<template>
  <div class="flex flex-center background" style="min-height: 100vh" :class="$q.dark.isActive ? 'custom-dark-bg' : 'custom-light-bg'">
    <q-card style="width: 400px; max-width: 90vw" class="shadow-12 rounded">
      <q-card-section>
        <div class="text-h5 text-center">Create Account</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Full Name"
            filled
            dense
            color="teal"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            filled
            dense
            color="teal"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="form.phone"
            label="Phone (optional)"
            filled
            dense
            color="teal"
            mask="(###) ### - ####"
            fill-mask
          >
            <template v-slot:prepend>
              <q-icon name="phone" />
            </template>
          </q-input>

          <q-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            filled
            dense
            color="teal"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
          
          <!-- Password Strength Meter -->
          <div v-if="form.password" class="q-mt-sm">
            <div class="text-caption text-grey-7 q-mb-xs">Password Strength: {{ passwordStrength.label }}</div>
            <q-linear-progress 
              :value="passwordStrength.value" 
              :color="passwordStrength.color"
              size="8px"
              rounded
            />
          </div>

          <div class="q-mt-md">
            <q-btn
              label="Register"
              type="submit"
              color="teal"
              class="full-width"
              :loading="loading"
            >
               <template v-slot:loading>
                    <q-spinner-pie />
                </template>
            </q-btn>
          </div>

          <div class="text-center q-mt-sm">
            <span class="text-grey-7" style="margin-right:10px;">Already have an account?</span>
            <q-btn
              flat
              dense
              label="Login"
              @click="$router.push('/login')"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { fetchAPI } from 'src/utils/api'

const router = useRouter()
const $q = useQuasar()

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)

// Password strength calculator
const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return { value: 0, label: '', color: 'grey' }

  let strength = 0
  
  // Length check
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  
  // Character variety checks
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  // Map strength to label and color
  if (strength <= 2) {
    return { value: 0.25, label: 'Weak', color: 'red' }
  } else if (strength <= 4) {
    return { value: 0.5, label: 'Fair', color: 'orange' }
  } else if (strength <= 5) {
    return { value: 0.75, label: 'Good', color: 'light-green' }
  } else {
    return { value: 1, label: 'Strong', color: 'green' }
  }
})

const onSubmit = async () => {
  loading.value = true
  
  try {
    const response = await fetchAPI('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        password: form.value.password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    // Store token and user data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    $q.notify({
      type: 'positive',
      message: 'Registration successful!',
      position: 'top'
    })

    // Redirect to tasks page
    router.push('/tasks')

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
</script>

<style>

</style>
