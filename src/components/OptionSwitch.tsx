import { Switch } from '@nextui-org/react'
import { IRequest } from '../models/IRequest'

interface IOptionsSwitchProps {
  keyOption: keyof IRequest["config"]
  label: string
  value: boolean
  onChange: (check: boolean) => void
}

function OptionsSwitch({ keyOption, label, value, onChange }: IOptionsSwitchProps) {
  const handleChecked = (check: boolean) => {
    onChange(check);
  }

  return (
    <div>
      <div className="p-2">
        <Switch aria-label={keyOption} isSelected={value} onValueChange={handleChecked} size="sm">{label}</Switch>
      </div>
    </div>
  )
}

export default OptionsSwitch
