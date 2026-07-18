import {GoogleGenAI, Type} from '@google/genai'

export const geminiModels = [
	'gemini-3.5-flash', //
	'gemini-3.1-flash-lite',
	'gemini-2.5-pro',
	'gemini-2.5-flash-lite',
	'gemini-2.5-flash',
] as const
export type GeminiModel = (typeof geminiModels)[number]

export class RateLimitError extends Error {
	constructor(message = 'Gemini rate limit exceeded') {
		super(message)
		this.name = 'RateLimitError'
	}
}

function isRateLimitError(error: unknown): boolean {
	if (!(error instanceof Error)) {
		return false
	}

	return (
		(error as any).status === 429 ||
		(error as any).code === 429 ||
		error.message.toLowerCase().includes('rate limit') ||
		error.message.toLowerCase().includes('quota') ||
		error.message.toLowerCase().includes('resource exhausted')
	)
}

type GeminiSchema = {
	[k: string]: any
}

type GeminiOptionsBase = {
	apiKey: string
	model: GeminiModel
	systemInstruction?: string | string[]
	previousInteractionId?: string
	thinkingLevel?: 'minimal' | 'low' | 'medium' | 'high'
	debug?: boolean
}

export async function askGemini<T extends object>(
	suggestion: string,
	options: GeminiOptionsBase & {
		schema: GeminiSchema
	},
): Promise<{
	output: T | undefined
	previousInteractionId: string
}>

export async function askGemini(
	suggestion: string,
	options: GeminiOptionsBase & {
		schema?: undefined
	},
): Promise<{
	output: string | undefined
	previousInteractionId: string
}>

export async function askGemini(
	suggestion: string,
	options: GeminiOptionsBase & {
		schema?: GeminiSchema
	},
) {
	const ai = new GoogleGenAI({apiKey: options.apiKey})

	const system_instruction = Array.isArray(options.systemInstruction)
		? options.systemInstruction
				.map((instruction) => instruction.trim())
				.filter(Boolean)
				.join('\n')
		: options.systemInstruction?.trim()

	const generation_config = {
		max_output_tokens: 65536,
		thinking_level: options.thinkingLevel ?? 'medium',
	}

	if (options.debug) {
		console.log(`
=======================
Gemini request
=======================
input:
${suggestion}

model:
${options.model}

thinking level:
${generation_config.thinking_level}

previous interaction id:
${options.previousInteractionId ?? 'none'}

system instruction:
${system_instruction ?? 'none'}

schema:
${options.schema ? JSON.stringify(options.schema, null, 2) : 'none'}
=======================
`)
	}

	try {
		const response = await ai.interactions.create({
			previous_interaction_id: options.previousInteractionId,
			model: options.model ?? 'gemini-3.5-flash',
			generation_config,
			input: suggestion,
			system_instruction,
			...(options.schema
				? {
						response_format: {
							type: 'text',
							mime_type: 'application/json',
							schema: options.schema,
						},
					}
				: {}),
		})

		return {
			output: response.output_text
				? options.schema
					? (JSON.parse(response.output_text) as object)
					: response.output_text
				: undefined,
			previousInteractionId: response.id,
		}
	} catch (error) {
		if (isRateLimitError(error)) {
			throw new RateLimitError()
		}

		throw error
	}
}

export {Type}
