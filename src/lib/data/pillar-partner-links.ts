/**
 * CoolProgress Dashboard V2 - Partner and Source Links
 *
 * Maps inline text mentions to their canonical URLs for use in
 * pillar narratives. When rendering pillar content, these mappings
 * allow text mentions to become clickable hyperlinks.
 */

export interface PartnerLink {
	/** The text pattern to match in pillar content (case-insensitive) */
	mention: string;
	/** The canonical URL for this partner or source */
	url: string;
	/** Short label for the link (used as aria-label or tooltip) */
	label: string;
}

export const partnerLinks: PartnerLink[] = [
	// Organizations
	{
		mention: 'Clean Cooling Collaborative',
		url: 'https://cleancoolingcollaborative.org',
		label: 'Clean Cooling Collaborative'
	},
	{
		mention: 'CLASP',
		url: 'https://www.clasp.ngo',
		label: 'CLASP - Collaborative Labeling and Appliance Standards Program'
	},
	{
		mention: 'Sustainable Energy for All',
		url: 'https://www.seforall.org',
		label: 'Sustainable Energy for All (SE4ALL)'
	},
	{
		mention: 'SE4ALL',
		url: 'https://www.seforall.org',
		label: 'Sustainable Energy for All'
	},
	{
		mention: 'United for Efficiency',
		url: 'https://united4efficiency.org',
		label: 'United for Efficiency (U4E)'
	},
	{
		mention: 'U4E',
		url: 'https://united4efficiency.org',
		label: 'United for Efficiency'
	},
	{
		mention: 'Green Climate Fund',
		url: 'https://www.greenclimate.fund',
		label: 'Green Climate Fund'
	},

	// Reports and Publications
	{
		mention: 'Chilling Prospects',
		url: 'https://www.seforall.org/chilling-prospects',
		label: 'SE4ALL Chilling Prospects Report'
	},
	{
		mention: 'IEA Future of Cooling',
		url: 'https://www.iea.org/reports/the-future-of-cooling',
		label: 'IEA - The Future of Cooling (2018)'
	},
	{
		mention: 'IEA Efficient Cooling Scenario',
		url: 'https://www.iea.org/reports/the-future-of-cooling',
		label: 'IEA Efficient Cooling Scenario'
	},
	{
		mention: 'IEA projections',
		url: 'https://www.iea.org/reports/the-future-of-cooling',
		label: 'IEA Future of Cooling projections'
	},
	{
		mention: 'Model Regulation Guidelines',
		url: 'https://united4efficiency.org/resources/model-regulation-guidelines/',
		label: 'U4E Model Regulation Guidelines'
	},

	// Treaties and Agreements
	{
		mention: 'Kigali Amendment',
		url: 'https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016',
		label: 'Kigali Amendment to the Montreal Protocol'
	},
	{
		mention: 'Montreal Protocol',
		url: 'https://ozone.unep.org/treaties/montreal-protocol',
		label: 'Montreal Protocol on Substances that Deplete the Ozone Layer'
	},
	{
		mention: 'Global Cooling Pledge',
		url: 'https://www.cop28.com/en/global-cooling-pledge',
		label: 'Global Cooling Pledge (COP28)'
	},
	{
		mention: 'Paris Agreement',
		url: 'https://unfccc.int/process-and-meetings/the-paris-agreement',
		label: 'Paris Agreement under the UNFCCC'
	},

	// Standards and Metrics
	{
		mention: 'CSPF',
		url: 'https://www.clasp.ngo/research/all/cspf-the-metric-for-a-sustainable-cooling-future/',
		label: 'Cooling Seasonal Performance Factor'
	},

	// Regional Bodies
	{
		mention: 'ECOWAS',
		url: 'https://www.ecowas.int',
		label: 'Economic Community of West African States'
	},
	{
		mention: 'ASEAN',
		url: 'https://asean.org',
		label: 'Association of Southeast Asian Nations'
	},

	// Climate Processes
	{
		mention: 'COP28',
		url: 'https://www.cop28.com',
		label: 'UN Climate Change Conference COP28 (Dubai, 2023)'
	},
	{
		mention: 'NDC',
		url: 'https://unfccc.int/process-and-meetings/the-paris-agreement/nationally-determined-contributions-ndcs',
		label: 'Nationally Determined Contributions'
	},
	{
		mention: 'National Cooling Action Plans',
		url: 'https://www.seforall.org/cooling-for-all',
		label: 'National Cooling Action Plans (NCAPs)'
	},
	{
		mention: 'NCAPs',
		url: 'https://www.seforall.org/cooling-for-all',
		label: 'National Cooling Action Plans'
	}
];

/**
 * Utility: find the partner link for a given text mention.
 * Returns undefined if no match is found.
 */
export function findPartnerLink(text: string): PartnerLink | undefined {
	const lower = text.toLowerCase();
	return partnerLinks.find((link) => lower.includes(link.mention.toLowerCase()));
}

/**
 * Utility: replace all recognized partner mentions in a text block
 * with markdown-style links [mention](url).
 *
 * Processes longer mentions first to avoid partial replacements
 * (e.g., "National Cooling Action Plans" before "NDC").
 */
export function linkifyText(text: string): string {
	// Sort by mention length descending to match longer phrases first
	const sorted = [...partnerLinks].sort((a, b) => b.mention.length - a.mention.length);
	let result = text;

	for (const link of sorted) {
		// Use a global, case-insensitive regex to find mentions
		// Only replace if not already inside a markdown link
		const escaped = link.mention.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`(?<!\\[)\\b(${escaped})\\b(?!\\])(?!\\()`, 'gi');
		result = result.replace(regex, `[$1](${link.url})`);
	}

	return result;
}
