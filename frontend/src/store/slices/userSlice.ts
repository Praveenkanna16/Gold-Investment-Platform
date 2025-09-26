import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../services/api'

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  role?: string
  goldBalance?: number
}

interface UserState {
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
}

export const fetchMe = createAsyncThunk('user/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/users/me')
    return data as UserProfile
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load profile')
  }
})

export const updateProfile = createAsyncThunk(
  'user/update',
  async (payload: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/users/me', payload)
      return data as UserProfile
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to update profile')
    }
  },
)

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(fetchMe.rejected, (state, action: any) => {
        state.loading = false
        state.error = action.payload || 'Failed to load profile'
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload
      })
  },
})

export default slice.reducer
