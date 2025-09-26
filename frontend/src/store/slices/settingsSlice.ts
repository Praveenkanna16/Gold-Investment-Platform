import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../services/api'

export type BannerType = 'info' | 'warning' | 'success' | 'error'

export interface AdminSettings {
  maintenanceMode: boolean
  minBuyAmount: number
  priceSource: 'live' | 'manual'
  manualPrice?: number
  features: {
    buy: boolean
    sell: boolean
    sip: boolean
    admin: boolean
  }
  banner: {
    show: boolean
    text: string
    type: BannerType
  }
}

interface SettingsState {
  settings: AdminSettings | null
  loading: boolean
  error: string | null
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
}

export const fetchSettings = createAsyncThunk('settings/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/settings')
    return data as AdminSettings
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || 'Failed to load settings')
  }
})

export const updateSettings = createAsyncThunk('settings/update', async (payload: Partial<AdminSettings>, { rejectWithValue }) => {
  try {
    const { data } = await api.patch('/admin/settings', payload)
    return data as AdminSettings
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || 'Failed to update settings')
  }
})

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchSettings.fulfilled, (s, a) => { s.loading = false; s.settings = a.payload })
      .addCase(fetchSettings.rejected, (s, a: any) => { s.loading = false; s.error = a.payload })
      .addCase(updateSettings.fulfilled, (s, a) => { s.settings = a.payload })
  },
})

export default settingsSlice.reducer
