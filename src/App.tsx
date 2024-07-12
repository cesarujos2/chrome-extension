import { useEffect, useRef } from 'react'
import './App.css'

function App() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if(inputRef.current) {
      inputRef.current.focus()
    }
    document.addEventListener('keydown', handleKeyDown, true)
  }, [])
  const handleKeyDown = (event: KeyboardEvent) => {
    if(event.key === 'Enter') {
      handleCLick()
    }
  }
  
  const handleCLick = () => {
    if(inputRef.current && inputRef.current.value.length > 0) {
      chrome.runtime.sendMessage({action: 'runScript', roadmap: inputRef.current.value})
    }
  }
  return (
    <div style={{backgroundColor: 'rgb(26, 29, 33)'}} className='w-80 text-center py-4 text-white'>
      <img style={{margin: '0 auto'}} className='h-12 py-1' src="https://www.mibrevete.pe/images/aa.png" alt="logo-mtc" />
      <div>
        <p className='font-bold text-lg'>DERIVACIÓN</p>
      </div>
      <div className="">
        <div>
          <input ref={inputRef} className='w-52 border-0 bg-cyan-900 px-2 py-2 borders rounded' type="text" placeholder="Ingresa id" />
        </div>
        <div className="p-2">
          <button onClick={handleCLick} type="button" tabIndex={0} className='bg-sky-500/50 border-0 px-4 py-2 rounded text-bold hover:bg-sky-900'>Abrir</button>
        </div>
      </div>
      <p className="text-xs text-slate-600"> Copyright &#169; 2023 Practicante CU</p>
    </div>
  )
}

export default App
