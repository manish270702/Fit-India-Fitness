import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: [],
}

export const PaymentsSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    mountPayments: (state,action) => {
      state.value = action.payload
    },
    AddPayment: (state,action)=>{
        state.value.push(action.payload);
    },
  },
})

// Action creators are generated for each case reducer function
export const { mountPayments, AddPayment } = PaymentsSlice.actions

export default PaymentsSlice.reducer