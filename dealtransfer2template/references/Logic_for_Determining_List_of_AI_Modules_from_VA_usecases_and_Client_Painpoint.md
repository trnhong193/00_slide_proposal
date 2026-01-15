# Logic for Determining List of AI Modules from VA Use Cases and Client Pain Points

> **Important**: Many Deal Transfer documents have vague or general use cases in S2 - "List of VA use cases". Presale team needs to **infer** the list of AI modules from both the use cases AND pain points. Refer to KB "REASON" for examples.

## Primary Sources:
1. **S2 - "List of VA use cases"** (may be vague/general)
2. **S1 - "Current Pain Points of end customer"** (helps infer missing modules)
3. **S2 - "Any customized AI use cases (description & videos)?"** (if provided)

## Key Principles:

### 1. Break Down General Use Cases into Specific Modules
- One vague use case often covers multiple requirements that need separate AI modules
- Consider AI logic flow - one module cannot cover all requirements in a general use case
- **Example from REASON KB:**
  - Use case: "Ergonomic detection – Workers lifting boxes properly, using lift assist, knife handling posture"
  - **Cannot be 1 module** → Break into:
    - "Lift Assist zone compliance Detection" (for lifting in areas requiring lift assist)
    - "Knife Handling Posture Detection" (for knife movements like raising arm above shoulder)
    - "Improper Lifting Detection" (for improper lifting techniques)

### 2. Separate Different Object Types/Properties
- If use case involves different objects with different properties → Split into separate modules
- **Example from REASON KB:**
  - Use case: "Spill and debris detection - wet floors or broken pieces remain for more than 5 minutes"
  - Spill and debris have **different properties** → Split into:
    - "Spill Leakage Detection"
    - "Debris Detection"

### 3. Separate Different Object Interactions
- If use case involves different types of interactions/events → Split into separate modules
- **Example from REASON KB:**
  - Use case: "General Near Miss detection – slip and fall, workers bumping, knives getting close to workers"
  - Different interactions with different objects → Split into:
    - "Human Down Detection" (for slip and fall)
    - "Unsafe Knife Proximity Detection" (for knives getting close to workers)

### 4. Match Clear Requirements to Single Modules
- If use case has one clear, specific requirement → One module
- **Example from REASON KB:**
  - Use case: "Proximity detection for forklifts – when someone gets within 1 foot (30cm) of moving forklift"
  - Clear requirement → One module: "Anti-collision"
  - Use case: "Employees in unsafe/restricted areas"
  - Clear requirement → One module: "Restricted Area Monitoring"

### 5. Use Pain Points to Infer Missing Modules
- Cross-reference S1 pain points with S2 use cases
- If pain point suggests a need but no use case covers it → Infer module from pain point
- Refer to Section 7.4 "Module-to-Pain-Point Mapping" for mapping logic

### 6. Extract as Much Detail as Possible
- When client lists general use cases but expects comprehensive features, extract all reasonable AI modules
- Consider whether each inferred module is reasonable to develop without risk
- **Example from REASON KB:**
  - Client has many safety/operational concerns → Extract all relevant modules even if not explicitly listed

### 7. Check Against Standard Modules
- Always check if inferred module matches a standard module in `standard_AI_modules.md`
- If standard module exists → Use standard name
- If not found → Mark as "Custom Module" and reference S2 - "Any customized AI use cases"

## Step-by-Step Process:

| Step | Action | Source/Guidance |
|------|--------|-----------------|
| **Step 1** | Read S2 - "List of VA use cases" | Identify if use cases are vague or specific |
| **Step 2** | Read S1 - "Current Pain Points of end customer" | Identify what problems need solving |
| **Step 3** | For each use case, analyze if it covers multiple requirements | Break down if one module cannot cover all |
| **Step 4** | Separate by object types/properties | Split if different objects need different detection logic |
| **Step 5** | Map pain points to missing modules | Use Section 7.4 mapping if use cases don't cover all pain points |
| **Step 6** | Check each inferred module against `standard_AI_modules.md` | Classify as Standard or Custom |
| **Step 7** | Verify reasonableness | Ensure each module is reasonable to develop without risk |

## Example Workflow (from REASON KB - Conestoga Meats):

**Input:** S2 use cases (vague)
1. Proximity detection for forklifts
2. Detection for employees in unsafe areas
3. Ergonomic detection
4. Spill and debris detection
5. General Near Miss detection
6. Unsafe act detection

**Analysis & Output (specific modules):**
1. → Anti-collision (1 module, clear requirement)
2. → Restricted Area Monitoring (1 module, clear requirement)
3. → Lift Assist zone compliance Detection + Knife Handling Posture Detection + Improper Lifting Detection (3 modules, multiple requirements)
4. → Spill Leakage Detection + Debris Detection (2 modules, different properties)
5. → Human Down Detection + Unsafe Knife Proximity Detection (2 modules, different interactions)
6. → Unsafe Driving Behaviour Detection (1 module, clear requirement)

**Total:** 10 specific modules extracted from 6 vague use cases

## Note
Always document the reasoning for module inference in internal notes. Reference KB "REASON" for more examples.

