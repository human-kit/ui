/**
 * Minimal shared localization tables for the library's internal strings.
 *
 * This intentionally mirrors the lightweight per-locale-table approach that
 * components such as NumberField already used: a small es/pt/fr/de/it table
 * per key with English as the ultimate fallback. Components resolve their
 * locale from the LocaleProvider context; when no locale is available the
 * English string is returned, which keeps SSR output and tests deterministic.
 */

type LocalizedTable = {
	en: string;
	es: string;
	pt: string;
	fr: string;
	de: string;
	it: string;
};

const LOCALIZED_STRINGS = {
	'calendar.nextPage': {
		en: 'Next page',
		es: 'Página siguiente',
		pt: 'Página seguinte',
		fr: 'Page suivante',
		de: 'Nächste Seite',
		it: 'Pagina successiva'
	},
	'calendar.previousPage': {
		en: 'Previous page',
		es: 'Página anterior',
		pt: 'Página anterior',
		fr: 'Page précédente',
		de: 'Vorherige Seite',
		it: 'Pagina precedente'
	},
	'datePicker.calendar': {
		en: 'Calendar',
		es: 'Calendario',
		pt: 'Calendário',
		fr: 'Calendrier',
		de: 'Kalender',
		it: 'Calendario'
	},
	'tree.selectItem': {
		en: 'Select {label}',
		es: 'Seleccionar {label}',
		pt: 'Selecionar {label}',
		fr: 'Sélectionner {label}',
		de: '{label} auswählen',
		it: 'Seleziona {label}'
	},
	'table.selectAllRows': {
		en: 'Select all rows',
		es: 'Seleccionar todas las filas',
		pt: 'Selecionar todas as linhas',
		fr: 'Sélectionner toutes les lignes',
		de: 'Alle Zeilen auswählen',
		it: 'Seleziona tutte le righe'
	},
	'table.selectRow': {
		en: 'Select row {id}',
		es: 'Seleccionar fila {id}',
		pt: 'Selecionar linha {id}',
		fr: 'Sélectionner la ligne {id}',
		de: 'Zeile {id} auswählen',
		it: 'Seleziona riga {id}'
	},
	'table.selectRowUnknown': {
		en: 'Select row',
		es: 'Seleccionar fila',
		pt: 'Selecionar linha',
		fr: 'Sélectionner la ligne',
		de: 'Zeile auswählen',
		it: 'Seleziona riga'
	},
	'table.sortedAscending': {
		en: '{label} sorted ascending.',
		es: '{label} ordenado de forma ascendente.',
		pt: '{label} ordenado de forma ascendente.',
		fr: '{label} trié par ordre croissant.',
		de: '{label} aufsteigend sortiert.',
		it: '{label} ordinato in ordine crescente.'
	},
	'table.sortedDescending': {
		en: '{label} sorted descending.',
		es: '{label} ordenado de forma descendente.',
		pt: '{label} ordenado de forma descendente.',
		fr: '{label} trié par ordre décroissant.',
		de: '{label} absteigend sortiert.',
		it: '{label} ordinato in ordine decrescente.'
	},
	'table.sortingCleared': {
		en: 'Sorting cleared.',
		es: 'Orden eliminado.',
		pt: 'Ordenação removida.',
		fr: 'Tri effacé.',
		de: 'Sortierung aufgehoben.',
		it: 'Ordinamento rimosso.'
	},
	'table.selectionUnavailable': {
		en: 'Selection unavailable for this row.',
		es: 'Selección no disponible para esta fila.',
		pt: 'Seleção indisponível para esta linha.',
		fr: 'Sélection indisponible pour cette ligne.',
		de: 'Auswahl für diese Zeile nicht verfügbar.',
		it: 'Selezione non disponibile per questa riga.'
	},
	'table.resizeColumn': {
		en: 'Resize {label} column',
		es: 'Redimensionar la columna {label}',
		pt: 'Redimensionar a coluna {label}',
		fr: 'Redimensionner la colonne {label}',
		de: 'Größe der Spalte {label} ändern',
		it: 'Ridimensiona la colonna {label}'
	},
	'table.columnWidth': {
		en: '{label} width {width}px.',
		es: 'Ancho de {label}: {width}px.',
		pt: 'Largura de {label}: {width}px.',
		fr: 'Largeur de {label} : {width}px.',
		de: 'Breite von {label}: {width}px.',
		it: 'Larghezza di {label}: {width}px.'
	},
	'table.columnFallback': {
		en: 'Column',
		es: 'Columna',
		pt: 'Coluna',
		fr: 'Colonne',
		de: 'Spalte',
		it: 'Colonna'
	},
	'numberField.increment': {
		en: 'Increment',
		es: 'Incrementar',
		pt: 'Incrementar',
		fr: 'Augmenter',
		de: 'Erhöhen',
		it: 'Aumentare'
	},
	'numberField.decrement': {
		en: 'Decrement',
		es: 'Disminuir',
		pt: 'Diminuir',
		fr: 'Diminuer',
		de: 'Verringern',
		it: 'Diminuire'
	},
	'numberField.enterValidNumber': {
		en: 'Enter a valid number.',
		es: 'Ingrese un número válido.',
		pt: 'Insira um número válido.',
		fr: 'Saisissez un nombre valide.',
		de: 'Geben Sie eine gültige Zahl ein.',
		it: 'Inserisci un numero valido.'
	},
	'numberField.valueBetween': {
		en: 'Value must be between {min} and {max}.',
		es: 'El valor debe estar entre {min} y {max}.',
		pt: 'O valor deve estar entre {min} e {max}.',
		fr: 'La valeur doit être comprise entre {min} et {max}.',
		de: 'Der Wert muss zwischen {min} und {max} liegen.',
		it: 'Il valore deve essere compreso tra {min} e {max}.'
	},
	'numberField.valueGreaterOrEqual': {
		en: 'Value must be greater than or equal to {min}.',
		es: 'El valor debe ser mayor o igual que {min}.',
		pt: 'O valor deve ser maior ou igual a {min}.',
		fr: 'La valeur doit être supérieure ou égale à {min}.',
		de: 'Der Wert muss größer oder gleich {min} sein.',
		it: 'Il valore deve essere maggiore o uguale a {min}.'
	},
	'numberField.valueLessOrEqual': {
		en: 'Value must be less than or equal to {max}.',
		es: 'El valor debe ser menor o igual que {max}.',
		pt: 'O valor deve ser menor ou igual a {max}.',
		fr: 'La valeur doit être inférieure ou égale à {max}.',
		de: 'Der Wert muss kleiner oder gleich {max} sein.',
		it: 'Il valore deve essere minore o uguale a {max}.'
	},
	'numberField.invalidValue': {
		en: 'Invalid value.',
		es: 'Valor no válido.',
		pt: 'Valor inválido.',
		fr: 'Valeur non valide.',
		de: 'Ungültiger Wert.',
		it: 'Valore non valido.'
	},
	'clock.wheelPicker': {
		en: 'wheel picker',
		es: 'selector en rueda',
		pt: 'seletor em roda',
		fr: 'sélecteur rotatif',
		de: 'Rad-Auswahl',
		it: 'selettore a rotella'
	},
	'combobox.showOptions': {
		en: 'Show options',
		es: 'Mostrar opciones',
		pt: 'Mostrar opções',
		fr: 'Afficher les options',
		de: 'Optionen anzeigen',
		it: 'Mostra opzioni'
	},
	'combobox.hideOptions': {
		en: 'Hide options',
		es: 'Ocultar opciones',
		pt: 'Ocultar opções',
		fr: 'Masquer les options',
		de: 'Optionen ausblenden',
		it: 'Nascondi opzioni'
	},
	'combobox.noResults': {
		en: 'No results available',
		es: 'No hay resultados disponibles',
		pt: 'Nenhum resultado disponível',
		fr: 'Aucun résultat disponible',
		de: 'Keine Ergebnisse verfügbar',
		it: 'Nessun risultato disponibile'
	},
	'combobox.oneResult': {
		en: '1 result available',
		es: '1 resultado disponible',
		pt: '1 resultado disponível',
		fr: '1 résultat disponible',
		de: '1 Ergebnis verfügbar',
		it: '1 risultato disponibile'
	},
	'combobox.multipleResults': {
		en: '{count} results available',
		es: '{count} resultados disponibles',
		pt: '{count} resultados disponíveis',
		fr: '{count} résultats disponibles',
		de: '{count} Ergebnisse verfügbar',
		it: '{count} risultati disponibili'
	},
	'segment.empty': {
		en: 'Empty',
		es: 'Vacío',
		pt: 'Vazio',
		fr: 'Vide',
		de: 'Leer',
		it: 'Vuoto'
	}
} as const satisfies Record<string, LocalizedTable>;

export type LocalizedStringKey = keyof typeof LOCALIZED_STRINGS;

type LocalizedLanguage = keyof LocalizedTable;

function resolveLanguage(locale: string | undefined): LocalizedLanguage {
	const language = locale?.split('-')[0]?.toLowerCase();
	if (
		language === 'es' ||
		language === 'pt' ||
		language === 'fr' ||
		language === 'de' ||
		language === 'it'
	) {
		return language;
	}
	return 'en';
}

export function resolveLocalizedString(
	locale: string | undefined,
	key: LocalizedStringKey,
	params?: Record<string, string | number>
): string {
	const table = LOCALIZED_STRINGS[key];
	let text: string = table[resolveLanguage(locale)] ?? table.en;

	if (params) {
		for (const [name, value] of Object.entries(params)) {
			text = text.replaceAll(`{${name}}`, String(value));
		}
	}

	return text;
}
