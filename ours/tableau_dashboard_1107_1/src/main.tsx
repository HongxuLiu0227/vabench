import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SelectionProvider } from './providers/SelectionProvider'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SelectionProvider>
        <App />
      </SelectionProvider>
    </BrowserRouter>
  </StrictMode>,
)
