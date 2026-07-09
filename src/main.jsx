import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LemonadeHero from './LemonadeHero.jsx'
import { BrowserRouter, Route, Routes } from "react-router"
import SourcePage from './SourcePage.jsx'
import SourceCategoryPage from './SourceCategoryPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LemonadeHero></LemonadeHero>}></Route>
        <Route path='/notebook' element={<App></App>}></Route>
        <Route path="/sources/:uid" element={<SourcePage />} />
        <Route path="/notebook/category/:sourceType" element={<SourceCategoryPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
