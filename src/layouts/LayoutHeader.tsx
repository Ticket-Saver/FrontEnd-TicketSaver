import React, { ReactNode } from 'react'
import Header from '../components/Header'

interface LayoutProps {
  children: ReactNode
}

const LayoutHeader: React.FC<LayoutProps> = ({ children }) => (
  <div data-theme="synthwave">
    <Header />
    {children}
  </div>
)

export default LayoutHeader
