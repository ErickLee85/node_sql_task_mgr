<template>
  <div class="flex flex-center" style="min-height: 100vh" :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-2'">
    <q-card style="width: 400px; max-width: 90vw">
      <q-card-section>
        <div class="text-h5 text-center" style="text-transform: uppercase;">Login</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
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

          <q-checkbox
            v-model="rememberMe"
            label="Remember me"
            color="teal"
          />

          <div class="q-mt-md">
            <q-btn
              label="Login"
              type="submit"
               class="full-width"
               color="teal"
              :loading="loading"
            >
            <template #loading>
                <q-spinner-pie />
            </template>
            </q-btn>
          </div>

          <div class="text-center q-mt-lg">
            <span class="text-grey-7" style="margin-right: 10px;">Don't have an account?</span>
            <q-btn
              class="q-pa-sm"
              flat
              dense
              label="Register"
              @click="$router.push('/register')"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

// Load saved email on mount if "remember me" was checked
onMounted(() => {
  const savedEmail = localStorage.getItem('rememberedEmail')
  if (savedEmail) {
    form.value.email = savedEmail
    rememberMe.value = true
  }
})

  const liveUrl = 'https://nodesqltaskmgr-production.up.railway.app'
  const localUrl = 'http://localhost:1005'

const onSubmit = async () => {
  loading.value = true
  
  try {
    const response = await fetch(`${liveUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: form.value.email,
        password: form.value.password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    // Store token and user data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    // Handle "Remember Me" functionality
    if (rememberMe.value) {
      localStorage.setItem('rememberedEmail', form.value.email)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

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
