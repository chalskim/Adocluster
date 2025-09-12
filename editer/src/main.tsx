// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css';
import { store } from './redux/store' 
import { Provider } from 'react-redux' // Provider import

ReactDOM.createRoot(document.getElementById('root')!).render( // 여기에 ! 추가
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
