import { configureStore } from "@reduxjs/toolkit";
import stockSlice from "./stockSlice"
import pressReleaseStock from "./pressReleaseSlice"

const store = configureStore({
    reducer:{
        stock: stockSlice,
        press: pressReleaseStock
    }
})

export default store;