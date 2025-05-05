import { Switch } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { createRequest } from '../utils/createRequestPopUp'
import { IRequest } from '../models/IRequest'

function OptionsSwitch({ keyOption, label }: { keyOption: keyof IRequest["config"], label: string }) {
  const [checked, setChecked] = useState(false)
  useEffect(() => {
    const optionStorage = localStorage.getItem(keyOption.toString())
    const optionSaved = optionStorage === 'true' ? true : false
    setChecked(optionSaved)
  }, [])

  const handleChecked = (check: boolean) => {
    setChecked(check)
    localStorage.setItem(keyOption.toString(), String(check))

    //setear Configuración
    const request = createRequest()
    request.action = "setConfig"
    if (keyOption !== "theme") {
      request.config[keyOption] = check
    }
    chrome.runtime.sendMessage(request)
  }

  return (
    <div>
      <div className="p-2">
        <Switch isSelected={checked} onValueChange={handleChecked} size="sm">{label}</Switch>
      </div>
    </div>
  )
}

export default OptionsSwitch
