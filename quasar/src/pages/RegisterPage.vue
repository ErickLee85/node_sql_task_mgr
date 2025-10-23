<template>
  <div class="flex flex-center background" style="min-height: 100vh" :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-2'">
    <q-card style="width: 400px; max-width: 90vw">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

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

const onSubmit = async () => {
  loading.value = true
  
  try {
    const response = await fetch('http://localhost:1005/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
