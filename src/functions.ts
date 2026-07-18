import toast from 'toastit'
import {askGemini, RateLimitError, Type} from './gemini.js'
import {stateless} from './stateless.js'
import {store} from './store.js'

// export async function suggestEndings() {
// 	if (!store.input) return
// 	if (!store.geminiApiKey) {
// 		toast('No API key found.')
// 		return
// 	}
//
// 	stateless.loading = true
//
// 	const {output} = await askGeminiSentenceEndings(store.input, {
// 		apiKey: store.geminiApiKey,
// 		model: store.geminiModel,
// 		systemInstruction: store.systemInstruction,
// 	})
//
// 	if (output) {
// 		store.lastSuggestions = output.sentenceEndings
// 	}
//
// 	stateless.loading = false
// }

export function getSmallKanaAtEnd(input: string): string | null {
	const smallKanaMap: Record<string, string> = {
		// Hiragana
		あ: 'ぁ',
		い: 'ぃ',
		う: 'ぅ',
		え: 'ぇ',
		お: 'ぉ',
		や: 'ゃ',
		ゆ: 'ゅ',
		よ: 'ょ',
		つ: 'っ',
		わ: 'ゎ',

		// Katakana
		ア: 'ァ',
		イ: 'ィ',
		ウ: 'ゥ',
		エ: 'ェ',
		オ: 'ォ',
		ヤ: 'ャ',
		ユ: 'ュ',
		ヨ: 'ョ',
		ツ: 'ッ',
		ワ: 'ヮ',

		// Katakana extended small vowels
		ヰ: 'ヸ', // uncommon, kept for completeness
	}

	// Match the last hiragana/katakana character in the string
	const match = input.match(
		/[\u3040-\u309F\u30A0-\u30FF](?!.*[\u3040-\u309F\u30A0-\u30FF])/,
	)

	if (!match) {
		return null
	}

	return smallKanaMap[match[0]] ?? match[0]
}

export function katakanaToHalfwidth(input: string): string {
	return input.replace(/[\u30A1-\u30FF\u31F0-\u31FF]/g, (char) => {
		return char.normalize('NFKC')
	})
}

export async function askGeminiSentenceEndings() {
	if (!store.geminiApiKey) {
		toast('No API key found')
		return
	}

	try {
		const {output, previousInteractionId} = await askGemini<jptxtarea.Response>(
			store.input,
			{
				debug: true,
				apiKey: store.geminiApiKey,
				model: store.geminiModel,
				systemInstruction: [
					'Analyze the sentence and list common sentence-final Japanese ASCII emotes.',
					// "if it's Japanese also include the small version of the last letter (punctuations excluded).",
					store.systemInstruction,
				],
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
		)

		if (output) {
			store.lastSuggestions = output.sentenceEndings
		}
	} catch (err) {
		if (err instanceof RateLimitError) {
			toast('RateLimitError!')
			return
		}
	}
}

export async function askSuggestion() {
	if (!store.geminiApiKey) {
		toast('No API key found')
		return
	}

	if (store.globalAsk && (stateless.lastSelection || store.input)) {
		const input = `${store.globalAsk} ${stateless.lastSelection ?? store.input}`
		try {
			const {output, previousInteractionId} = await askGemini(input, {
				debug: true,
				apiKey: store.geminiApiKey,
				model: store.geminiModel,
				systemInstruction: [
					'Do not write anything else, just the answer.',
					store.systemInstruction,
				],
				// previousInteractionId: stateless.previousInteractionId,
				// schema: {
				// 	type: Type.OBJECT,
				// 	properties: {
				// 		suggestion: {
				// 			type: Type.STRING,
				// 		},
				// 	},
				// 	required: ['suggestion'],
				// },
			})

			if (output && previousInteractionId) {
				stateless.previousInteractionId = previousInteractionId
				store.globalSuggestion = output
			}
		} catch (err) {
			if (err instanceof RateLimitError) {
				toast('RateLimitError!')
			}
			return
		}
	}
}
