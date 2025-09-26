import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../services/api'

interface GoldPrice {
  pricePerGram: number
}

interface PricePoint {
  time: string // e.g., '14:05'
  price: number
}

interface GoldState {
  price: GoldPrice | null
  priceHistory: PricePoint[]
  balance: number
  loading: boolean
  error: string | null
}

const initialState: GoldState = {
  price: null,
  priceHistory: [],
  balance: 0,
  loading: false,
  error: null,
}

export const fetchPrice = createAsyncThunk('gold/price', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/gold/price')
    return data
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to fetch price')
  }
})

export const fetchBalance = createAsyncThunk('gold/balance', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/gold/balance')
    return data
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to fetch balance')
  }
})

export const initiateBuy = createAsyncThunk(
  'gold/buy',
  async (amount: number, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/gold/buy', { amount })
      return data
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to initiate buy')
    }
  },
)

const slice = createSlice({
  name: 'gold',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPrice.fulfilled, (state, action) => {
        state.loading = false
        state.price = action.payload as GoldPrice

        // push to history (keep last 60 points ~ 10 mins at 10s interval)
        const now = new Date()
        const label = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const priceNum = Number((action.payload as any)?.pricePerGram) || 0
        // avoid duplicate consecutive timestamps when immediate + interval fire quickly
        const last = state.priceHistory[state.priceHistory.length - 1]
        if (!last || last.time !== label || last.price !== priceNum) {
          state.priceHistory.push({ time: label, price: priceNum })
          if (state.priceHistory.length > 60) state.priceHistory.shift()
        }
      })
      .addCase(fetchPrice.rejected, (state, action: any) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch price'
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.balance = action.payload?.goldBalance ?? 0
      })
  },
})

export default slice.reducer
