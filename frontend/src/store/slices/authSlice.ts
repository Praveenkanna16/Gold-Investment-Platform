import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

interface AuthState {
  accessToken: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', payload)
      return data as { accessToken: string }
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Login failed')
    }
  },
)

export const register = createAsyncThunk(
  'auth/register',
  async (
    payload: { email: string; password: string; firstName: string; lastName: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post('/auth/register', payload)
      return data as { accessToken: string }
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Registration failed')
    }
  },
)

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.accessToken = null
      localStorage.removeItem('accessToken')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.accessToken = action.payload.accessToken
        localStorage.setItem('accessToken', action.payload.accessToken)
      })
      .addCase(login.rejected, (state, action: any) => {
        state.loading = false
        state.error = action.payload || 'Login failed'
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.accessToken = action.payload.accessToken
        localStorage.setItem('accessToken', action.payload.accessToken)
      })
      .addCase(register.rejected, (state, action: any) => {
        state.loading = false
        state.error = action.payload || 'Registration failed'
      })
  },
})

export const { logout } = slice.actions
export default slice.reducer
