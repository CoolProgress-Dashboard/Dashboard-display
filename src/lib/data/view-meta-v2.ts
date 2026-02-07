/**
 * CoolProgress Dashboard V2 - View Meta (refreshed)
 *
 * Drop-in replacement for the inline `viewMeta` object in +page.svelte.
 * Combines CCC-style headlines and story hooks from pillar-content.ts
 * with the original source attributions (logos, URLs) and additional
 * partner links from pillar-partner-links.ts.
 *
 * Usage in +page.svelte:
 *   import { viewMetaV2 as viewMeta } from '$lib/data/view-meta-v2';
 */

export interface ViewMetaSource {
	name: string;
	url: string;
	logo?: string;
	logos?: string[];
	logoLarge?: boolean;
}

export interface ViewMetaEntry {
	headline: string;
	subhead: string;
	insight: string;
	entryStat?: string;
	sources: ViewMetaSource[];
}

export type ViewMetaMap = Record<string, ViewMetaEntry>;

export const viewMetaV2: ViewMetaMap = {
	overview: {
		headline: 'The planet is warming. Cooling must not make it worse.',
		subhead: 'Tracking the global transition to sustainable, equitable cooling.',
		insight:
			'Cooling keeps food fresh, medicines viable, workers productive, and people alive during heat waves. ' +
			'Yet the way we cool today accelerates the very warming that makes cooling essential. ' +
			'By 2050, global cooling demand will triple. The choices we make now determine whether that growth locks in a climate disaster or powers a sustainable transition.',
		entryStat: '10 ACs sold every second -- 3 billion more units by 2050',
		sources: [
			{
				name: 'IEA Future of Cooling',
				url: 'https://www.iea.org/reports/the-future-of-cooling'
			},
			{
				name: 'Cool Coalition Data Hub',
				url: 'https://coolcoalition.org/'
			},
			{
				name: 'CLASP Policy Database',
				url: 'https://www.clasp.ngo/tools/clasp-policy-resource-center/'
			},
			{
				name: 'Clean Cooling Collaborative',
				url: 'https://cleancoolingcollaborative.org'
			}
		]
	},

	emissions: {
		headline: "We're stuck in a vicious cycle",
		subhead:
			'Cooling produces 7% of global emissions and demand is set to triple. Bending the curve starts now.',
		insight:
			'Every air conditioner running on a fossil-fueled grid adds CO\u2082 to the atmosphere. ' +
			'Every refrigerant leak releases gases hundreds to thousands of times more potent than CO\u2082. ' +
			'Cooling sits at the center of a vicious cycle: rising temperatures drive cooling demand, which drives emissions, which drives temperatures higher. ' +
			'Without intervention, emissions from cooling could double by 2040.',
		entryStat: '7% of global GHG emissions -- set to double by 2040',
		sources: [
			{
				name: 'Mepsy by CLASP',
				url: 'https://www.clasp.ngo/tools/mepsy/',
				logo: '/images/clasp-logo.png'
			},
			{
				name: 'Green Cooling Initiative',
				url: 'https://www.green-cooling-initiative.org/country-data#!total-emissions/all-sectors/absolute',
				logos: ['/images/heat-logo.png', '/images/giz-logo.png']
			},
			{
				name: 'IEA Future of Cooling',
				url: 'https://www.iea.org/reports/the-future-of-cooling'
			}
		]
	},

	meps: {
		headline: 'Efficiency is the cheapest clean energy',
		subhead: 'The invisible climate solution hiding in plain sight.',
		insight:
			'Every year, millions of inefficient air conditioners and refrigerators enter markets with weak or nonexistent standards. ' +
			'These units will run for 10 to 15 years, locking in excess energy consumption that no retrofit can fix. ' +
			'This is environmental dumping in plain sight: manufacturers sell their least efficient models in countries that lack regulations to block them. ' +
			'The efficiency gap between the best and worst products on the market today exceeds a factor of three.',
		entryStat: '3x efficiency gap between best and worst products on sale today',
		sources: [
			{
				name: 'CLASP Policy Resource Center (CPRC)',
				url: 'https://www.clasp.ngo/tools/clasp-policy-resource-center/',
				logo: '/images/clasp-logo.png'
			},
			{
				name: 'United for Efficiency (U4E)',
				url: 'https://united4efficiency.org'
			},
			{
				name: 'U4E Model Regulation Guidelines',
				url: 'https://united4efficiency.org/resources/model-regulation-guidelines/'
			}
		]
	},

	kigali: {
		headline: 'The refrigerant revolution',
		subhead:
			'From HFCs to natural cooling -- the Kigali Amendment is rewriting the rules.',
		insight:
			'The Montreal Protocol already eliminated the ozone-depleting CFCs and is phasing out HCFCs. ' +
			'But the replacement gases -- hydrofluorocarbons (HFCs) -- turned out to be potent greenhouse gases. ' +
			'R-134a has a GWP of 1,430. R-410A sits at 2,088. Left unchecked, HFC growth alone would add 0.5\u00B0C of warming by 2100. ' +
			'The Kigali Amendment, adopted in 2016, created a legally binding pathway to phase down HFC production and consumption by over 80%.',
		entryStat: '157 parties ratified -- 95% of global HFC consumption covered',
		sources: [
			{
				name: 'UNEP Ozone Secretariat',
				url: 'https://ozone.unep.org/treaties/montreal-protocol/amendments/kigali-amendment-2016'
			},
			{
				name: 'MLF Project Database',
				url: 'https://www.multilateralfund.org/OurWork/default.aspx'
			},
			{
				name: 'Kigali Amendment Tracker',
				url: 'https://ozone.unep.org/'
			},
			{
				name: 'Montreal Protocol',
				url: 'https://ozone.unep.org/treaties/montreal-protocol'
			}
		]
	},

	access: {
		headline: 'Cooling is an equity issue',
		subhead:
			'More than 1.2 billion people face dangerous heat without adequate cooling.',
		insight:
			'In 2023, heat waves killed tens of thousands of people across South Asia, the Sahel, and Southern Europe. ' +
			"The vast majority of victims lacked access to even basic cooling. Sustainable Energy for All's Chilling Prospects report " +
			'identifies 1.2 billion people at high risk -- concentrated in low-income urban settlements and rural communities ' +
			'across Sub-Saharan Africa, South Asia, and Southeast Asia. For these populations, cooling is not a luxury. It is health infrastructure.',
		entryStat: '1.2 billion people at high risk -- 420,000 deaths/year from spoiled food',
		sources: [
			{
				name: 'SEforALL Chilling Prospects 2025',
				url: 'https://www.seforall.org/data-stories/chilling-prospects-2025',
				logo: '/images/seforall-logo.jpg',
				logoLarge: true
			},
			{
				name: 'Clean Cooling Collaborative',
				url: 'https://cleancoolingcollaborative.org'
			}
		]
	},

	policy: {
		headline: 'From pledge to action',
		subhead:
			'66+ countries signed the Global Cooling Pledge at COP28. Now comes the hard part.',
		insight:
			'The Global Cooling Pledge, launched at COP28 in December 2023, committed signatories to reduce cooling-related emissions, ' +
			'expand sustainable cooling access, and integrate cooling into their Nationally Determined Contributions. ' +
			'It was the first time cooling received dedicated political attention at a UNFCCC COP. ' +
			'But pledges alone do not reduce emissions. The gap between commitment and implementation remains the central challenge of global cooling governance.',
		entryStat: '<30% of NDCs mention cooling -- only ~20 countries have action plans',
		sources: [
			{
				name: 'Cool Coalition Pledge',
				url: 'https://coolcoalition.org/global-cooling-pledge/',
				logo: '/images/unep.png',
				logoLarge: true
			},
			{
				name: 'Net Zero Appliances NDC Toolkit',
				url: 'https://www.clasp.ngo/tools/ndc-appliance-efficiency-toolkit/',
				logo: '/images/clasp-logo.png'
			},
			{
				name: 'Find NCAPs at Climate Policy Radar',
				url: 'https://www.climatepolicyradar.org/',
				logo: '/images/climate-policy-radar-logo.jfif'
			},
			{
				name: 'SEforALL Cooling for All',
				url: 'https://www.seforall.org/cooling-for-all'
			},
			{
				name: 'Green Climate Fund',
				url: 'https://www.greenclimate.fund'
			}
		]
	}
};
