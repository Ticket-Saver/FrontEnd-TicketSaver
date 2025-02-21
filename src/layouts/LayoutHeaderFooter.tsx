import React, { ReactNode } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

interface LayoutProps {
  children: ReactNode
}

const LayoutHeaderFooter: React.FC<LayoutProps> = ({ children }) => (
  <div data-theme="synthwave">
    <Header />
    {children}
    <Footer />
  </div>
)

export default LayoutHeaderFooter
