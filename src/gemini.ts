import {GoogleGenAI, Type} from '@google/genai'

export const geminiModels = [
	'gemini-3.5-flash', //
	'gemini-3.1-flash-lite',
	'gemini-2.5-pro',
	'gemini-2.5-flash-lite',
	'gemini-2.5-flash',
] as const
export type GeminiModel = (typeof geminiModels)[number]

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

export async function askGemini<T extends object>(
	input: string,
	options: GeminiOptionsBase & {
		schema: GeminiSchema
	},
): Promise<{
	output: T | undefined
	previousInteractionId: string
}>

export async function askGemini(
	input: string,
	options: GeminiOptionsBase & {
		schema?: undefined
	},
): Promise<{
	output: string | undefined
	previousInteractionId: string
}>

export async function askGemini(
	input: string,
	options: GeminiOptionsBase & {
		schema?: GeminiSchema
	},
) {
	const {
		apiKey,
		model,
		thinkingLevel: thinking_level = 'medium',
		systemInstruction,
		previousInteractionId: previous_interaction_id,
		schema,
		debug,
	} = options

	const ai = new GoogleGenAI({apiKey})

	const system_instruction = Array.isArray(systemInstruction)
		? systemInstruction
				.map((instruction) => instruction.trim())
				.filter(Boolean)
				.join('\n')
		: systemInstruction?.trim()

	const generation_config = {
		max_output_tokens: 65536,
		thinking_level,
	}

	if (debug) {
		console.log(`
=======================
Gemini request
=======================
input:
${input}

model:
${model}

thinking level:
${thinking_level}

previous interaction id:
${previous_interaction_id ?? 'none'}

system instruction:
${system_instruction ?? 'none'}

schema:
${schema ? JSON.stringify(schema, null, 2) : 'none'}
=======================
`)
	}

	try {
		const response = await ai.interactions.create({
			previous_interaction_id,
			model,
			generation_config,
			input,
			system_instruction,
			...(schema
				? {
						response_format: {
							type: 'text',
							mime_type: 'application/json',
							schema,
						},
					}
				: {}),
		})

		return {
			output: response.output_text
				? schema
					? JSON.parse(response.output_text)
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
