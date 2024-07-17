import { sendMessage } from "../background/features/sendMessage";
import { Request } from "../interfaces/frontData";
import { useEffect, useRef, useState } from "react";
import { Button, Input } from "@nextui-org/react";

function InputRoadMap() {
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
        setLoading(false)
        if (request.data.finded) {
          setNoData(true)
          setTimeout(() => {
            setNoData(false)
          }, 4000)
        }
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
      const datosInput = inputRef.current.value.trim().split('-')
      if (datosInput.length == 3 && (datosInput[0].toUpperCase() == "E" || datosInput[0].toUpperCase() == "I") && datosInput[1].length == 6 && datosInput[2].length == 4) {
        setLoading(true)
        sendMessage({ action: 'searchRoadMap', data: { roadmap: inputRef.current.value.trim() } })
      } else {
        setShowError(true)
        setTimeout(() => {
          setShowError(false)
        }, 4000)
      }
    }
  }
  return (
    <div className='w-full text-center'>
      <div className={`${loading ? 'flex' : 'hidden'} items-center justify-center h-full w-full`} style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '9999', backgroundColor: 'rgba(26, 29, 33, 0.7)' }}>
        <div style={{ "borderTopColor": "transparent" }} className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin"></div>
        <p className="ml-2">cargando...</p>
      </div>
      {/* <img style={{ margin: '0 auto' }} className='h-12 py-1' src="https://www.mibrevete.pe/images/aa.png" alt="logo-mtc" /> */}
      <div>
        <p className='font-bold text-lg'>HOJA DE RUTA</p>
        {showError && <p className='text-red-500 text-sm text-bold py-1'>¡Ingresa un hoja de ruta válida!</p>}
        {noData && <p className='text-red-500 text-sm text-bold py-1'>¡Hoja de ruta no registrada en TEFI!</p>}
      </div>
      <div className="flex px-4 py-1 gap-2">
        <Input ref={inputRef} type="text" placeholder="Ingresa la hoja de ruta" />
        <Button variant="solid" color="primary" onClick={handleCLick}>Derivar</Button>
      </div>
    </div>
  )
}

export default InputRoadMap