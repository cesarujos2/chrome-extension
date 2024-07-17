import { Textarea } from "@nextui-org/react";
import { useEffect, useState } from "react";

function TypingEffects({ text }: { text: string }) {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (currentIndex <= text.length) {
                setDisplayText(text.substring(0, currentIndex));
                setCurrentIndex(currentIndex + 1);
            } else {
                clearInterval(interval);
            }
        }, 3);

        return () => clearInterval(interval);
    }, [currentIndex, text]);

    useEffect(() => {
        setCurrentIndex(0);
        setDisplayText('');
    }, [text])
    return (
        <Textarea
            className="w-full"
            isReadOnly
            variant="bordered"
            placeholder="Aquí se mostrará la observación generada"
            value={displayText}
        />
    )
}

export default TypingEffects