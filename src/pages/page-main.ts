import '@material/web/iconbutton/icon-button.js'
import '@material/web/textfield/filled-text-field.js'
import '@material/web/textfield/outlined-text-field.js'
import {withController} from '@snar/lit'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, query} from 'lit/decorators.js'
import toast from 'toastit'
import {SVG_GEMINI} from '../assets/assets.js'
import {askSuggestions, japanesePunctuation} from '../constants.js'
import {
	askGeminiSentenceEndings,
	askSuggestion,
	getSmallKanaAtEnd,
} from '../functions.js'
import {stateless} from '../stateless.js'
import {store} from '../store.js'
import {copyToClipboard} from '../utils.js'
import {PageElement} from './PageElement.js'

declare global {
	interface HTMLElementTagNameMap {
		'page-main': PageMain
	}
}

@customElement('page-main')
@withController(store)
@withController(stateless)
@withStyles(css`
	:host {
	}

	md-filled-tonal-icon-button span {
		position: relative;
		bottom: 5px;
		font-family:
			'Noto Sans JP', 'Noto Sans Symbols 2', 'Noto Serif JP', sans-serif;
	}
`)
export class PageMain extends PageElement {
	@query('#main-textarea') textarea?: HTMLTextAreaElement
	@query('#ask-anything-textfield') askAnythingTextfield?: HTMLInputElement

	render() {
		const smallKana = store.input ? getSmallKanaAtEnd(store.input) : undefined
		return html`<!---->
			<div class="flex flex-col">
				<md-filled-text-field
					id="main-textarea"
					type="textarea"
					autofocus=""
					rows="10"
					style="--md-sys-typescale-body-large-size:1.5rem;--md-sys-typescale-body-large-font:'Noto Sans JP', 'Noto Sans Symbols 2', 'Noto Serif JP', sans-serif"
					.value="${store.input}"
					@keyup="${(event: KeyboardEvent) => {
						store.input = this.textarea!.value
					}}"
				>
					<div class="flex flex-col gap-3 right-2" slot="trailing-icon">
						<md-icon-button
							@click="${() => {
								copyToClipboard(this.textarea!.value)
								toast('Copied')
							}}"
							><md-icon>content_copy</md-icon></md-icon-button
						>
						<md-icon-button
							?disabled="${!store.input || !store.geminiApiKey || stateless.loading}"
							@click="${askGeminiSentenceEndings}"
							><md-icon>${SVG_GEMINI}</md-icon></md-icon-button
						>
					</div>
				</md-filled-text-field>
				<div
					class="p-1 flex items-start gap-1"
					@click="${this.#onSuggestionButtonClick}"
				>
					<div class="max-w-[50%] flex flex-wrap gap-1">
						${
							smallKana
								? html`<!-- -->
										<md-outlined-icon-button data-value="${smallKana}">
											<span class="relative bottom-1.5">${smallKana}</span>
										</md-outlined-icon-button>
										<!-- -->`
								: null
						}
						<md-filled-tonal-icon-button data-value="　">
							<md-icon>space_bar</md-icon>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button
							data-value="
"
						>
							<md-icon>keyboard_return</md-icon>
						</md-filled-tonal-icon-button>
						${japanesePunctuation.map(
							(punc) =>
								html`<!-- -->
									<md-filled-tonal-icon-button data-value="${punc}">
										<span>${punc}</span>
									</md-filled-tonal-icon-button>
									<!-- -->`,
						)}
					</div>

					<div class="max-w-[50%] flex flex-wrap gap-1">
						${[...store.lastSuggestions, store.globalSuggestion]
							.filter(Boolean)
							.map(
								(suggestion) =>
									html`<!-- -->
										<md-outlined-button data-value=${suggestion}>
											<span class="jp">${suggestion}</span>
										</md-outlined-button>
										<!-- -->`,
							)}
					</div>

					<div class="" hidden>
						<md-filled-tonal-button
							?disabled="${!store.input || !store.geminiApiKey || stateless.loading}"
							@click=${askGeminiSentenceEndings}
						>
							<md-icon slot="icon">${SVG_GEMINI}</md-icon>
							Suggest endings
						</md-filled-tonal-button>
						<md-filled-tonal-button
							?disabled="${!store.input || !store.geminiApiKey}"
							hidden
						>
							<md-icon slot="icon">keep</md-icon>
							Keep
						</md-filled-tonal-button>
					</div>
				</div>
			</div>

			<div class="relative" hidden>
				<div
					class="absolute right-1 top-1 bottom-1 flex flex-col items-center gap-3"
				>
					<md-icon-button><md-icon>content_copy</md-icon></md-icon-button>
					<md-icon-button><md-icon>clear</md-icon></md-icon-button>
				</div>
				${store.F.TEXTAREA('Kept', 'keepInput', {autofocus: true, rows: 3, disabled: true, resetButton: {icon: html``}})}
			</div>

			<div class="p-3">
				<md-filled-text-field
					id="ask-anything-textfield"
					placeholder="Ask anything"
					class="w-full"
					_supporting-text="Ask for:"
					.value=${store.globalAsk}
					@input=${() => {
						store.globalAsk = this.askAnythingTextfield!.value
					}}
				>
					<div slot="trailing-icon" class="right-0">
						<md-icon-button
							?disabled="${!store.globalAsk}"
							@click="${askSuggestion}"
							><md-icon>${SVG_GEMINI}</md-icon></md-icon-button
						>
						<md-icon-button><md-icon>clear</md-icon></md-icon-button>
					</div>
				</md-filled-text-field>
				<div class="flex text-xs gap-3 pt-1">
					<span class=""
						><b>Ask for</b>:
						${stateless.lastSelection || 'all text'}${stateless.lastSelection ? html` (<a href="" @click=${() => (stateless.lastSelection = '')}>all text</a>)` : ''}</span
					>
					<md-chip-set>
						${askSuggestions.map((suggestion) => {
							return html`<!-- -->
								<md-suggestion-chip
									elevated
									@click=${() => (store.globalAsk = suggestion)}
									>${suggestion}</md-suggestion-chip
								>
								<!-- -->`
						})}
					</md-chip-set>
				</div>
			</div>
			<!----> `
	}

	#onSuggestionButtonClick = (event: PointerEvent) => {
		const value = (event.target as HTMLElement).dataset.value

		if (value) {
			const textarea = this.textarea

			if (!textarea) {
				return
			}

			const start = textarea.selectionStart
			const end = textarea.selectionEnd

			store.input = store.input.slice(0, start) + value + store.input.slice(end)

			textarea.focus()

			requestAnimationFrame(() => {
				textarea.setSelectionRange(start + value.length, start + value.length)
			})
		}
	}
}

// export const pageMain = new PageMain();
