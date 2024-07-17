import { Button, Input, Skeleton } from "@nextui-org/react"
import TypingEffects from "./TypingEffects"
import { useEffect, useRef, useState } from "react"
import { GeminiRun } from "../services/GeminiRun"

function FormRedaction() {
  const [textInput, setTextInput] = useState("")
  const [textGenerated, setTextGenerated] = useState("")
  const [loading, setLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  })

  const handleCLick = async () => {
    setLoading(true)
    const response = await GeminiRun(textInput)
    setTextGenerated(response)
    setLoading(false)
  }

  return (
    <div className="w-full px-4 pt-0">
      <h1 className='font-bold text-lg text-center pb-2'>REDACTA OBSERVACIONES</h1>
      <div className="flex gap-2">
        <Input ref={inputRef} value={textInput} onValueChange={setTextInput} placeholder="Escribe el problema" type="text"></Input>
        <Button color="primary" onClick={handleCLick}>Redactar</Button>
      </div>
      <div className="text-sm mt-4 flex justify-between">
        <div>Observación generada</div>
        <Button isIconOnly size="sm" variant="light" aria-label="Copiar texto" onClick={() => copyText(textGenerated)}>
          <svg className="h-5 w-5 text-gray-300" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <rect x="8" y="8" width="12" height="12" rx="2" />  <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" /></svg>
        </Button>
      </div>
      <Skeleton isLoaded={!loading} className="rounded-lg mt-1">
        <TypingEffects text={textGenerated} />
      </Skeleton>
    </div>
  )
}

async function copyText(textToCopy: string) {
  try {
    await navigator.clipboard.writeText(textToCopy);
  } catch (err) {
    console.error('Failed to copy text to clipboard: ', err);
  }
}


export default FormRedaction