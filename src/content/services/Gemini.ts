import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// Interface for generation configuration (Interface Segregation Principle)
interface IGenerationConfig {
    temperature: number;
    topP: number;
    topK: number;
    maxOutputTokens: number;
    responseMimeType: string;
}

// Interface for Gemini service contract (Dependency Inversion Principle)
export interface IGeminiService {
    sendMessage(prompt: string): Promise<string>;
}

// Configuration class (Single Responsibility Principle)
class GeminiConfig {
    private static readonly DEFAULT_CONFIG: IGenerationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
    };

    private static readonly SYSTEM_INSTRUCTION = `Eres una que mejora la redacción observaciones para las Fichas Técnicas Ambientales de proyectos en el sector de comunicaciones. El usuario proporcionará detalles del problema o error específico. El bot mejora la redacción observaciones de manera profesional y respetuosa. El tema princial son las observaciones de las fichas técnicas ambientales y las infraestructas que aplican al sector de comunicaciones como cableado, greenfield, rooftop, antena tipo poste, postes, canalizado, antena, etc. (relacionado a comunicaciones). Además, el texto generado por el bot es una observación que incluye normativas, especificaciones, lo más detallado posible, no inventa números o referencias. No crea variables nuevas no especificaddas en en prompt de entrada. IMPORTANTE!: Solamente devolverás la misma frase, pero parafraseada, mejorada.`;

    static getGenerationConfig(): IGenerationConfig {
        return { ...this.DEFAULT_CONFIG };
    }

    static getSystemInstruction(): string {
        return this.SYSTEM_INSTRUCTION;
    }
}



// Error handler class (Single Responsibility Principle)
class GeminiErrorHandler {
    static handleError(error: unknown): never {
        console.error("Gemini Service Error:", error);
        throw new Error("Error al generar respuesta del chatbot");
    }
}

// Main Gemini service class (Open/Closed Principle - extensible without modification)
export class GeminiService implements IGeminiService {
    private genAI: GoogleGenerativeAI;
    private model!: GenerativeModel;
    private geminiModel: string;

    constructor(apiKey?: string, geminiModel?: string) {
        // Dependency Injection for API key (Dependency Inversion Principle)
        // Note: import.meta.env is not available in content scripts, so we use parameters
        const key = apiKey || "";
        this.geminiModel = geminiModel || "gemini-1.5-flash";
        this.genAI = new GoogleGenerativeAI(key);
        this.initializeModel();
    }

    private initializeModel(): void {
        this.model = this.genAI.getGenerativeModel({
            model: this.geminiModel,
            systemInstruction: GeminiConfig.getSystemInstruction(),
        });
    }



    async sendMessage(prompt: string): Promise<string> {
        try {
            const result = await this.model.generateContent({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }],
                generationConfig: GeminiConfig.getGenerationConfig()
            });
            
            const response = result.response.text();
            return response;
        } catch (error) {
            return GeminiErrorHandler.handleError(error);
        }
    }


}

// Factory for creating Gemini service instances (Factory Pattern)
export class GeminiServiceFactory {
    static create(apiKey?: string, geminiModel?: string): IGeminiService {
        return new GeminiService(apiKey, geminiModel);
    }
}

// Default export for convenience
export default GeminiService;