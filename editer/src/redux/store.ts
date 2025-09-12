// src/redux/store.ts

import { configureStore } from '@reduxjs/toolkit';
// 1. 방금 만든 appSlice의 리듀서를 import 합니다.
import appReducer from './features/appSlice';

export const store = configureStore({
  reducer: {
    // 2. 'app'이라는 이름으로 리듀서를 등록합니다.
    app: appReducer,
    // 앞으로 만들 다른 리듀서들도 여기에 추가하면 됩니다.
    // user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;