import { Tab, Tabs } from '@nextui-org/tabs'
import './App.css'
import InputRoadMap from './components/InputRoadMap'
import Options from './components/Options'
import { useEffect, useMemo, useState } from 'react'
import FormRedaction from './components/FormRedaction'

function App() {
  const tabKeys = useMemo(() => ["roadmap", "gemini", "configuration"], [])

  const [keySelected, setKeySelected] = useState("roadmap")

  useEffect(() => {
    chargeOptionsFromStorage(['onlySearch', 'noDownload', 'despachar', 'copyDate', 'onlyDownloadAnnex'])
    window.addEventListener('keydown', handleKeyDown)
  })

  const chargeOptionsFromStorage = (options: Array<string>) => {
    options.forEach((option) => {
      const optionStorage = localStorage.getItem(option) == 'true' ? true : false
      chrome.runtime.sendMessage({ action: 'setOption', data: { key: option, value: optionStorage } })
    })
  }


  const handleKeyDown = (event: KeyboardEvent) => {
    const currentIndex = tabKeys.indexOf(keySelected)

    if (event.key === 'Tab') {
      let nextIndex = (currentIndex + 1)
      if (tabKeys.length === nextIndex) nextIndex = 0
      setKeySelected(tabKeys[nextIndex])
    } 
  }


  return (
    <div className='pt-2 w-96'>
      <Tabs aria-label="tabs"
        fullWidth={true}
        variant='underlined'
        color='primary'
        selectedKey={keySelected}
        onSelectionChange={(key) => setKeySelected(key as string)}
        destroyInactiveTabPanel={true}>
        <Tab key="roadmap" title="STD">
          <InputRoadMap />
        </Tab>
        <Tab key='gemini' title='IA'>
          <FormRedaction />
        </Tab>
        <Tab key='configuration' title='Configuración'>
          <Options />
        </Tab>
      </Tabs>
      <div className='w-full flex justify-center pb-2'>
        <p className="text-xs text-slate-600"> Copyright &#169; 2024 CU</p>
      </div>
    </div>
  )
}

export default App
