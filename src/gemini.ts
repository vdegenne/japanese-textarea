import {GoogleGenAI, Type} from '@google/genai'

export const geminiModels = [
	'gemini-3.5-flash', //
	'gemini-3.1-flash-lite',
	'gemini-2.5-pro',
	'gemini-2.5-flash-lite',
	'gemini-2.5-flash',
] as const
export type GeminiModel = (typeof geminiModels)[number]

// export async function askGemini(
// 	sentence: string,
// 	options: {apiKey: string; model: GeminiModel; systemInstruction?: string},
// ): Promise<jpbreaker.Response | undefined> {
// 	const ai = new GoogleGenAI({apiKey: options.apiKey})
//
// 	const response = await ai.models.generateContent({
// 		model: options.model ?? 'gemini-3.5-flash',
// 		// model: 'gemini-3.5-flash',
// 		contents: `Analyze every words in this japanese sentence: ${sentence}`,
// 		config: {
// 			systemInstruction: options.systemInstruction ?? [
// 				...(options.systemInstruction
// 					? [{text: options.systemInstruction}]
// 					: []),
// 				{text: 'You have to include all words'},
// 			],
// 			// systemInstruction: [{text: `Answer with only one sentence or two.`}],
// 			// thinkingConfig: {
// 			// 	thinkingLevel: ThinkingLevel.MINIMAL,
// 			// },
// 			thinkingConfig: {
// 				thinkingLevel: ThinkingLevel.MINIMAL,
// 			},
// 			responseMimeType: 'application/json',
// 			responseSchema: {
// 				type: Type.OBJECT,
// 				properties: {
// 					sentence: {type: Type.STRING},
// 					overallMeaning: {type: Type.STRING},
// 					romanization: {type: Type.STRING},
// 					literalGloss: {type: Type.STRING},
// 					shortInterpretation: {type: Type.STRING},
// 					parts: {
// 						type: Type.ARRAY,
// 						items: {
// 							type: Type.OBJECT,
// 							properties: {
// 								word: {type: Type.STRING},
// 								furigana: {type: Type.STRING},
// 								romaji: {type: Type.STRING},
// 								partOfSpeech: {type: Type.STRING},
// 								partOfSpeechJa: {type: Type.STRING},
// 								category: {type: Type.STRING},
// 								baseForm: {type: Type.STRING},
// 								translation: {type: Type.STRING},
// 								explanation: {type: Type.STRING},
// 								sentenceIndexes: {
// 									type: Type.OBJECT,
// 									properties: {
// 										start: {type: Type.NUMBER},
// 										end: {type: Type.NUMBER},
// 									},
// 									required: ['start', 'end'],
// 								},
// 							},
// 							required: [
// 								'word',
// 								'furigana',
// 								'romaji',
// 								'partOfSpeech',
// 								'partOfSpeechJa',
// 								'category',
// 								'baseForm',
// 								'translation',
// 								'explanation',
// 								'sentenceIndexes',
// 							],
// 						},
// 					},
// 				},
// 				required: [
// 					'sentence',
// 					'overallMeaning',
// 					'romanization',
// 					'literalGloss',
// 					'parts',
// 					'shortInterpretation',
// 				],
// 			},
// 		},
// 	})
//
// 	sleep(5000).then(() => {
// 		console.log(response)
// 	})
//
// 	return response.text ? JSON.parse(response.text) : undefined
// }

// export async function geminiTranslate(
// 	content: string,
// 	options: {apiKey: string; model: GeminiModel; systemInstruction?: string},
// ): Promise<string | undefined> {
// 	const ai = new GoogleGenAI({apiKey: options.apiKey})
//
// 	const response = await ai.models.generateContent({
// 		model: options.model ?? 'gemini-3.5-flash',
// 		// model: 'gemini-flash-lite-latest',
// 		config: {
// 			thinkingConfig: {
// 				thinkingLevel: ThinkingLevel.MINIMAL,
// 			},
// 			systemInstruction: [
// 				...(options.systemInstruction
// 					? [{text: options.systemInstruction}]
// 					: []),
// 				{text: 'Just give the translation, no other words.'},
// 			],
// 		},
// 		contents: [
// 			{
// 				role: 'user',
// 				parts: [
// 					{
// 						text: `Traduis en francais directement: "${content}"`,
// 					},
// 				],
// 			},
// 		],
// 	})
//
// 	return response.text
// }

export async function askGeminiSentenceEndings(
	input: string,
	options: {apiKey: string; model: GeminiModel; systemInstruction?: string},
) {
	const ai = new GoogleGenAI({apiKey: options.apiKey})

	const response = await ai.interactions.create({
		model: options.model ?? 'gemini-3.5-flash',
		input,
		generation_config: {
			max_output_tokens: 65536,
			thinking_level: 'medium',
		},
		system_instruction: `Analyze the sentence and list common sentence-final Japanese ASCII emotes. if it's Japanese also include the small version of the last letter (punctuations excluded).${options.systemInstruction ? ` ${options.systemInstruction}` : '.'}`,
		response_format: {
			type: 'text',
			mime_type: 'application/json',
			schema: {
				type: Type.OBJECT,
				properties: {
					sentenceEndings: {
						type: Type.ARRAY,
						items: {
							type: Type.STRING,
						},
					},
				},
				required: ['sentenceEndings'],
			},
		},
	})

	return {
		output: response.output_text
			? (JSON.parse(response.output_text) as jptxtarea.Response)
			: undefined,
		lastInteractionId: response.id,
	}
}

export async function askAnything(
	input: string,
	options: {
		apiKey: string
		model: GeminiModel
		previousInteractionId?: string
		systemIntruction?: string
	},
) {
	const ai = new GoogleGenAI({apiKey: options.apiKey})

	const response = await ai.interactions.create({
		previous_interaction_id: options.previousInteractionId,
		model: options.model ?? 'gemini-3.5-flash',
		input,
		generation_config: {
			max_output_tokens: 65536,
			thinking_level: 'minimal',
		},
		system_instruction: options.systemIntruction,
		response_format: {
			type: 'text',
			mime_type: 'text/plain',
		},
	})

	return {
		output: response.output_text,
		lastInteractionId: response.id,
	}
}
