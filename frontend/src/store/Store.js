import { configureStore } from '@reduxjs/toolkit'
import userReducer from "./Slice/User.Slice"
import tokenReducer from "./Slice/Token.Slice"
import planReducer from "./Slice/Plans.Slice"
import memberReducer from "./Slice/Members.Slice"
import paymentReducer from "./Slice/Payment.Slice"


export const store = configureStore({
  reducer: {
    user:userReducer,
    token:tokenReducer,
    plans:planReducer,
    members:memberReducer,
    payments:paymentReducer
  }
})