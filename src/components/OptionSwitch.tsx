import { Switch } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { createRequest } from '../utils/createRequestPopUp'
import { IRequest } from '../models/IRequest'

function OptionsSwitch({ keyOption, label }: { keyOption: keyof IRequest["config"], label: string }) {
  const [checked, setChecked] = useState(false)
  useEffect(() => {
    // Obtener configuración del background script
    const getConfigRequest = createRequest();
    getConfigRequest.action = "getConfig";

    chrome.runtime.sendMessage(getConfigRequest, (config) => {
      if (config && keyOption in config) {
        setChecked(config[keyOption]);
      } else {
        // Fallback al localStorage si no hay configuración en el background
        const optionStorage = localStorage.getItem(keyOption.toString());
        const optionSaved = optionStorage === 'true' ? true : false;
        setChecked(optionSaved);
      }
    });
  }, [keyOption])

  const handleChecked = (check: boolean) => {
    setChecked(check);
    localStorage.setItem(keyOption.toString(), String(check));

    // Obtener configuración existente y actualizarla
    const getConfigRequest = createRequest();
    getConfigRequest.action = "getConfig";

    chrome.runtime.sendMessage(getConfigRequest, (existingConfig) => {
      const setConfigRequest = createRequest();
      setConfigRequest.action = "setConfig";

      // Mantener la configuración existente y solo actualizar el campo específico
      setConfigRequest.config = {
        ...existingConfig,
        [keyOption]: check
      };

      chrome.runtime.sendMessage(setConfigRequest);
    });
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
