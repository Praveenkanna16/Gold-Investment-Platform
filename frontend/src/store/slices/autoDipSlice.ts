import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../services/api'

export type AutoDipTriggerType = 'price_drop_percent' | 'price_drop_absolute'
export type AutoDipStatus = 'active' | 'paused'

export interface AutoDipRule {
  id: string
  triggerType: AutoDipTriggerType
  thresholdValue: number
  buyAmountInINR: number
  cooldownHours: number
  lastTriggeredAt?: string | null
  status: AutoDipStatus
  createdAt?: string
  updatedAt?: string
}

interface AutoDipState {
  rules: AutoDipRule[]
  loading: boolean
  error: string | null
}

const initialState: AutoDipState = {
  rules: [],
  loading: false,
  error: null,
}

export const fetchAutoDipRules = createAsyncThunk('autoDip/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/gold/auto-dip')
    return data as AutoDipRule[]
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load Auto-Dip rules')
  }
})

export const createAutoDipRule = createAsyncThunk('autoDip/create', async (payload: Partial<AutoDipRule>, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/gold/auto-dip', payload)
    return data as AutoDipRule
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to create Auto-Dip rule')
  }
})

export const updateAutoDipRule = createAsyncThunk('autoDip/update', async ({ id, ...patch }: Partial<AutoDipRule> & { id: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/gold/auto-dip/${id}`, patch)
    return data as AutoDipRule
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to update Auto-Dip rule')
  }
})

export const deleteAutoDipRule = createAsyncThunk('autoDip/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/gold/auto-dip/${id}`)
    return id
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to delete Auto-Dip rule')
  }
})

const autoDipSlice = createSlice({
  name: 'autoDip',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAutoDipRules.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchAutoDipRules.fulfilled, (s, a) => { s.loading = false; s.rules = a.payload })
      .addCase(fetchAutoDipRules.rejected, (s, a: any) => { s.loading = false; s.error = a.payload })

      .addCase(createAutoDipRule.fulfilled, (s, a) => { s.rules.unshift(a.payload) })
      .addCase(updateAutoDipRule.fulfilled, (s, a) => { s.rules = s.rules.map(r => r.id === a.payload.id ? a.payload : r) })
      .addCase(deleteAutoDipRule.fulfilled, (s, a) => { s.rules = s.rules.filter(r => r.id !== a.payload) })
  }
})

export default autoDipSlice.reducer
