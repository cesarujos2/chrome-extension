import { Switch } from '@nextui-org/react'
import { useEffect, useState } from 'react'

function OptionsSwitch({ keyOption, label }: { keyOption: string, label: string }) {
  const [checked, setChecked] = useState(false)
  useEffect(() => {
    const optionStorage = localStorage.getItem(keyOption)
    const optionSaved = optionStorage === 'true' ? true : false
    setChecked(optionSaved)
  }, [])

  const handleChecked = (check: boolean) => {
    setChecked(check)
    localStorage.setItem(keyOption, String(check))
    chrome.runtime.sendMessage({ action: 'setOption', data: { key: keyOption, value: check } })
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
