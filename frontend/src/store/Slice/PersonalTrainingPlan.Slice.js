import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
    name: "personalTrainingPlans",
    initialState: { value: [] },
    reducers: {
        mountPersonalTrainingPlans: (state, action) => { state.value = action.payload; },
        addPersonalTrainingPlan: (state, action) => { state.value.push(action.payload); },
        updatePersonalTrainingPlan: (state, action) => {
            state.value = state.value.map((plan) => plan._id === action.payload._id ? action.payload : plan);
        },
        removePersonalTrainingPlan: (state, action) => {
            state.value = state.value.filter((plan) => plan._id !== action.payload);
        },
    },
});

export const {
    mountPersonalTrainingPlans,
    addPersonalTrainingPlan,
    updatePersonalTrainingPlan,
    removePersonalTrainingPlan,
} = slice.actions;
export default slice.reducer;