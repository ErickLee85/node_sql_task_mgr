import { boot } from 'quasar/wrappers'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default boot(({ app }) => {
  const options = {
    // You can set your default options here
    position: 'bottom-right',
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false
  }

  app.use(Toast, options)
})
