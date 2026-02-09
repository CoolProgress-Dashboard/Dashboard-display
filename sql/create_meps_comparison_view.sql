-- View: Normalized CSPF equivalents for AC comparison across countries
-- Joins current MEPS levels with latest timeline data

CREATE OR REPLACE VIEW v_meps_comparison AS
SELECT
  ml.country_code,
  ml.country_name,
  ml.metric_name AS national_metric,
  ml.metric_value AS national_value,
  ml.cspf_equivalent,
  ml.year_adopted,
  ml.year_planned_update,
  ml.is_mandatory,
  ml.standard_name,
  ml.requirement_level,
  ml.u4e_recommended,
  ml.notes,
  -- Rank by CSPF stringency (higher = more stringent)
  RANK() OVER (ORDER BY ml.cspf_equivalent DESC NULLS LAST) AS stringency_rank
FROM meps_levels ml
WHERE ml.appliance_type = 'AC'
  AND ml.cspf_equivalent IS NOT NULL
ORDER BY ml.cspf_equivalent DESC;
