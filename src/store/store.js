import {configureStore} from "@reduxjs/toolkit";

import folderSlice from "@store/folderSlice.js";

export default configureStore({
    reducer: {
        folder: folderSlice
    }
});