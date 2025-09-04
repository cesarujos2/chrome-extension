import { Tab, Tabs } from '@nextui-org/tabs'
import './App.css'
import Options from './components/Options'
import FormRedaction from './components/FormRedaction'
import { ThemeSwitch } from './components/core/theme-switch'
import FormSeeker from './components/FormSeeker'

function App() {
  return (
    <div className='pt-2 w-96'>
      <Tabs aria-label="tabs" fullWidth={true} variant='underlined' color='primary'>
        <Tab key={'seeker'} title="Generar oficio">
          <FormSeeker/>
        </Tab>
        <Tab key='configuration' title='Configuración'>
          <Options />
        </Tab>
        <Tab key='gemini' title='IA'>
          <FormRedaction />
        </Tab>
      </Tabs>
      <div className='mx-6 mb-3 border-b-1 border-gray-200'></div>
      <div className='w-full flex justify-center pb-2 items-center'>
        <p className="text-xs text-slate-600"> Copyright &#169; 2024 CU</p>
        <span className='px-1'><ThemeSwitch /></span>
      </div>
    </div>
  )
}

export default App
