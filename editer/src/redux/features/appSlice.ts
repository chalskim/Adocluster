// src/redux/features/appSlice.ts

// 'PayloadAction'은 타입이므로, 'type' 키워드를 붙여서 가져옵니다.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 이 슬라이스가 관리할 상태(state)의 타입을 정의합니다.
interface AppState {
  appName: string;
  version: number;
}

// 상태의 초기값을 정의합니다.
const initialState: AppState = {
  appName: 'My React Editor',
  version: 1,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setVersion: (state, action: PayloadAction<number>) => {
      state.version = action.payload;
    },
  },
});

export const { setVersion } = appSlice.actions;

export default appSlice.reducer;