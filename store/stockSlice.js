import { createSlice } from "@reduxjs/toolkit";


const initialState = {
   overview: null,
   quotes: null,
   timeSeriess: null
}

const stockSlice = createSlice({
    name: 'stock',
    initialState,
    reducers:{
        stockOverView: (store, action)=>{
            store.overview = action.payload
        },
        stockQuote: (store, action)=>{
            store.quotes = action.payload
        },
        stockTimeSeries: (store, action)=>{
            store.timeSeriess = action.payload
        },
    }

})


export const {stockOverView, stockQuote, stockTimeSeries} = stockSlice.actions;
export default stockSlice.reducer;