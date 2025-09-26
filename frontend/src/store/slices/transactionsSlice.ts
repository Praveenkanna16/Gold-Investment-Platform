import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../services/api'

interface TxState {
  items: any[]
  loading: boolean
  error: string | null
}

const initialState: TxState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchTransactions = createAsyncThunk('transactions/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/transactions')
    return data as any[]
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load transactions')
  }
})

const slice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchTransactions.rejected, (state, action: any) => {
        state.loading = false
        state.error = action.payload || 'Failed to load transactions'
      })
  },
})

export default slice.reducer
