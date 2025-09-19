import OptionsSwitch from './OptionSwitch'

function Options() {
  return (
    <div className='px-4'>
        <OptionsSwitch keyOption='signLegal' label='Visador legal en Cero Papel' />
        <OptionsSwitch keyOption='omitDerivatives' label='Omite derivadas' />
    </div>
  )
}

export default Options