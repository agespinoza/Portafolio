-- Day 011 · step 1: filters the FAOSTAT bulk CSVs (QCL, TCL, TM) to the eight spice items into Parquet files in raw/.
-- Run from daily-data-lab/: duckdb < scripts/day-011/extract.sql (about 11 GB of CSV read once).
-- Items (FAOSTAT code, CPC): 687 Pepper (Piper spp.) 01651; 689 Chillies and peppers, dry 01652; 692 Vanilla 01658;
-- 693 Cinnamon 01655; 698 Cloves 01656; 702 Nutmeg, mace, cardamoms 01653; 711 Anise, badian, coriander, cumin,
-- caraway, fennel, juniper 01654; 720 Ginger 01657.
SET threads = 8;
COPY (SELECT "Area Code" area, replace("Area Code (M49)", '''', '') m49, Area AS name, "Item Code" item, "Element Code" el, Element AS element,
    Year AS year, Unit AS unit, Value AS value, Flag AS flag
  FROM read_csv('raw/day-011-spices/Production_Crops_Livestock/Production_Crops_Livestock_E_All_Data_(Normalized).csv', all_varchar=false)
  WHERE "Item Code" IN (687, 689, 692, 693, 698, 702, 711, 720)) TO 'raw/day-011-spices/qcl.parquet';
COPY (SELECT "Area Code" area, replace("Area Code (M49)", '''', '') m49, Area AS name, "Item Code" item, "Element Code" el, Element AS element,
    Year AS year, Unit AS unit, Value AS value, Flag AS flag
  FROM read_csv('raw/day-011-spices/Trade_CropsLivestock/Trade_CropsLivestock_E_All_Data_(Normalized).csv')
  WHERE "Item Code" IN (687, 689, 692, 693, 698, 702, 711, 720)) TO 'raw/day-011-spices/tcl.parquet';
COPY (SELECT "Reporter Country Code" rep, replace("Reporter Country Code (M49)", '''', '') repM49, "Reporter Countries" repName,
    "Partner Country Code" par, replace("Partner Country Code (M49)", '''', '') parM49, "Partner Countries" parName,
    "Item Code" item, "Element Code" el, Element AS element, Year AS year, Unit AS unit, Value AS value, Flag AS flag
  FROM read_csv('raw/day-011-spices/Trade_DetailedTradeMatrix/Trade_DetailedTradeMatrix_E_All_Data_(Normalized).csv')
  WHERE "Item Code" IN (687, 689, 692, 693, 698, 702, 711, 720)) TO 'raw/day-011-spices/tm.parquet';
