import '@material/web/iconbutton/icon-button.js'
import '@material/web/textfield/filled-text-field.js'
import '@material/web/textfield/outlined-text-field.js'
import {withController} from '@snar/lit'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, query} from 'lit/decorators.js'
import {SVG_GEMINI} from '../assets/assets.js'
import {getSmallKanaAtEnd, suggestEndings} from '../server/functions.js'
import {stateless} from '../stateless.js'
import {store} from '../store.js'
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
	@query('[type=textarea]') textarea?: HTMLTextAreaElement

	render() {
		const smallKana = store.input ? getSmallKanaAtEnd(store.input) : undefined
		return html`<!---->
			<div class="flex flex-col">
				${store.F.TEXTAREA('', 'input', {
					autofocus: true,
					rows: 10,
					// variant: 'outlined',
					style: {
						'--md-sys-typescale-body-large-size': '1.50rem',
						'--md-sys-typescale-body-large-font':
							"'Noto Sans JP', 'Noto Sans Symbols 2', 'Noto Serif JP', sans-serif",
					},
				})}
				<div
					class="p-1 flex justify-between items-start gap-1"
					@click="${(event: PointerEvent) => {
						const value = (event.target as HTMLElement).dataset.value
						if (value) {
							store.input += value
							this.textarea?.focus()
						}
					}}"
				>
					<div>
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
						<md-filled-tonal-icon-button data-value="。">
							<span>。</span>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button data-value="、">
							<span>、</span>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button data-value="？">
							<span>？</span>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button data-value="！">
							<span>！</span>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button data-value="「">
							<span>「</span>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button data-value="」">
							<span>」</span>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button data-value="『">
							<span>『</span>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button data-value="』">
							<span>』</span>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button data-value="（">
							<span>（</span>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button data-value="）">
							<span>）</span>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button data-value="・">
							<span>・</span>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button data-value="〜">
							<span>〜</span>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button data-value="…">
							<span>…</span>
						</md-filled-tonal-icon-button>
						<md-filled-tonal-icon-button data-value="ー">
							<span>ー</span>
						</md-filled-tonal-icon-button>
					</div>
					<div class="flex-1 flex flex-wrap gap-2">
						${store.lastSuggestions.map(
							(suggestion) =>
								html`<!-- -->
									<md-outlined-button data-value=${suggestion}>
										<span class="jp">${suggestion}</span>
									</md-outlined-button>
									<!-- -->`,
						)}
					</div>
					<md-outlined-button
						?disabled="${!store.geminiApiKey || stateless.loading}"
						@click=${suggestEndings}
					>
						<md-icon slot="icon">${SVG_GEMINI}</md-icon>
						Suggest endings
					</md-outlined-button>
				</div>
			</div>

			<div class="relative">
				<div
					class="absolute right-1 top-1 bottom-1 flex flex-col items-center gap-3"
				>
					<md-icon-button><md-icon>content_copy</md-icon></md-icon-button>
					<md-icon-button><md-icon>clear</md-icon></md-icon-button>
				</div>
				${store.F.TEXTAREA('Kept', 'keepInput', {autofocus: true, rows: 3, disabled: true, resetButton: {icon: html``}})}
			</div>
			<!----> `
	}
}

// export const pageMain = new PageMain();
