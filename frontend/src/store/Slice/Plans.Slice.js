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
    RemovePlan: (state,action)=>{
        state.value = state.filter(i=> i._id !== action.payload._id)
    }
  },
})

// Action creators are generated for each case reducer function
export const { mountPlans,unMountPlans,AddPlan,RemovePlan } = PlansSlice.actions

export default PlansSlice.reducer