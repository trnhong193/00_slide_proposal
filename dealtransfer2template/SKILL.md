---
name: dealtransfer2template
description: Generate technical proposals from Deal Transfer Excel files and Knowledge base. Use when user provides Deal Transfer document or asks to generate proposal. Creates template, reasoning, and checklist files following viAct proposal structure.
---

# Deal Transfer to Template

Generate technical proposals from Deal Transfer Excel files (Commercial Sheet S1 and Technical Sheet S2) and Knowledge Base references.

## Workflow

1. Extract Deal Transfer data from Excel (S1 and S2 sheets)
2. Generate template file with clean proposal content
3. Generate reasoning file with source references and logic
4. Generate checklist file with placeholders for presale confirmation

## Output Files

Create three separate files:

1. **`[Project_Name]_template.md`**: Clean proposal content (no source references, no reasoning)
2. **`[Project_Name]_reasoning.md`**: Source references, mapping logic, and reasoning
3. **`[Project_Name]_checklist.md`**: Placeholders requiring presale confirmation

## Process

### Extract Deal Transfer Data

Extract from Excel using field names from `references/FIELD_NAMES_REFERENCE.md`:
- **Commercial Sheet (S1)**: Customer info, pain points, timeline, camera status
- **Technical Sheet (S2)**: Use cases, deployment method, requirements

**Extraction methods:**
- Run `python scripts/extract_deal_transfer.py <excel_file>`
- Or use pandas: `pd.read_excel(file, sheet_name='Commercial')` and `sheet_name='Technical'`

### Generate Template File

Fill all sections from `references/TEMPLATE.md` using extracted data.

**Template rules:**
- Only proposal content (text, numbers, descriptions)
- Clean, professional language
- Pure markdown format - NO HTML tags (no `<br>`, `<br/>`, `<table>`, etc.)
- Use markdown formatting: bullet points (`-`), bold (`**text**`), headers (`##`), plain text
- Estimated values with placeholder IDs: `[Estimated Value] [PLACEHOLDER_ID]` (e.g., `30 Mbps [NETWORK_001]`)
- No source references (no "S1 - Field name")
- No reasoning explanations (no "Based on...", no "Logic: ...")
- No mapping details (no "Extracted from...", no "Calculated as...")

### Generate Reasoning File

Document for each section:
- Source references (S1/S2 field names from `references/FIELD_NAMES_REFERENCE.md`)
- Mapping logic and calculations
- KB references used
- Reasoning for estimates
- Alternative options considered

### Generate Checklist File

For each placeholder, add entry:
- ID | Section | Item | Content estimated | presale's Answer

### Handle Missing Information

When information is missing:
1. Make reasonable estimates based on standard viAct practices, similar projects in KB, or industry standards
2. Format in template: `[Estimated Value] [PLACEHOLDER_ID]`
3. Document in reasoning file why it was estimated
4. Add to checklist for presale confirmation

## Resources

Load as needed:

- **`references/TEMPLATE.md`**: Proposal structure with source/guidance for each section
- **`references/STANDARD_MODULES.md`**: Standard AI modules list - check if module is standard or custom
- **`references/FIELD_NAMES_REFERENCE.md`**: Exact field names from S1 and S2 sheets
- **`references/Logic_for_Determining_List_of_AI_Modules_from_VA_usecases_and_Client_Painpoint.md`**: Logic for determining AI modules from vague use cases
- **`scripts/extract_deal_transfer.py`**: Extract and parse Deal Transfer Excel files
- **`scripts/validate_output.py`**: Validate generated proposal format

## Content Rules

### Template File
- Only proposal content
- Pure markdown format - NO HTML tags (no `<br>`, `<br/>`, `<table>`, etc.)
- Use markdown formatting: bullet points, bold text, headers, plain text
- Show estimated values with placeholder IDs: `[Value] [ID]`
- No source references, reasoning, or KB references

### Reasoning File
- All source references (S1/S2 field names)
- All mapping logic and calculations
- All KB references
- Explanation for placeholders

### Checklist File
- All placeholders with estimated values
- Format: ID | Section | Item | Content estimated | presale's Answer

## Generation Guidelines

1. Extract from Deal Transfer first before making estimates
2. Never leave sections empty - make best estimate and use placeholder
3. Use standard module names from `references/STANDARD_MODULES.md` when available
4. Include Image URL and Video URL for standard modules (extract from `references/STANDARD_MODULES.md`, use URL if available or `""` if empty)
5. Convert pain points/VA use cases to AI modules (see `references/Logic_for_Determining_List_of_AI_Modules_from_VA_usecases_and_Client_Painpoint.md`)
6. Calculate timeline realistically - include ALL phases: T0, T1 (Hardware Deployment), T2 (Software Deployment), T3 (Integration & UAT)
   - **T1 is REQUIRED even if cameras already installed** (1-2 weeks for verification if cameras exist, 2-4 weeks if new installation)
7. Use concrete numbers and details
8. Maintain consistency - camera numbers, module counts consistent across sections
9. Document everything in reasoning file for traceability
10. Keep Work Scope concise - ONE short sentence: `[Deployment method] AI system to [general objective]` (do NOT list specific modules)
11. **Skip workstation specifications for Cloud deployment** - Only include Network and Camera specs
12. **Skip Power Requirements for Cloud deployment**
13. **Skip Section 8 if no custom requirements** - Only include if S2 has custom dashboard requirements or non-standard alert channels

## Quality Checks

**Template file:**
- All sections from `references/TEMPLATE.md` filled
- No sections completely empty
- Clean proposal language (no source references)
- Pure markdown format - NO HTML tags (no `<br>`, `<br/>`, `<table>`, etc.)
- Placeholder IDs present for uncertain items
- Module names match `references/STANDARD_MODULES.md` when standard
- Timeline includes ALL phases (T0, T1, T2, T3)
- Timeline calculations logical (consider camera status, standard vs custom modules)
- Architecture matches deployment method
- Responsibilities clearly divided
- Consistent numbers across sections

**Reasoning file:**
- Every section has corresponding reasoning entry
- All S1/S2 references use field names from `references/FIELD_NAMES_REFERENCE.md`
- All KB references documented
- All calculations shown
- All placeholders explained

**Checklist file:**
- All placeholders from template listed
- Estimated values clearly shown
- Format matches required structure

## Next Steps

After generating files:
1. Presale reviews `[Project_Name]_checklist.md` and fills answers
2. Use `proposal-checklist-update` skill to update template with confirmed values
3. Proceed to next workflow step (e.g., slide-content-mapper)
