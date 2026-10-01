import axios from 'axios'
import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store } from './store/Store.js'
import { Provider } from 'react-redux'
import DataLoader from './components/DataLoader.jsx'
import { unMountToken } from './store/Slice/Token.Slice'
import { unMountUser } from './store/Slice/User.Slice'

const clearAuthState = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('fitgym_user')
  store.dispatch(unMountToken())
  store.dispatch(unMountUser())
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401 || status === 403) {
      clearAuthState()

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <DataLoader>
        <App />
      </DataLoader>
    </BrowserRouter>,
  </Provider>
)
