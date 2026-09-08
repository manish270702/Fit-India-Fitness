import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: [],
}

export const PlansSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    mountPlans: (state,action) => {
      state.value = action.payload
    },
    unMountPlans:(state) => {
      state.value = []
    },
    AddPlan: (state,action)=>{
        state.value.push(action.payload);
    },
    UpdatePlan: (state, action) => {
      state.value = state.value.map((plan) =>
        plan._id === action.payload._id ? action.payload : plan
      )
    },
    RemovePlan: (state, action) => {
      state.value = state.value.filter(
        (plan) => plan._id !== action.payload
      )
    }
  },
})

// Action creators are generated for each case reducer function
export const { mountPlans,unMountPlans,AddPlan,UpdatePlan,RemovePlan } = PlansSlice.actions

export default PlansSlice.reducer