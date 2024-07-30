import OptionsSwitch from './OptionSwitch'

function Options() {
  return (
    <div className='px-4'>
        <OptionsSwitch keyOption='onlySearch' label='Solamente buscar en STD'/>
        <OptionsSwitch keyOption='copyDate' label='Copiar fecha en STD'/>
        <OptionsSwitch keyOption='noDownload' label='No abrir TEFI para descargar documento'/>
        <OptionsSwitch keyOption='despachar' label='No firmar con Signet en STD'/>
    </div>
  )
}

export default Options