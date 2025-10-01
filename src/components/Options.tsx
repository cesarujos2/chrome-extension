import { useState, useEffect } from 'react'
import OptionsSwitch from './OptionSwitch'
import { createRequest } from '../utils/createRequestPopUp'

function Options() {
  const [signLegal, setSignLegal] = useState(false)
  const [omitDerivatives, setOmitDerivatives] = useState(false)
  const [forceDerivatives, setForceDerivatives] = useState(false)

  // Cargar configuración inicial desde el background script
  useEffect(() => {
    const getConfigRequest = createRequest();
    getConfigRequest.action = "getConfig";

    chrome.runtime.sendMessage(getConfigRequest, (config) => {
      console.log('Config recibida del background:', config);
      if (config && typeof config === 'object') {
        setSignLegal(!!config.signLegal);
        setOmitDerivatives(!!config.omitDerivatives);
        setForceDerivatives(!!config.forceDerivatives);
      }
    });
  }, []);

  // Función única para actualizar configuración completa
  const updateConfig = (updates: Record<string, boolean>) => {
    // Actualizar estados locales
    Object.entries(updates).forEach(([key, value]) => {
      switch (key) {
        case 'signLegal':
          setSignLegal(value);
          break;
        case 'omitDerivatives':
          setOmitDerivatives(value);
          break;
        case 'forceDerivatives':
          setForceDerivatives(value);
          break;
      }
      // Actualizar localStorage
      localStorage.setItem(key, String(value));
    });

    // Actualizar background script
    const getConfigRequest = createRequest();
    getConfigRequest.action = "getConfig";

    chrome.runtime.sendMessage(getConfigRequest, (existingConfig) => {
      const setConfigRequest = createRequest();
      setConfigRequest.action = "setConfig";

      setConfigRequest.config = {
        ...existingConfig,
        ...updates
      };

      chrome.runtime.sendMessage(setConfigRequest);
    });
  }

  const handleSignLegalChange = (value: boolean) => {
    updateConfig({ signLegal: value });
  }

  const handleOmitDerivativesChange = (value: boolean) => {
    const updates: Record<string, boolean> = { omitDerivatives: value };
    if (value) {
      updates.forceDerivatives = false;
    }
    updateConfig(updates);
  }
  
  const handleForceDerivativesChange = (value: boolean) => {
    const updates: Record<string, boolean> = { forceDerivatives: value };
    if (value) {
      updates.omitDerivatives = false;
    }
    updateConfig(updates);
  }

  return (
    <div className='px-4'>
      <OptionsSwitch
        keyOption='signLegal'
        label='Visador legal en Cero Papel'
        value={signLegal}
        onChange={handleSignLegalChange} />
      <OptionsSwitch
        keyOption='omitDerivatives'
        label='Omite derivadas'
        value={omitDerivatives}
        onChange={handleOmitDerivativesChange} />
      <OptionsSwitch
        keyOption='forceDerivatives'
        label='Forzar derivadas'
        value={forceDerivatives}
        onChange={handleForceDerivativesChange} />
    </div>
  )
}

export default Options