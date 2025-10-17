import React from 'react'
import ReactDOM from 'react-dom/client'
import StreamlitComponent from './StreamlitComponent.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StreamlitComponent />
  </React.StrictMode>,
)