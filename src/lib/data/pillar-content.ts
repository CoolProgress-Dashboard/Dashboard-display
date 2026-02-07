/**
 * CoolProgress Dashboard V2 - Pillar Content
 *
 * Narrative content for each dashboard pillar, inspired by the
 * Clean Cooling Collaborative (cleancoolingcollaborative.org).
 *
 * Data references:
 * - IEA Future of Cooling (2018, updated 2023)
 * - SE4ALL Chilling Prospects (2022)
 * - UNEP Ozone Secretariat - Kigali Amendment
 * - CLASP Global MEPS database
 * - Global Cooling Pledge (COP28, 2023)
 */

export interface PillarHeroStat {
	value: string;
	label: string;
	context: string;
}

export interface PillarOverview {
	headline: string;
	subhead: string;
	storyHook: string;
	heroStats: PillarHeroStat[];
}

export interface PillarSection {
	headline: string;
	subhead: string;
	storyHook: string;
	keyNarrative: string;
	callToInsight: string;
	entryStat?: string;
}

export interface PillarContentMap {
	overview: PillarOverview;
	emissions: PillarSection;
	meps: PillarSection;
	kigali: PillarSection;
	access: PillarSection;
	policy: PillarSection;
}

export const pillarContent: PillarContentMap = {
	overview: {
		headline: 'The planet is warming. Cooling must not make it worse.',
		subhead: 'Tracking the global transition to sustainable, equitable cooling',
		storyHook:
			'Cooling keeps food fresh, medicines viable, workers productive, and people alive during heat waves. ' +
			'Yet the way we cool today accelerates the very warming that makes cooling essential. ' +
			'By 2050, global cooling demand will triple. The choices we make now determine whether that growth locks in a climate disaster or powers a sustainable transition.',
		heroStats: [
			{
				value: '7%',
				label: 'of global GHG emissions',
				context: 'Cooling accounts for roughly 7% of global greenhouse gas emissions through energy use and refrigerant leaks'
			},
			{
				value: '1.2B',
				label: 'people lack adequate cooling',
				context: 'More than 1.2 billion people in low- and middle-income countries face dangerous heat without access to cooling'
			},
			{
				value: '3x',
				label: 'demand growth by 2050',
				context: 'Global cooling energy demand is projected to triple by mid-century under business-as-usual scenarios'
			},
			{
				value: '66+',
				label: 'Global Cooling Pledge signatories',
				context: 'Over 66 countries committed to the Global Cooling Pledge at COP28 in Dubai, signaling political momentum'
			}
		]
	},

	emissions: {
		headline: "We're stuck in a vicious cycle",
		subhead: 'Cooling produces 7% of global emissions and demand is set to triple. Bending the curve starts now.',
		entryStat: '7% of global GHG emissions -- set to double by 2040',
		storyHook:
			'Every air conditioner running on a fossil-fueled grid adds CO2 to the atmosphere. ' +
			'Every refrigerant leak releases gases hundreds to thousands of times more potent than CO2. ' +
			'Cooling sits at the center of a vicious cycle: rising temperatures drive cooling demand, which drives emissions, which drives temperatures higher. ' +
			'Without intervention, emissions from cooling could double by 2040.',
		keyNarrative:
			'Cooling emissions split into two streams. Indirect emissions come from the electricity that powers compressors, fans, and chillers ' +
			'-- currently responsible for roughly 70% of the sector\'s climate impact. Direct emissions come from refrigerant gases that leak during ' +
			'manufacturing, operation, and disposal. High-GWP refrigerants like R-410A (GWP 2,088) and legacy R-22 (GWP 1,810) still dominate installed ' +
			'equipment globally. The indirect side depends on grid decarbonization and appliance efficiency. The direct side depends on the refrigerant ' +
			'transition underway through the Kigali Amendment. Both matter. Tackling one without the other solves only half the problem. ' +
			'Air conditioning alone accounts for roughly 1 GtCO2e per year today. Residential and commercial refrigeration add another significant share. ' +
			'In regions where cooling demand is growing fastest -- South Asia, Sub-Saharan Africa, Southeast Asia -- the grid is often the dirtiest, ' +
			'making efficiency gains even more consequential.',
		callToInsight:
			'Bending the emissions curve requires three simultaneous moves: shift to ultra-low-GWP refrigerants, double the energy efficiency of new equipment, ' +
			'and accelerate grid decarbonization. The IEA Efficient Cooling Scenario shows this combination could avoid 460 GtCO2e of cumulative emissions by 2060 ' +
			'-- equivalent to roughly 8 years of current global energy-related CO2 output. The data on this dashboard tracks whether we are on that trajectory.'
	},

	meps: {
		headline: 'Efficiency is the cheapest clean energy',
		subhead: 'The invisible climate solution hiding in plain sight.',
		entryStat: '3x efficiency gap between best and worst products on sale today',
		storyHook:
			'Every year, millions of inefficient air conditioners and refrigerators enter markets with weak or nonexistent standards. ' +
			'These units will run for 10 to 15 years, locking in excess energy consumption that no retrofit can fix. ' +
			'This is environmental dumping in plain sight: manufacturers sell their least efficient models in countries that lack regulations to block them. ' +
			'The efficiency gap between the best and worst products on the market today exceeds a factor of three.',
		keyNarrative:
			'Minimum Energy Performance Standards (MEPS) set the floor: the least efficient product allowed for sale. Energy labels inform consumers, ' +
			'but labels without binding standards leave the market open to the cheapest, least efficient units. Metrics like the Cooling Seasonal Performance Factor ' +
			'(CSPF) and Energy Efficiency Ratio (EER) measure how much cooling a unit delivers per unit of energy consumed. The global best-in-class split AC ' +
			'today achieves a CSPF above 8.0. Many markets still allow units below 3.0. ' +
			'CLASP data shows that if every country adopted MEPS equivalent to today\'s best available technology, ' +
			'we could cut cooling energy consumption by 40-50% by 2050 without reducing comfort or access. ' +
			'That translates to avoiding over 1,300 TWh of annual electricity consumption -- roughly the total electricity output of India today. ' +
			'The challenge is harmonization. Over 80 countries have some form of cooling-related MEPS, but standards vary enormously in stringency, ' +
			'scope, and enforcement. Fans, refrigerators, and commercial chillers face a patchwork of coverage.',
		callToInsight:
			'Closing the efficiency gap requires raising MEPS floors, expanding coverage to all cooling equipment types, ' +
			'and building enforcement capacity in markets where standards exist on paper but not in practice. ' +
			'The Model Regulation Guidelines developed by U4E provide a tested framework. Countries that have adopted them ' +
			'-- Rwanda, Ghana, Senegal among them -- demonstrate that leapfrogging to high-efficiency standards is possible without waiting for decades of incremental improvement.'
	},

	kigali: {
		headline: 'The refrigerant revolution',
		subhead: 'From HFCs to natural cooling -- the Kigali Amendment is rewriting the rules.',
		entryStat: '157 parties ratified -- 95% of global HFC consumption covered',
		storyHook:
			'The Montreal Protocol already eliminated the ozone-depleting CFCs and is phasing out HCFCs. ' +
			'But the replacement gases -- hydrofluorocarbons (HFCs) -- turned out to be potent greenhouse gases. ' +
			'R-134a has a GWP of 1,430. R-410A sits at 2,088. Left unchecked, HFC growth alone would add 0.5 degrees Celsius of warming by 2100. ' +
			'The Kigali Amendment, adopted in 2016, created a legally binding pathway to phase down HFC production and consumption by over 80%.',
		keyNarrative:
			'Kigali divides countries into groups with staggered timelines. Non-Article 5 (developed) countries began their HFC freeze in 2019 ' +
			'and must reduce to 15% of baseline by 2036. Article 5 Group 1 (most developing countries) freezes in 2024 and targets 20% by 2045. ' +
			'Article 5 Group 2 (a handful of countries including India, Pakistan, and the Gulf states) freezes in 2028 and reaches 15% by 2047. ' +
			'The transition pathway runs from high-GWP HFCs toward three solution categories: lower-GWP HFCs like R-32 (GWP 675), ' +
			'HFO blends with GWPs under 150, and natural refrigerants -- R-290 propane (GWP 3), R-600a isobutane (GWP 3), R-744 CO2 (GWP 1), ' +
			'and R-717 ammonia (GWP 0). Natural refrigerants are the end state. They carry negligible direct climate impact and avoid the per- and polyfluoroalkyl ' +
			'(PFAS) concerns increasingly associated with HFOs. China and India are already manufacturing R-290 split ACs at scale. ' +
			'As of early 2026, 157 parties have ratified the Kigali Amendment, covering over 95% of global HFC consumption.',
		callToInsight:
			'Ratification is necessary but not sufficient. The real test is implementation: converting manufacturing lines, training technicians, ' +
			'updating safety codes, and building recovery and destruction infrastructure for legacy gases. ' +
			'Countries that combine Kigali compliance with ambitious MEPS -- requiring both low-GWP refrigerants and high efficiency -- ' +
			'achieve the deepest emission reductions. The data here tracks both ratification status and the on-the-ground transition.'
	},

	access: {
		headline: 'Cooling is an equity issue',
		subhead: 'More than 1.2 billion people face dangerous heat without adequate cooling.',
		entryStat: '1.2 billion people at high risk -- 420,000 deaths/year from spoiled food',
		storyHook:
			'In 2023, heat waves killed tens of thousands of people across South Asia, the Sahel, and Southern Europe. ' +
			'The vast majority of victims lacked access to even basic cooling. Sustainable Energy for All\'s Chilling Prospects report ' +
			'identifies 1.2 billion people at high risk -- concentrated in low-income urban settlements and rural communities ' +
			'across Sub-Saharan Africa, South Asia, and Southeast Asia. For these populations, cooling is not a luxury. It is health infrastructure.',
		keyNarrative:
			'The access gap has multiple dimensions. In rural areas, cooling preserves harvests, vaccines, and medicines -- without it, ' +
			'up to 40% of food production in Sub-Saharan Africa is lost post-harvest and vaccine cold chains break down. In urban areas, ' +
			'dense informal settlements trap heat, and residents who work outdoors face occupational heat stress that cuts labor productivity. ' +
			'Gender compounds the vulnerability: women in many contexts spend more hours in poorly ventilated indoor spaces and have less ' +
			'economic agency to invest in cooling solutions. Children under five and adults over 65 face disproportionate health risks. ' +
			'The cooling access deficit also has a strong economic dimension. The ILO estimates that heat stress could reduce total working hours ' +
			'by 2.2% globally by 2030, equivalent to 80 million full-time jobs. The productivity losses concentrate in exactly the regions ' +
			'where cooling access is lowest.',
		callToInsight:
			'Closing the access gap sustainably means going beyond air conditioners. Passive cooling strategies -- cool roofs, shading, ' +
			'ventilation design, urban green spaces -- can reduce indoor temperatures by 5-8 degrees Celsius at near-zero operating cost. ' +
			'District cooling, solar-powered cold chains, and community cooling centers offer shared solutions that avoid the emissions trap of ' +
			'universal individual AC ownership. A rights-based approach to cooling recognizes that access is not optional -- it is essential for ' +
			'health, food security, and economic participation in a warming world.'
	},

	policy: {
		headline: 'From pledge to action',
		subhead: '66+ countries signed the Global Cooling Pledge at COP28. Now comes the hard part.',
		entryStat: '<30% of NDCs mention cooling -- only ~20 countries have action plans',
		storyHook:
			'The Global Cooling Pledge, launched at COP28 in December 2023, committed signatories to reduce cooling-related emissions, ' +
			'expand sustainable cooling access, and integrate cooling into their Nationally Determined Contributions. ' +
			'It was the first time cooling received dedicated political attention at a UNFCCC COP. ' +
			'But pledges alone do not reduce emissions. The gap between commitment and implementation remains the central challenge of global cooling governance.',
		keyNarrative:
			'The policy landscape for cooling spans multiple instruments. NDCs are the anchor: they set each country\'s climate targets under ' +
			'the Paris Agreement. Analysis of current NDC texts shows that fewer than 30% explicitly mention cooling, refrigerants, or the Kigali Amendment. ' +
			'National Cooling Action Plans (NCAPs) provide dedicated roadmaps -- as of 2026, roughly 20 countries have completed or are developing NCAPs. ' +
			'These plans typically address efficiency standards, refrigerant transitions, cooling access, and cold chain development. ' +
			'The most effective NCAPs link directly to NDC targets and include funded implementation timelines. ' +
			'Beyond national plans, regional harmonization of MEPS (through ECOWAS, ASEAN, or the African Union), ' +
			'multilateral fund allocations through the Montreal Protocol, and climate finance flows through the Green Climate Fund all shape ' +
			'the pace of the transition. The policy puzzle is not about any single instrument. It is about coherence: making sure NDCs, NCAPs, ' +
			'Kigali compliance, MEPS, and finance mechanisms reinforce each other rather than operating in silos.',
		callToInsight:
			'Effective cooling policy has three hallmarks: it is integrated across climate and ozone regimes, it includes binding efficiency standards ' +
			'with enforcement mechanisms, and it addresses equity -- ensuring that the transition does not leave behind the populations most affected by heat. ' +
			'This dashboard tracks the policy architecture: who has pledged, who has plans, who has standards, and where the gaps remain.'
	}
};
