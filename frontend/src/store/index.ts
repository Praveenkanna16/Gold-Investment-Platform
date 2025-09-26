import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import goldReducer from './slices/goldSlice'
import txReducer from './slices/transactionsSlice'
import sipReducer from './slices/sipSlice'
import settingsReducer from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    gold: goldReducer,
    transactions: txReducer,
    sip: sipReducer,
    settings: settingsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
