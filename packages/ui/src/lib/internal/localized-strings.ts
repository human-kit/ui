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
	'select.placeholder': {
		en: 'Select an option',
		es: 'Seleccione una opción',
		pt: 'Selecione uma opção',
		fr: 'Sélectionnez une option',
		de: 'Option auswählen',
		it: 'Seleziona un’opzione'
	},
	'slider.minimum': {
		en: 'Minimum',
		es: 'Mínimo',
		pt: 'Mínimo',
		fr: 'Minimum',
		de: 'Minimum',
		it: 'Minimo'
	},
	'slider.maximum': {
		en: 'Maximum',
		es: 'Máximo',
		pt: 'Máximo',
		fr: 'Maximum',
		de: 'Maximum',
		it: 'Massimo'
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
	'transferList.moveSelectedTo': {
		en: 'Move selected to {label}',
		es: 'Mover la selección a {label}',
		pt: 'Mover a seleção para {label}',
		fr: 'Déplacer la sélection vers {label}',
		de: 'Auswahl nach {label} verschieben',
		it: 'Sposta la selezione in {label}'
	},
	'transferList.moveAllTo': {
		en: 'Move all to {label}',
		es: 'Mover todo a {label}',
		pt: 'Mover tudo para {label}',
		fr: 'Tout déplacer vers {label}',
		de: 'Alle nach {label} verschieben',
		it: 'Sposta tutto in {label}'
	},
	'transferList.moveUp': {
		en: 'Move selected up',
		es: 'Subir la selección',
		pt: 'Mover a seleção para cima',
		fr: 'Déplacer la sélection vers le haut',
		de: 'Auswahl nach oben verschieben',
		it: 'Sposta la selezione in alto'
	},
	'transferList.moveDown': {
		en: 'Move selected down',
		es: 'Bajar la selección',
		pt: 'Mover a seleção para baixo',
		fr: 'Déplacer la sélection vers le bas',
		de: 'Auswahl nach unten verschieben',
		it: 'Sposta la selezione in basso'
	},
	'transferList.itemMovedUp': {
		en: '1 item moved up',
		es: '1 elemento subido',
		pt: '1 item movido para cima',
		fr: '1 élément déplacé vers le haut',
		de: '1 Element nach oben verschoben',
		it: '1 elemento spostato in alto'
	},
	'transferList.itemsMovedUp': {
		en: '{count} items moved up',
		es: '{count} elementos subidos',
		pt: '{count} itens movidos para cima',
		fr: '{count} éléments déplacés vers le haut',
		de: '{count} Elemente nach oben verschoben',
		it: '{count} elementi spostati in alto'
	},
	'transferList.itemMovedDown': {
		en: '1 item moved down',
		es: '1 elemento bajado',
		pt: '1 item movido para baixo',
		fr: '1 élément déplacé vers le bas',
		de: '1 Element nach unten verschoben',
		it: '1 elemento spostato in basso'
	},
	'transferList.itemsMovedDown': {
		en: '{count} items moved down',
		es: '{count} elementos bajados',
		pt: '{count} itens movidos para baixo',
		fr: '{count} éléments déplacés vers le bas',
		de: '{count} Elemente nach unten verschoben',
		it: '{count} elementi spostati in basso'
	},
	'transferList.itemMoved': {
		en: '1 item moved to {label}',
		es: '1 elemento movido a {label}',
		pt: '1 item movido para {label}',
		fr: '1 élément déplacé vers {label}',
		de: '1 Element nach {label} verschoben',
		it: '1 elemento spostato in {label}'
	},
	'transferList.itemsMoved': {
		en: '{count} items moved to {label}',
		es: '{count} elementos movidos a {label}',
		pt: '{count} itens movidos para {label}',
		fr: '{count} éléments déplacés vers {label}',
		de: '{count} Elemente nach {label} verschoben',
		it: '{count} elementi spostati in {label}'
	},
	'avatar.more': {
		en: '{count} more',
		es: '{count} más',
		pt: '{count} mais',
		fr: '{count} de plus',
		de: '{count} weitere',
		it: '{count} altri'
	},
	'breadcrumbs.label': {
		en: 'Breadcrumb',
		es: 'Ruta de navegación',
		pt: 'Trilha de navegação',
		fr: "Fil d'Ariane",
		de: 'Brotkrumennavigation',
		it: 'Percorso di navigazione'
	},
	'breadcrumbs.showMore': {
		en: 'Show {count} more pages',
		es: 'Mostrar {count} páginas más',
		pt: 'Mostrar mais {count} páginas',
		fr: 'Afficher {count} pages de plus',
		de: '{count} weitere Seiten anzeigen',
		it: 'Mostra altre {count} pagine'
	},
	'segment.empty': {
		en: 'Empty',
		es: 'Vacío',
		pt: 'Vazio',
		fr: 'Vide',
		de: 'Leer',
		it: 'Vuoto'
	},
	'toast.notifications': {
		en: 'Notifications',
		es: 'Notificaciones',
		pt: 'Notificações',
		fr: 'Notifications',
		de: 'Benachrichtigungen',
		it: 'Notifiche'
	},
	'toast.oneNotification': {
		en: '1 notification',
		es: '1 notificación',
		pt: '1 notificação',
		fr: '1 notification',
		de: '1 Benachrichtigung',
		it: '1 notifica'
	},
	'toast.multipleNotifications': {
		en: '{count} notifications',
		es: '{count} notificaciones',
		pt: '{count} notificações',
		fr: '{count} notifications',
		de: '{count} Benachrichtigungen',
		it: '{count} notifiche'
	},
	'rating.valueText': {
		en: '{value} of {count}',
		es: '{value} de {count}',
		pt: '{value} de {count}',
		fr: '{value} sur {count}',
		de: '{value} von {count}',
		it: '{value} su {count}'
	},
	'rating.empty': {
		en: 'No rating',
		es: 'Sin calificación',
		pt: 'Sem classificação',
		fr: 'Aucune note',
		de: 'Keine Bewertung',
		it: 'Nessuna valutazione'
	},
	'rating.label': {
		en: 'Rating',
		es: 'Calificación',
		pt: 'Classificação',
		fr: 'Note',
		de: 'Bewertung',
		it: 'Valutazione'
	},
	'pinInput.digitLabel': {
		en: 'Digit {index} of {count}',
		es: 'Dígito {index} de {count}',
		pt: 'Dígito {index} de {count}',
		fr: 'Chiffre {index} sur {count}',
		de: 'Ziffer {index} von {count}',
		it: 'Cifra {index} di {count}'
	},
	'pinInput.characterLabel': {
		en: 'Character {index} of {count}',
		es: 'Carácter {index} de {count}',
		pt: 'Caractere {index} de {count}',
		fr: 'Caractère {index} sur {count}',
		de: 'Zeichen {index} von {count}',
		it: 'Carattere {index} di {count}'
	},
	'pinInput.label': {
		en: 'Verification code',
		es: 'Código de verificación',
		pt: 'Código de verificação',
		fr: 'Code de vérification',
		de: 'Bestätigungscode',
		it: 'Codice di verifica'
	},
	'colorPicker.label': {
		en: 'Color',
		es: 'Color',
		pt: 'Cor',
		fr: 'Couleur',
		de: 'Farbe',
		it: 'Colore'
	},
	'colorPicker.hue': {
		en: 'Hue',
		es: 'Matiz',
		pt: 'Matiz',
		fr: 'Teinte',
		de: 'Farbton',
		it: 'Tonalità'
	},
	'colorPicker.saturation': {
		en: 'Saturation',
		es: 'Saturación',
		pt: 'Saturação',
		fr: 'Saturation',
		de: 'Sättigung',
		it: 'Saturazione'
	},
	'colorPicker.brightness': {
		en: 'Brightness',
		es: 'Brillo',
		pt: 'Brilho',
		fr: 'Luminosité',
		de: 'Helligkeit',
		it: 'Luminosità'
	},
	'colorPicker.lightness': {
		en: 'Lightness',
		es: 'Luminosidad',
		pt: 'Luminosidade',
		fr: 'Clarté',
		de: 'Helligkeit',
		it: 'Chiarezza'
	},
	'colorPicker.alpha': {
		en: 'Alpha',
		es: 'Alfa',
		pt: 'Alfa',
		fr: 'Alpha',
		de: 'Alpha',
		it: 'Alfa'
	},
	'colorPicker.red': {
		en: 'Red',
		es: 'Rojo',
		pt: 'Vermelho',
		fr: 'Rouge',
		de: 'Rot',
		it: 'Rosso'
	},
	'colorPicker.green': {
		en: 'Green',
		es: 'Verde',
		pt: 'Verde',
		fr: 'Vert',
		de: 'Grün',
		it: 'Verde'
	},
	'colorPicker.blue': {
		en: 'Blue',
		es: 'Azul',
		pt: 'Azul',
		fr: 'Bleu',
		de: 'Blau',
		it: 'Blu'
	},
	'colorPicker.hex': {
		en: 'Hex',
		es: 'Hex',
		pt: 'Hex',
		fr: 'Hex',
		de: 'Hex',
		it: 'Hex'
	},
	'colorPicker.eyeDropper': {
		en: 'Pick a color from the screen',
		es: 'Tomar un color de la pantalla',
		pt: 'Escolher uma cor da tela',
		fr: 'Prendre une couleur sur l’écran',
		de: 'Eine Farbe vom Bildschirm wählen',
		it: 'Scegliere un colore dallo schermo'
	},
	'colorPicker.swatches': {
		en: 'Color swatches',
		es: 'Muestras de color',
		pt: 'Amostras de cor',
		fr: 'Échantillons de couleur',
		de: 'Farbfelder',
		it: 'Campioni di colore'
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
