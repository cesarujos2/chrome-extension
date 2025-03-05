import OptionsSwitch from './OptionSwitch'

function Options() {
  return (
    <div className='px-4'>
        <OptionsSwitch keyOption='onlySearch' label='Solamente buscar en STD'/>
        <OptionsSwitch keyOption='noDownload' label='No descargar documento'/>
    </div>
  )
}

export default Options