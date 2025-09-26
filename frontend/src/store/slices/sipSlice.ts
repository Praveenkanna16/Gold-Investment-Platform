import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../services/api'

export interface SIPItem {
  id: string
  userId?: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly'
  weeklyDay?: number
  monthlyDay?: number
  startDate: string
  status: 'active' | 'paused' | 'cancelled' | 'completed'
  nextRunAt?: string
  createdAt?: string
  updatedAt?: string
}

interface SIPState {
  items: SIPItem[]
  adminItems: SIPItem[]
  loading: boolean
  error: string | null
}

const initialState: SIPState = {
  items: [],
  adminItems: [],
  loading: false,
  error: null,
}

// User thunks
export const fetchSIPs = createAsyncThunk('sip/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/gold/sip')
    return data as SIPItem[]
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load SIPs')
  }
})

export const createSIP = createAsyncThunk('sip/create', async (payload: Partial<SIPItem>, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/gold/sip', payload)
    return data as SIPItem
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to create SIP')
  }
})

export const updateSIP = createAsyncThunk('sip/update', async ({ id, ...payload }: Partial<SIPItem> & { id: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/gold/sip/${id}`, payload)
    return data as SIPItem
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to update SIP')
  }
})

export const pauseSIP = createAsyncThunk('sip/pause', async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/gold/sip/${id}/pause`)
    return data as SIPItem
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to pause SIP')
  }
})

export const resumeSIP = createAsyncThunk('sip/resume', async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/gold/sip/${id}/resume`)
    return data as SIPItem
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to resume SIP')
  }
})

export const cancelSIP = createAsyncThunk('sip/cancel', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/gold/sip/${id}`)
    return id
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to cancel SIP')
  }
})

// Admin thunks
export const adminFetchSIPs = createAsyncThunk('sip/adminFetchAll', async (params: Record<string, any> | undefined, { rejectWithValue }) => {
  try {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    const { data } = await api.get(`/admin/sip${qs ? `?${qs}` : ''}`)
    return data as SIPItem[]
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load all SIPs')
  }
})

export const adminPauseSIP = createAsyncThunk('sip/adminPause', async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/admin/sip/${id}/pause`)
    return data as SIPItem
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to pause')
  }
})

export const adminResumeSIP = createAsyncThunk('sip/adminResume', async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/admin/sip/${id}/resume`)
    return data as SIPItem
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to resume')
  }
})

export const adminCancelSIP = createAsyncThunk('sip/adminCancel', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/sip/${id}`)
    return id
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to cancel')
  }
})

const sipSlice = createSlice({
  name: 'sip',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSIPs.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchSIPs.fulfilled, (s, a) => { s.loading = false; s.items = a.payload })
      .addCase(fetchSIPs.rejected, (s, a: any) => { s.loading = false; s.error = a.payload })

      .addCase(createSIP.fulfilled, (s, a) => { s.items.unshift(a.payload) })
      .addCase(updateSIP.fulfilled, (s, a) => {
        s.items = s.items.map(i => i.id === a.payload.id ? a.payload : i)
      })
      .addCase(pauseSIP.fulfilled, (s, a) => {
        s.items = s.items.map(i => i.id === a.payload.id ? a.payload : i)
      })
      .addCase(resumeSIP.fulfilled, (s, a) => {
        s.items = s.items.map(i => i.id === a.payload.id ? a.payload : i)
      })
      .addCase(cancelSIP.fulfilled, (s, a) => {
        s.items = s.items.filter(i => i.id !== a.payload)
      })

      .addCase(adminFetchSIPs.fulfilled, (s, a) => { s.adminItems = a.payload })
      .addCase(adminPauseSIP.fulfilled, (s, a) => { s.adminItems = s.adminItems.map(i => i.id === a.payload.id ? a.payload : i) })
      .addCase(adminResumeSIP.fulfilled, (s, a) => { s.adminItems = s.adminItems.map(i => i.id === a.payload.id ? a.payload : i) })
      .addCase(adminCancelSIP.fulfilled, (s, a) => { s.adminItems = s.adminItems.filter(i => i.id !== a.payload) })
  }
})

export default sipSlice.reducer
