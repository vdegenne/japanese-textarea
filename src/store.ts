import {PropertyValues, ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
import {saveToLocalStorage} from 'snar-save-to-local-storage'
import {GeminiModel} from './gemini.js'
import {Page, availablePages} from './pages/index.js'

@saveToLocalStorage('japanese-textarea:store')
export class AppStore extends ReactiveController {
	@state() page: Page = 'main'

	@state() input = ''
	@state() keepInput = ''

	@state() geminiApiKey = ''
	@state() geminiModel: GeminiModel = 'gemini-3.5-flash'
	@state() systemInstruction = ''

	@state() lastSuggestions: string[] = []
	@state() globalAsk = ''
	@state() globalSuggestion = ''

	F = new FormBuilder(this)

	protected updated(changed: PropertyValues<this>) {
		let pagePromise = Promise.resolve()

		if (changed.has('page')) {
			const page = availablePages.includes(this.page) ? this.page : '404'

			// TODO: use vite way to import dynamic links
			pagePromise = import(`./pages/page-${page}.ts`)
				// .then(() => console.log(`Page ${page} loaded.`))
				.catch(() => {})
		}

		// if (this.page === 'main') {
		// 	await pagePromise
		// }
	}
}

export const store = new AppStore()

// @ts-ignore
window.store = store
