---
name: dealtransfer2template
description: Generate technical proposals from Deal Transfer Excel files and Knowledge base. Use when user provides Deal Transfer document or asks to generate proposal. Creates template, reasoning, and checklist files following viAct proposal structure.
---

# Proposal Generation Skill

## Instruction

You are a presale engineer tasked with generating a technical proposal based on a Deal Transfer document and Knowledge base. Use the following resources:

1. **Deal Transfer document** (Excel file with Commercial Sheet S1 and Technical Sheet S2)
2. **TEMPLATE.md**: Contains the structure and guidance for filling proposal sections
3. **STANDARD_MODULES.md**: Reference list of standard modules available
4. **Knowledge Base (KB)**: Access to KBs for reference

## Task

Generate a complete technical proposal following the structure in **TEMPLATE.md**. Create THREE separate files:
1. **`[Project_Name]_template.md`**: Clean proposal content ready for use (NO source references, NO reasoning explanations)
2. **`[Project_Name]_reasoning.md`**: Detailed source references, mapping logic, and reasoning for each section
3. **`[Project_Name]_checklist.md`**: Items requiring presale confirmation with placeholder IDs and estimated values

Fill in ALL sections with information extracted and derived from the Deal Transfer document and Knowledge Base.

## Overview

This skill generates technical proposals based on Deal Transfer documents (Excel files with Commercial Sheet S1 and Technical Sheet S2) and Knowledge Base references. It creates three output files: a clean proposal template, detailed reasoning documentation, and a checklist for presale confirmation.

## Resources Available

This skill includes the following resources (loaded as needed):

- **TEMPLATE.md**: Proposal structure and guidance - Contains the complete template with Source/Guidance for each section
- **STANDARD_MODULES.md**: List of standard AI modules - Reference for checking if a module is standard or custom
- **FIELD_NAMES_REFERENCE.md**: Deal Transfer field names reference - Exact field names from S1 and S2 sheets
- **Logic_for_Determining_List_of_AI_Modules_from_VA_usecases_and_Client_Painpoint.md**: Logic for determining AI modules from vague use cases
- **scripts/extract_deal_transfer.py**: Utility script to extract and parse Deal Transfer Excel files
- **scripts/validate_output.py**: Script to validate generated proposal format

## When to Use This Skill

Use this skill when:
- User provides a Deal Transfer Excel file
- User asks to generate a technical proposal
- User mentions "proposal", "Deal Transfer", "S1", "S2"
- User needs proposal template, reasoning, or checklist files

## Process

### Step 1: Extract Information from Deal Transfer

Read the Deal Transfer Excel file and extract:
- **Commercial Sheet (S1)**: All fields using field names from FIELD_NAMES_REFERENCE.md
- **Technical Sheet (S2)**: All fields using field names from FIELD_NAMES_REFERENCE.md

**How to extract:**
1. Use Python pandas to read Excel: `pd.read_excel(file, sheet_name='Commercial')` and `sheet_name='Technical'`
2. Or use the utility script: `python scripts/extract_deal_transfer.py <excel_file>`
3. Reference FIELD_NAMES_REFERENCE.md for field names 

### Step 2: Generate Proposal Content (Template File)

Fill in each section of **TEMPLATE.md** using the logic inside file.

**IMPORTANT**: The `[Project_Name]_template.md` file should contain:
- ✅ **ONLY** the actual proposal content (text, numbers, descriptions)
- ✅ Clean, professional proposal language
- ✅ **Estimated values with placeholder IDs**: Format `[Estimated Value] [PLACEHOLDER_ID]` for uncertain items
  - Example: `30 Mbps [NETWORK_001]` (estimated value first, then placeholder ID)
  - This allows presale to see the estimate and confirm/update via checklist
- ❌ **NO** source references (e.g., "S2 - Field name")
- ❌ **NO** reasoning explanations (e.g., "Based on KB...", "Logic: ...")
- ❌ **NO** mapping details (e.g., "Extracted from...", "Calculated as...")

**Example - Template File (Clean):**
```markdown
## 5. SYSTEM REQUIREMENTS

### Network
- External bandwidth: 30 Mbps [NETWORK_001] (for remote access)
- Per-camera bandwidth: 12 Mbps
- Total system bandwidth: 240 Mbps (12 Mbps × 20 cameras)

### AI Inference Workstation
- CPU: Intel Core i9-14900K
- GPU: RTX 5080
- RAM: 64GB
- Storage: 2TB SSD
```

**❌ WRONG - Template File (Contains source/reasoning):**
```markdown
## 5. SYSTEM REQUIREMENTS

### Network
- External bandwidth: 30 Mbps [NETWORK_001] (for remote access)
  <!-- Source: S2 - "Stable internet connection?" → Estimated 20 Mbps -->
- Per-camera bandwidth: 12 Mbps (standard from KB)
- Total system bandwidth: 240 Mbps (calculated from S1 - "If VA: camera status & scope" → 20 cameras × 12 Mbps)
```

**✅ CORRECT Format for Estimated Values:**
- `30 Mbps [NETWORK_001]` - Estimated value shown, placeholder ID for confirmation
- `T0 + 2 weeks [TIMELINE_001]` - Estimated duration shown, placeholder ID for confirmation
- `Intel Core i7-14700K [CPU_001]` - Estimated spec shown, placeholder ID for confirmation

### Step 3: Generate Reasoning File

Create `[Project_Name]_reasoning.md` with detailed source references and logic for EACH section:

**IMPORTANT**: The `[Project_Name]_reasoning.md` file should contain:
- ✅ Source references (S1/S2 field names)
- ✅ Mapping logic and calculations
- ✅ KB references used
- ✅ Reasoning for estimates
- ✅ Alternative options considered

**Example - Reasoning File:**
```markdown
## 5. SYSTEM REQUIREMENTS

### Network

#### External Bandwidth
**Content in Template**: External bandwidth: 30 Mbps [NETWORK_001] (for remote access)
**Source**: S2 - "Stable internet connection?" → Answer: "Yes, stable"
**Logic**: 
- Standard practice: 10-50 Mbps for remote access
- Estimated: 30 Mbps (based on similar projects, placeholder needed as not specified in Deal Transfer)
**KB Reference**: Similar projects (Vertiv, Shell Oman) use 20-50 Mbps for remote access
**Placeholder ID**: NETWORK_001
**Reason for Placeholder**: Deal Transfer does not specify exact bandwidth requirement
**Estimated Value in Template**: 30 Mbps (shown before placeholder ID)

#### Total System Bandwidth
**Content in Template**: Total system bandwidth: 240 Mbps (12 Mbps × 20 cameras)
**Source**: S1 - "If VA: camera status & scope" → Extracted: "20 cameras"
**Calculation**: 12 Mbps × 20 cameras = 240 Mbps
**KB Reference**: Standard per-camera bandwidth is 12 Mbps (from TEMPLATE.md Section 5)
**No Placeholder**: Value is directly calculated from Deal Transfer data
```

### Step 4: Handle Missing/Unclear Information

If any information is missing from Deal Transfer:
1. **Make reasonable estimates** based on:
   - Standard viAct practices
   - Similar projects in KB
   - Industry standards
2. **Format in Template**: Use format `[Estimated Value] [PLACEHOLDER_ID]` where:
   - Estimated Value: The specific estimated number/text (e.g., `30 Mbps`, `T0 + 2 weeks`, `Intel Core i7-14700K`)
   - PLACEHOLDER_ID: Unique ID (e.g., `[NETWORK_001]`, `[TIMELINE_002]`, `[MODULE_COUNT_001]`)
   - Example: `30 Mbps [NETWORK_001]` (estimated value shown first, then placeholder ID)
3. **Add to both files**:
   - Template file: Show estimated value with placeholder ID (e.g., `30 Mbps [NETWORK_001]`)
   - Reasoning file: Document the estimated value, why it was estimated, and what needs confirmation
   - Checklist file: Add entry with the estimated value for presale to confirm/update

### Step 5: Create Checklist File

For each placeholder created, add entry to checklist:

```markdown
## Items Requiring Confirmation

| ID | Section | Item | Content estimated in template outline | presale's Answer |
|----|---------|------|-----------------------------------------------------|-------------------------|
| NETWORK_001 | 5. SYSTEM REQUIREMENTS | External Bandwidth | 30 Mbps (estimated for remote access) | |
| TIMELINE_002 | 6. IMPLEMENTATION PLAN | T1 Duration | T0 + 2 weeks (estimated, customer has cameras) | |
```

### Step 6: Quality Check

Before finalizing, verify:

**For Template File (`[Project_Name]_template.md`):**
- ✅ All sections from **TEMPLATE.md** are filled
- ✅ No sections left completely empty
- ✅ Clean proposal language (no source references visible)
- ✅ Placeholder IDs are present for uncertain items
- ✅ Module names match `STANDARD_MODULES.md` when standard
- ✅ **Timeline MUST include ALL phases: T0, T1 (Hardware Deployment), T2 (Software Deployment), T3 (Integration & UAT)** - **NEVER skip T1 even if cameras already installed** (T1 duration: 1-2 weeks if cameras exist, 2-4 weeks if new installation)
- ✅ Timeline calculations are logical (consider standard vs custom modules, **check if cameras already installed** - affects T1: 1-2 weeks if cameras exist, 2-4 weeks if new installation)
- ✅ Architecture matches deployment method
- ✅ Responsibilities are clearly divided
- ✅ Consistent numbers across sections (camera count, module count, etc.)

**For Reasoning File (`[Project_Name]_reasoning.md`):**
- ✅ Every section has corresponding reasoning entry
- ✅ All S1/S2 references use field names from `FIELD_NAMES_REFERENCE.md`
- ✅ All KB references are documented
- ✅ All calculations are shown
- ✅ All placeholders are explained

**For Checklist File (`[Project_Name]_checklist.md`):**
- ✅ All placeholders from template are listed
- ✅ Estimated values are clearly shown
- ✅ Format matches required structure
- ✅ **Number of AI Module per Camera** is included if it's an estimate/suggestion (not explicitly specified in Deal Transfer)

**Validation:**
Run `python scripts/validate_output.py` to check output format if needed.

## Output Files

1. **`[Project_Name]_template.md`**: Clean proposal content ready for use (NO source references, NO reasoning)
   - Contains: Proposal text, numbers, descriptions, placeholder IDs
   - Purpose: Direct use in proposal creation
   - **Next Step**: After presale confirms checklist, use `proposal-checklist-update` skill to update template
   
2. **`[Project_Name]_reasoning.md`**: Detailed source references and logic
   - Contains: S1/S2 field references, KB references, calculations, mapping logic
   - Purpose: Documentation of how content was derived, for review and updates
   
3. **`[Project_Name]_checklist.md`**: Items requiring presale confirmation
   - Contains: Placeholder IDs, estimated values, blank column for presale answers
   - Purpose: Track items needing confirmation from presale team
   - **Next Step**: Presale fills answers, then use `proposal-checklist-update` skill to update template

## Using Resources

- **When you need template structure**: Read `TEMPLATE.md` to understand section structure and Source/Guidance
- **When checking if module is standard**: Read `STANDARD_MODULES.md` and search for module name
- **When filling standard module descriptions**: Always include Image URL field (extract from `STANDARD_MODULES.md`, use URL if available or `""` if empty) and Video URL field (extract from `STANDARD_MODULES.md`, use URL if available or `""` if not available)
- **When extracting Deal Transfer fields**: Reference `FIELD_NAMES_REFERENCE.md` for exact field names
- **When parsing Excel**: Use `python scripts/extract_deal_transfer.py <file>` if needed
- **When validating output**: Run `python scripts/validate_output.py` to check format
- **When determining AI modules from vague use cases**: Read `Logic_for_Determining_List_of_AI_Modules_from_VA_usecases_and_Client_Painpoint.md`

## Important Rules

### Content Separation Rules

1. **Template File (`[Project_Name]_template.md`)**:
   - ✅ Contains ONLY proposal content (clean, professional)
   - ✅ **Show estimated values with placeholder IDs**: Format `[Estimated Value] [PLACEHOLDER_ID]`
     - Example: `30 Mbps [NETWORK_001]` (estimated value shown, placeholder for confirmation)
     - This allows presale to see the estimate immediately and confirm/update via checklist
   - ❌ NO source references (no "S1 - Field name", no "S2 - Field name")
   - ❌ NO reasoning text (no "Based on...", no "Logic: ...", no "Calculated as...")
   - ❌ NO KB references (no "From KB...", no "Similar to...")

2. **Reasoning File (`[Project_Name]_reasoning.md`)**:
   - ✅ Contains ALL source references (S1/S2 field names)
   - ✅ Contains ALL mapping logic and calculations
   - ✅ Contains ALL KB references used
   - ✅ Explains why placeholders were created
   - ✅ Documents alternative options considered

3. **Checklist File (`[Project_Name]_checklist.md`)**:
   - ✅ Lists all placeholders with estimated values
   - ✅ Format: ID | Section | Item | Content estimated in template outline | presale's Answer |
   - ✅ Left blank for presale to fill

### Content Generation Rules

1. **Always extract from Deal Transfer first** - Use Deal Transfer as primary source before making estimates
2. **Never leave sections completely empty** - Make best estimate and use placeholder
3. **Use standard module names** when available in `STANDARD_MODULES.md`
4. **Include Image URL and Video URL for standard modules** - When a module is classified as Standard (found in `STANDARD_MODULES.md`), always include Image URL field (extract from `STANDARD_MODULES.md`, use URL if available or `""` if empty) and Video URL field (extract from `STANDARD_MODULES.md`, use URL if available or `""` if not available). Custom modules do NOT include these URLs.
5. **Convert pain points/VA use cases to AI modules** - Map each use case to specific module
6. **Calculate timeline realistically** 
7. **Be specific** - Avoid vague statements, use concrete numbers and details
8. **Maintain consistency** - Camera numbers, module counts should be consistent across sections
9. **Document everything in reasoning file** - Even obvious mappings should be documented for traceability
10. **Keep Work Scope concise** - Work Scope should be ONE short sentence combining deployment method + "AI system" + general objective. **Do NOT list specific modules** in Work Scope (e.g., "Cloud-based AI system to monitor workplace safety compliance in real time" - NOT "Cloud-based AI system to monitor through PPE detection, fire detection, collision prevention..." - modules are listed separately in "AI Modules" field)
11. **Skip workstation specifications for Cloud deployment** - **If deployment method is Cloud, DO NOT include** AI Inference Workstation, AI Training Workstation, or Dashboard Workstation sections in Section 5 (SYSTEM REQUIREMENTS). Reason: viAct manages cloud infrastructure, client does not need to procure workstations. For Cloud deployment, only include Network (internet bandwidth for streaming) and Camera specifications.
12. **Skip Power Requirements for Cloud deployment** - **If deployment method is Cloud, DO NOT include** Power Requirements section (5.1). Reason: Power for cameras is handled by client and mentioned in Scope of Work. No workstation power requirements needed since all infrastructure is cloud-hosted.
13. **Skip Section 8 if no custom requirements** - **If S2 - "Any customized dashboard?" = "no" or blank AND S2 - "How do they want to alert operators on-site?" only mentions standard channels (Dashboard, Email, Telegram, SMS), DO NOT include** Section 8 (USER INTERFACE & REPORTING). Reason: Standard dashboard, alerts, and reporting features are standard viAct capabilities and do not need to be detailed in proposal. Only include Section 8 if there are custom KPIs, multi-dashboard requirements, custom reporting features, or non-standard alert channels (VMS integration, on-site alarms, etc.).

## Example Placeholder IDs

Use descriptive prefixes:
- `NETWORK_001`, `NETWORK_002` - Network requirements
- `TIMELINE_001`, `TIMELINE_002` - Timeline questions
- `ARCH_001` - Architecture clarifications
- `MODULE_COUNT_001`, `MODULE_COUNT_002` - Number of AI modules per camera (if estimated)
- `MODULE_001` - Module-specific questions
- `DASHBOARD_001` - Dashboard requirements
- `INTEGRATION_001` - Integration questions

## Next Steps After Generation

After generating the three files:
1. **Presale Review**: Send `[Project_Name]_checklist.md` to presale team for confirmation
2. **Update Template**: After presale fills checklist, use `proposal-checklist-update` skill to update template
3. **Proceed**: Once template has no placeholders, proceed to next workflow step (e.g., slide-content-mapper)

