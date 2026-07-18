declare global {
	namespace jptxtarea {
		interface Response {
			sentenceEndings: string[]
		}

		interface Result extends Response {
			hash: string
			highlightStartIndex: number
			/**
			 * for extended highlights
			 */
			highlightEndIndex: number

			tabIndex: number

			lastInteractionId: string | undefined
			lastQuestion: string | undefined
			lastAnswer: string | undefined
		}
	}
}

export {}
