import { useEffect, useRef, useState } from 'react'
import './App.css'
import { sendMessage } from './background/features/sendMessage';
import { Request } from './interfaces/frontData';

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showError, setShowError] = useState(false);
  const [noData, setNoData] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
    document.addEventListener('keydown', handleKeyDown, true)

    chrome.runtime.onMessage.addListener(function (request: Request) {
      if (request.action === 'noResults') {
        setNoData(true)
        setTimeout(() => {
          setNoData(false)
        }, 4000)
        setLoading(false)
      }
    }
    )
  }, [])
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCLick()
    }
  }

  const handleCLick = () => {
    if (inputRef.current && inputRef.current.value.length > 0) {
      const datosInput = inputRef.current.value.split('-')
      if (datosInput.length == 3 && datosInput[0].toUpperCase() == "E") {
        setLoading(true)
        sendMessage({ action: 'searchInTefi', data: { roadmap: inputRef.current.value } })
      } else {
        setShowError(true)
        setTimeout(() => {
          setShowError(false)
        }, 4000)
      }
    }
  }
  return (
    <div style={{ backgroundColor: 'rgb(26, 29, 33)' }} className='w-80 text-center py-4 text-white'>
      <div className={`${loading ? 'flex' : 'hidden'} items-center justify-center h-full w-full`} style={{position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '9999', backgroundColor: 'rgba(26, 29, 33, 0.7)'}}>
        <div style={{"borderTopColor":"transparent"}} className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin"></div>
        <p className="ml-2">cargando...</p>
      </div>
      <img style={{ margin: '0 auto' }} className='h-12 py-1' src="https://www.mibrevete.pe/images/aa.png" alt="logo-mtc" />
      <div>
        <p className='font-bold text-lg'>DERIVACIÓN</p>
        {showError && <p className='text-red-500 text-xs text-bold py-1'>Ingresa un hoja de ruta válido</p>}
        {noData && <p className='text-red-500 text-xs text-bold py-1'>Hoja de ruta no registrada en TEFI</p>}
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
