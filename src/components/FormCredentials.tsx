import { Button, Input } from "@nextui-org/react"
import { useEffect, useState } from "react"

function FormCredentials() {
    const [credenciales, setCredenciales] = useState({ user: '', password: '' })
    const [showSaved, setShowSaved] = useState(false)

    const handleCredentials = (credenciales: { user: string, password: string }) => {
        localStorage.setItem('credenciales', JSON.stringify(credenciales))
        chrome.runtime.sendMessage({ action: 'saveCredenciales', data: credenciales })
        setShowSaved(true)
    }

    useEffect(() => {
        const savedCredenciales = localStorage.getItem('credenciales')
        if (savedCredenciales) {
            setCredenciales(JSON.parse(savedCredenciales))
        }

    }, [])

    return (
        <div className="w-full flex flex-col gap-2 text-center p-4 pt-0 text-white">
             <p className='font-bold text-lg'>Credenciales STD</p>
            <Input type="text" label="Usuario STD" size="sm" value={credenciales.user} onValueChange={(e) => setCredenciales({ ...credenciales, user: e })} />
            <Input type="password" label="Constraseña STD" size="sm" value={credenciales.password} onValueChange={(e) => setCredenciales({ ...credenciales, password: e })} />
            <Button variant="solid" color="primary" onClick={() => handleCredentials(credenciales)}>Guardar</Button>
            <div className="text-sm">{showSaved && 'Credenciales guardadas'}</div>
        </div>
    )
}

export default FormCredentials