-- Refrigerant bank data: tonnes in service globally, by refrigerant, year, and region (A5/NA5)
-- Source: UNEP/HEAT GmbH modelling
CREATE TABLE IF NOT EXISTS refrigerant_bank_data (
    id         SERIAL PRIMARY KEY,
    year       INTEGER      NOT NULL,
    refrigerant VARCHAR(20) NOT NULL,
    region     VARCHAR(3)   NOT NULL,  -- 'A5' = Article 5, 'NA5' = Non-Article 5
    bank_tonnes NUMERIC     NOT NULL,
    UNIQUE (year, refrigerant, region)
);
CREATE INDEX IF NOT EXISTS idx_refr_bank_year    ON refrigerant_bank_data (year);
CREATE INDEX IF NOT EXISTS idx_refr_bank_compound ON refrigerant_bank_data (refrigerant);
