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
	methodology?: string;
	sources: ViewMetaSource[];
}

export type ViewMetaMap = Record<string, ViewMetaEntry>;

export const viewMetaV2: ViewMetaMap = {
	overview: {
		headline: 'Cooling emissions could triple by 2050. Or we cut them 73%.',
		subhead: 'The CoolProgress Dashboard tracks whether the world is on the sustainable cooling pathway.',
		insight:
			'Today, cooling produces over 2,400 Mt CO\u2082e annually from AC, refrigerators, and fans combined. ' +
			'Under business-as-usual, this triples to over 6,000 Mt by 2050. ' +
			'But with efficiency standards, the Kigali refrigerant phase-down, and grid decarbonization working together, ' +
			'emissions can peak before 2035 and decline to 1,554 Mt by 2050 \u2014 a 73% reduction from BAU.',
		entryStat: '2,401 Mt CO\u2082e today -- 73% reduction achievable by 2050',
		sources: [
			{
				name: 'HEAT GmbH',
				url: 'https://www.heat-gmbh.de',
				logo: '/images/heat-logo.png'
			},
			{
				name: 'CLASP',
				url: 'https://www.clasp.ngo/',
				logo: '/images/clasp-logo.png'
			},
			{
				name: 'IEA',
				url: 'https://www.iea.org/reports/the-future-of-cooling',
				logo: '/images/iea-logo.png'
			},
			{
				name: 'Clean Cooling Collaborative',
				url: 'https://cleancoolingcollaborative.org'
			}
		]
	},

	emissions: {
		headline: 'Cooling emissions will triple by 2050 \u2014 unless we act now',
		subhead:
			'AC alone will emit more than global aviation by 2035. Three interventions can cut 73% by mid-century.',
		insight:
			'BAU 2050: 6,009 Mt CO\u2082e. DECARB 2050: 1,554 Mt. The three-layer approach \u2014 efficient appliances, ' +
			'low-GWP refrigerants, and clean grids \u2014 achieves 4,455 Mt of annual savings by 2050. ' +
			'Indirect emissions (electricity) account for 70% of the sector\'s impact. Direct emissions (refrigerant leaks) add the rest.',
		entryStat: '6,009 Mt BAU vs 1,554 Mt DECARB by 2050 -- 73% reduction',
		sources: [
			{
				name: 'HEAT GmbH',
				url: 'https://www.heat-gmbh.de',
				logo: '/images/heat-logo.png'
			},
			{
				name: 'Mepsy by CLASP',
				url: 'https://www.clasp.ngo/tools/mepsy/',
				logo: '/images/clasp-logo.png'
			},
			{
				name: 'IEA STEPS',
				url: 'https://www.iea.org/reports/world-energy-outlook-2025'
			}
		]
	},

	meps: {
		headline: 'The 3x efficiency gap is the cheapest climate solution we are ignoring',
		subhead: 'Best-in-class ACs are 3x more efficient than the worst on sale today. MEPS can close this gap.',
		insight:
			'If every country adopted MEPS at today\u2019s best-available-technology level, cooling energy demand drops 40\u201350% by 2050. ' +
			'That is roughly India\u2019s entire electricity output. Yet millions of inefficient units enter markets with weak or no standards every year, ' +
			'locking in excess energy consumption for 10\u201315 years.',
		entryStat: '1,300 TWh per year -- potential savings from global MEPS harmonization',
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
		headline: '157 countries ratified Kigali. But ratification is not implementation.',
		subhead:
			'The Kigali Amendment can prevent 0.5\u00B0C of warming \u2014 if commitments become refrigerant transitions on the ground.',
		insight:
			'157 parties have ratified, covering 95% of global HFC consumption. Non-A5 countries must reach 15% of baseline by 2036. ' +
			'The transition runs from high-GWP HFCs (R-410A: GWP 2,088) toward natural refrigerants (R-290 propane: GWP 3). ' +
			'China and India already manufacture R-290 split ACs at scale. The real test: manufacturing conversion, technician training, and F-gas recovery.',
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
		headline: '1.2 billion people face dangerous heat without cooling',
		subhead:
			'Cooling is health infrastructure. 420,000 die annually from food spoiled by broken cold chains.',
		insight:
			'Urban poor (695M) and rural poor (309M) are most at risk. In Africa, only 5% of households own an AC. ' +
			'40% of food production in Africa is lost post-harvest. Heat stress could reduce global working hours by 2.2% by 2030, equivalent to 80 million jobs. ' +
			'Passive cooling, solar cold chains, and community centers can close the gap sustainably.',
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
		headline: '71 countries pledged. Fewer than 30% of NDCs mention cooling.',
		subhead:
			'The gap between political commitment and policy implementation is the central challenge of cooling governance.',
		insight:
			'71 nations signed the Global Cooling Pledge at COP28. 49 have MEPS, 37 include cooling in NDCs, 40 have building codes. ' +
			'Yet fewer than 30% of NDCs explicitly mention cooling, and only ~20 countries have completed NCAPs. ' +
			'The most effective NCAPs link directly to NDC targets with funded implementation timelines.',
		entryStat: '71 GCP signatories -- <30% of NDCs mention cooling -- ~20 NCAPs completed',
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
