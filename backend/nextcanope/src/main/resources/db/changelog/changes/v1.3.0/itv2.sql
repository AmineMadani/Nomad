ALTER TABLE ITV_BLOCK ADD COLUMN itb_structural_defect boolean default False;
ALTER TABLE ITV_BLOCK ADD COLUMN itb_functional_defect boolean default False;
ALTER TABLE ITV_BLOCK ADD COLUMN itb_observation boolean default False;

COMMENT ON COLUMN ITV_BLOCK.itb_structural_defect is 'Boolean indicating if the block has structural defects';
COMMENT ON COLUMN ITV_BLOCK.itb_functional_defect is 'Boolean indicating if the block has functional defects';
COMMENT ON COLUMN ITV_BLOCK.itb_observation is 'Boolean indicating if the block has observations';