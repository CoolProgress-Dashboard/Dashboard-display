# MEPS Review 2026 — Findings 1: U4E Model Regulation Reference Tiers

Research date: 2026-07-02. Verified from fetched primary documents (PDFs read in full).

## Primary sources

1. U4E Model Regulation Guidelines, Air Conditioners (Sept 2019 edition, EN file re-issued 2021-11-08, latest listed):
   https://united4efficiency.org/wp-content/uploads/2021/11/U4E_AC_Model-Regulation_EN_2021-11-08.pdf
2. U4E Model Regulation Guidelines, Refrigerating Appliances (Sept 2019, latest):
   https://united4efficiency.org/wp-content/uploads/2019/09/U4E_Refrigerators_Model-Regulation_20190923.pdf
3. U4E Energy Labelling Guidance (Jan 2021):
   https://united4efficiency.org/wp-content/uploads/2021/01/U4E-Labelling-Guidance_20210125.pdf
4. Global Cooling Prize criteria: https://globalcoolingprize.org/prize-details/criteria/
   RMI "Solving the Cooling Dilemma" (Kalanki et al. 2021): https://rmi.org/wp-content/uploads/dlm_uploads/2021/04/GlobalCoolingPrize_SolvingtheCoolingDilemma.pdf
5. U4E/IIEC ASEAN AC Policy Roadmap Recommendations (2022):
   https://united4efficiency.org/wp-content/uploads/2022/07/Policy-Recommendations-to-Update-the-Regional-Policy-Roadmap-for-AC.pdf

## Structure of the U4E AC Model Regulation

- Scope: ACs/heat pumps rated cooling output <= 16 kW. Test standard ISO 16358-1:2013 (Groups 1, 3), ISO 16358-1:2013/Amd 1:2019 (Group 2).
- "Group 1/2/3" are CLIMATE groups (Table 1, p.5), NOT capacity groups. Group 1 = humid/marine hot (ASHRAE 0A,1A,2A,2B,3A,3B,3C); Group 2 = extremely hot dry (0B,1B); Group 3 = mixed to arctic (4A-8).
- Capacity bands: CC <= 4.5 kW; 4.5 < CC <= 9.5 kW; 9.5 < CC <= 16.0 kW. There is NO 2.5-5 kW band in U4E.

## Table 5 — Reference Minimum Requirements for CSPF (MEPS), verbatim

| Capacity | Group 1 | Group 2 | Group 3 |
|---|---|---|---|
| CC <= 4.5 kW | 6.10 | 5.00 | 5.30 |
| 4.5 < CC <= 9.5 kW | 5.10 | 4.30 | 4.60 |
| 9.5 < CC <= 16.0 kW | 4.50 | 3.80 | 4.10 |

## Annex 2 labeling tiers

Table 13 (Group 1 countries), High Efficiency: CSPF >= 8.00 (<=4.5 kW), >= 7.60 (4.5-9.5 kW), >= 7.10 (9.5-16 kW). Intermediate: 7.10-8.00 / 6.40-7.60 / 5.80-7.10. Low: 6.10-7.10 / 5.10-6.40 / 4.50-5.80.
Table 14 (Group 2 countries), High Efficiency: CSPF >= 6.50 (<=4.5 kW), >= 6.20 (4.5-9.5 kW), >= 5.80 (9.5-16 kW).

## U4E Refrigerating Appliances Model Regulation

- Metric is NOT EEI. It is AEC vs AECMax, tested per IEC 62552:2015.
- Table 2 AECMax (24C ambient): Refrigerators 0.163*AV+102; Refrigerator-Freezers 0.222*AV+161; Freezers 0.206*AV+190 (AV = adjusted volume, Eq. 3).
- Eq. 5: R = AECMax / AEC. Table 8 (Annex 3): High Efficiency R >= 1.50; Intermediate 1.25 <= R < 1.50; Low 1.00 <= R < 1.25.
- U4E Labelling Guidance p.21 fn.23: "The U4E Model Regulations use an efficiency metric of R. This is a similar concept to that of the EEI except it is the inverse (i.e. the EEI is similar to 1/R)".

## Verdicts on current dashboard claims

| Dashboard claim | Verdict |
|---|---|
| AC min MEPS CSPF 5.1 "Group 1 (4.5-9.5 kW) Table 5" | Literally correct citation, but wrong band for typical residential AC. Typical residential (2.5-3.5 kW) is in <=4.5 kW band: Group 1 MEPS = CSPF 6.10 |
| High Efficiency CSPF 6.5 "Group 2, Annex 2 Table 14" | Value exists but is Group 2, <=4.5 kW. Inconsistent with the MEPS line (Group 1, 4.5-9.5 kW). For Group 1 the correct High Efficiency is 8.00 (<=4.5 kW) or 7.60 (4.5-9.5 kW). Partner's "7.6 or 8.0" is exactly right |
| Fridge "EEI 102 baseline / 81 intermediate / 68 high eff." | R thresholds (1.0/1.25/1.50) CONFIRMED (Table 8). EEI framing is a dashboard construct; "279/274 kWh-yr" derivation UNVERIFIED, appears nowhere in U4E docs |
| "U4E High Efficiency EEI 50" (fridge) | UNVERIFIED / almost certainly wrong attribution (likely EU label scale value). Remove or re-attribute |
| GCP target "CSPF 8.75, RMI" | UNVERIFIED as stated. Real formulation: 5x lower climate impact vs Voltas 1.5TR ISEER 3.5 baseline; ISEER < 7 disqualified; winners > ~7.3 ISEER ~ ISO CSPF ~10 (U4E/IIEC 2022 p.10). No source states CSPF 8.75 |

## Recommended corrections

1. U4E MEPS reference line: CSPF 6.10 (Group 1, <=4.5 kW, Table 5), or keep 5.10 relabeled as "Group 1, 4.5-9.5 kW".
2. High Efficiency line: same climate group AND capacity band as MEPS line: 8.00 (<=4.5 kW) or 7.60 (4.5-9.5 kW), Table 13.
3. Fridge tiers: present in U4E's own metric (R >= 1.0 / 1.25 / 1.50) or clearly flag EEI numbers as dashboard-derived EU-equivalent estimates.
4. Remove "EEI 50" as U4E attribution.
5. Replace GCP CSPF 8.75 with verifiable formulation (winners ~ISEER 7.3+ ~ ISO CSPF ~10) or drop the line.
