import { Tab, Tabs } from '@nextui-org/tabs'
import './App.css'
import InputRoadMap from './components/InputRoadMap'
import Options from './components/Options'
import { useEffect } from 'react'
import FormRedaction from './components/FormRedaction'

function App() {
  useEffect(() => {
    chargeOptionsFromStorage(['onlySearch', 'noDownload', 'despachar'])
  })

  const chargeOptionsFromStorage = (options: Array<string>) => {
    options.forEach((option) => {
      const optionStorage = localStorage.getItem(option) == 'true' ? true : false
      chrome.runtime.sendMessage({ action: 'setOption', data: { key: option, value: optionStorage } })
    })
  }
  return (
    <div className='pt-2 w-96'>
      <Tabs aria-label="tabs" fullWidth={true} variant='underlined' color='primary'>
        <Tab key="roadmap" title="STD">
          <InputRoadMap />
        </Tab>
        <Tab key='gemini' title='IA'>
          <FormRedaction />
        </Tab>
        <Tab key='configuration' title='Configuración'>
          <Options />
        </Tab>
        <Tab key='report' title='Reporte'>
          <div></div>
        </Tab>
      </Tabs>
      <div className='w-full flex justify-center pb-2'>
        <p className="text-xs text-slate-600"> Copyright &#169; 2024 CU</p>
      </div>
    </div>
  )
}

export default App
