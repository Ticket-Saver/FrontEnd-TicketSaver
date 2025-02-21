import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Tab {
  id: string
  title: string
  path: string
}

export default function Tabs() {
  const [activeTab, setActiveTab] = useState('tab1')
  const navigate = useNavigate()

  const tabs = [
    { id: 'tab1', title: 'See upcoming event', path: 'upcomingevent' }
    // { id: 'tab2', title: 'View on past event', path: 'pastevent' }
    // { id: 'tab3', title: 'My collectibles', path: 'collectibles' }
  ]

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id)
    navigate(`/dashboard/tickets/${tab.path}`)
  }

  return (
    <div className="w-full h-auto bg-neutral rounded-xl flex flex-col justify-between p-4 py-6 md:h-36">
      <div className="text-xl md:text-3xl font-semibold text-center md:text-left">My tickets</div>
      <div className="w-full md:w-2/5 h-[1px] bg-gradient-to-r from-[#E779C1] to-[#221551] my-4"></div>
      <div>
        <ul className="flex flex-col items-center space-y-2 md:flex-row md:justify-start md:space-x-14 md:space-y-0">
          {tabs.map(tab => (
            <li
              key={tab.id}
              className={`cursor-pointer ${activeTab === tab.id ? 'border-b-2 border-white' : 'text-white'} px-2`}
              onClick={() => handleTabClick(tab)}
            >
              {tab.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
