import React from 'react'
import ReactDOM from 'react-dom/client'
import FrontHero from './FrontHero'
import BioComputeGrid from './BioComputeGrid'
import SynapseXSection from './SynapseXSection'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FrontHero />
    <BioComputeGrid />
    <SynapseXSection />
  </React.StrictMode>,
)
