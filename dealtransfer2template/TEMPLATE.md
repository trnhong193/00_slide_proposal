# Technical Proposal Template - Complete Structure

> **Purpose**: This template outlines the COMMON structure that appears in all technical proposals. Use this as an outline to fill in variable information from Deal Transfer documents and customer requirements.

> **Note**: This template focuses on variable sections only. Fixed sections (company introduction, standard disclaimers, etc.) are excluded.

> **Source Reference:**
> - **S1:** Commercial Sheet (File New Deal Transfer)
> - **S2:** Technical Sheet (File New Deal Transfer)
> - **Sx:** Other sheets (File New Deal Transfer)

---

## 1. COVER PAGE

| Content | Source/Guidance |
|---------|------------------|
| Company Logo | Client Logo + Standard viAct logo |
| Proposal Title | Format: "Video Analytics Solution Proposal for [Customer Name]" "<br>**Source**: S1 - "Customer overview (short introduction about customer business)" |
| Client Name | Customer company name<br>**Source**: S1 - "Customer overview (short introduction about customer business)" (extract company name) |
| Date | Proposal submission date |

---

## 2. PROJECT REQUIREMENT STATEMENT


| Content | Source/Guidance |
|---------|------------------|
| **Project** | General pain point. Example: AI-Powered Video Analytics for Workforce Monitoring, Productivity Control, and Safety Compliance<br>**Source**: S1 - "Current Pain Points of end customer"<br>|
| **Project Owner** | Customer overview - Customer name<br>**Source**: S1 - "Customer overview (short introduction about customer business)"<br> |
| **Work Scope** | Deployment method + AI system + General project description (keep concise, one sentence, do NOT list all modules)<br>**Format**: [Deployment method] AI system to [general purpose/objective]<br>**Example**: On premise AI system to Monitor Vessel Safety in Real time<br>**Example**: Cloud-based AI system to monitor workplace safety compliance in real time<br>**Components**:<br>1. Deployment method: **Source**:S2 - "Any specific HW/SW requirements such as deployment method?"<br>2. AI system (always "AI system" or "Video Analytics Platform")<br>3. General project description: **Source**S1 - "Current Pain Points of end customer" - Convert to high-level objective (e.g., "monitor safety compliance", "detect safety violations", "ensure workforce safety") - **Do NOT list specific modules** (modules are listed separately in "AI Modules" field)<br>|
| **Project Duration** | X years/months<br>**Source**: S1 - "If real project, please specific the expected timeline (including tender process if available)"<br> |
| **Camera Number** | X cameras<br>**Source**: S1 - "If VA, do they already have camera installed? Do we need to handle HW implementation? How many camera they would like to run AI model?"<br> |
| **Number of AI Module per Camera** | Suggest based on customer pain point. If not mentioned then suggest the average number is 3 - 4 AI modules/camera<br>**Source**: S2 - "List of VA use cases" → Count total modules, divide by camera number<br> |
| **AI Modules** | List of AI modules<br>**Source**: S2 - "List of VA use cases"<br> |

### 2.1 Logic for Determining List of AI Modules from Vague Use Cases

> **Reference**: See detailed logic and examples in `Logic_for_Determining_List_of_AI_Modules_from_VA_usecases_and_Client_Painpoint.md`

**Quick Summary:**
- Many Deal Transfer documents have **vague or general use cases** in S2 - "List of VA use cases"
- Presale team must **infer** the list of AI modules from both:
  1. **S2 - "List of VA use cases"** (may be vague)
  2. **S1 - "Current Pain Points of end customer"** (helps infer missing modules)
  3. **S2 - "Any customized AI use cases (description & videos)?"** (if provided)

**Key Steps:**
1. Break down general use cases into specific modules (one vague use case → multiple modules)
2. Separate by object types/properties (different objects → different modules)
3. Separate by object interactions (different interactions → different modules)
4. Use pain points to infer missing modules (cross-reference S1 with S2)
5. Check against `STANDARD_MODULES.md` (classify as Standard or Custom)

---
## 3. SCOPE OF WORK

### Common Items (Always Present):

| Content | Source/Guidance |
|---------|------------------|
| **viAct Responsibilities** | Software: License, maintenance, support<br>Camera integration<br>**Source**: S2 - "Specific HW/SW requirements (deployment method)?"|
| **Client Responsibilities** | Hardware: Procurement, configuration, installation, and maintenance<br>Other Requirements if needed<br>**Source**: S1 - "If VA, do they already have camera installed? Do we need to handle HW implementation? How many camera they would like to run AI model?" (check if cameras exist)<br>**Logic**:<br>- If customer has cameras → Customer handles HW, viAct handles software<br>- If new installation → Specify who handles what<br>- If on-premise → Customer may need to provide server/workstation |

**Note**: Use available slide template for Scope of Work, add specific requirements if customer has special needs.

---

## 4. SYSTEM ARCHITECTURE

> **First Step**: Choose deployment method → Select architecture type

| Content | Source/Guidance |
|---------|------------------|
| **Deployment Method: On Cloud** | **Source**: S2 - "Specific HW/SW requirements (deployment method)?" = "Cloud"<br>**Inputs needed**:<br>+ Number of Camera: S1 - "If VA, do they already have camera installed? Do we need to handle HW implementation? How many camera they would like to run AI model?" (extract number)<br>+ List AI modules: S2 - "List of VA use cases"<br>**Reference KB**:<br>- Architecture: KB "DOCUMENT" → Search "Architecture-Cloud"<br>- Slide: System_architecture.pdf (On Cloud - Slide 4) |
| **Deployment Method: On Premise** | **Source**: S2 - "Specific HW/SW requirements (deployment method)?" = "On-premise" or answer mentions "on-premise"<br>**Inputs needed**:<br>+ Number of Camera: S1 - "If VA, do they already have camera installed? Do we need to handle HW implementation? How many camera they would like to run AI model?" (extract number)<br>+ List AI modules: S2 - "List of VA use cases"<br>**Reference KB**:<br>- Architecture: KB "DOCUMENT" → Search "Architecture" (On-Premise variants)<br>- Slide: System_architecture.pdf (On Premise - slide 6, 8) |
| **Deployment Method: Not mentioned → Suggest Hybrid** | **Source**: S2 - "Specific HW/SW requirements (deployment method)?" = Not specified or blank<br>**Logic**: When deployment method not mentioned, suggest Hybrid<br>**Inputs needed**:<br>+ Number of Camera: S1 - "If VA, do they already have camera installed? Do we need to handle HW implementation? How many camera they would like to run AI model?" (extract number)<br>+ List AI modules: S2 - "List of VA use cases"<br>**Reference KB**:<br>- Architecture: KB "DOCUMENT" → Search Architecture-Hybrid<br>- Slide: System_architecture.pdf (Hybrid - slide 11) |
| **Deployment Method: Edge Processing** | **Source**: S2 - "Specific HW/SW requirements (deployment method)?" mentions "local processing" OR S2 - "Stable internet connection?" = "No" or unstable<br>**Logic**: Edge processing for multiple sites or unstable internet<br>**Reference KB**: KB "DOCUMENT" → Search edge/on-premise architectures |
| **Other Components** | Add other HW components if needed:<br>- NVR (Network Video Recorder)<br>- VPN Bridge<br>- Additional network equipment<br>**Source**: S2 - Integration requirements, multiple sites, security requirements |

### 4.1 Architecture Diagram Description

**Detailed Technical Description for the System Architecture section** (Blueprint for designer to create visual slide):

**Data Flow:**
- Trace the path: Camera → Network Switch → AI Workstation → Cloud/Dashboard
- Include: Video stream direction, Alert data flow, Dashboard access

**Hardware Components Placement:**
- AI Workstation: [Location - Central / Edge / Per site]
- NVR: [If applicable]
- VPN Bridge: [If applicable]
- Peripheral devices: Speakers, kiosks, sensors, etc.

**Network Topology:**
- Local Area Network (LAN): For cameras and local processing
- Wide Area Network (WAN): For dashboard access and remote monitoring
- Internet connectivity: For cloud services (if applicable)

**System Layers:**
- Edge Layer: At site (cameras, edge processing)
- Cloud Layer: Storage/backend (if cloud deployment)
- Application Layer: Mobile/Web dashboard access

**Source from Deal Transfer:**
- **Derive from**: All technical requirements combined (S2)
- **Logic**: Based on deployment method, number of sites, camera locations, internet stability

---

## 5. SYSTEM REQUIREMENTS

### Common Items (Always Present):

| Content | Source/Guidance |
|---------|------------------|
| **Network** | **If Deployment method is Cloud**:<br>+ Internet bandwidth: For video streaming to cloud (provided by client)<br>+ Per-camera bandwidth: ~5-12 Mbps per camera for cloud streaming (varies by compression)<br>+ Total bandwidth: Per-camera bandwidth × Number of Cameras<br>**Calculation**:<br>- Internet bandwidth: [Value] Mbps (for streaming video to cloud servers)<br>- Per-camera bandwidth: ~5-12 Mbps (depending on resolution and compression)<br>- Total bandwidth: [Per-camera bandwidth] × [Camera Number from S1]<br>**Source**: S2 - "Stable internet connection?" (check answer: Yes/No/Stable/Unstable)<br>**Logic**: Cloud deployment requires stable internet connection for video streaming<br><br>**If Deployment method is On-premise or Hybrid**:<br>+ External bandwidth: Internet bandwidth for remote access and updates<br>+ Per-camera bandwidth: 12 Mbps/Camera<br>+ Total system bandwidth: 12 Mbps × Number of Cameras<br>**Calculation**:<br>- External bandwidth: [Value] (for remote access)<br>- Per-camera bandwidth: 12 Mbps<br>- Total system bandwidth: 12 Mbps × [Camera Number from S1]<br>**Source**: S2 - "Stable internet connection?" (check answer: Yes/No/Stable/Unstable)<br>**Logic**: If unstable internet → May need local processing, reduce cloud dependency |
| **Camera** | **Standard Specifications**:<br>+ Resolution: 1080p@25fps (minimum)<br>+ Connectivity Type: IP-based cameras with RTSP support<br>**Output Format**:<br>+ Resolution: [e.g., 1080p, 4K] - based on customer requirement<br>+ Frame rate: [e.g., 25fps, 30fps]<br>+ Connectivity Type: [IP, RTSP]<br>**Source**: S2 - "Can client camera provide RTSP link?" (check answer: yes/no)<br>**Note**: If customer has cameras, check S1 - "If VA, do they already have camera installed? Do we need to handle HW implementation? How many camera they would like to run AI model?" for camera details |
| **AI Inference Workstation** | **IMPORTANT: If Deployment method is Cloud → SKIP this section** (viAct manages cloud infrastructure, client does not need workstation specs)<br><br>**If Deployment method is On-premise or Hybrid**:<br>**Input from Deal Transfer**:<br>+ Number of cameras: S1 - "If VA, do they already have camera installed? Do we need to handle HW implementation? How many camera they would like to run AI model?" (extract number)<br>+ Number of AI modules/camera: Suggest 3-4 modules/camera (average) if not specified<br>**Calculation Method**:<br>1. Calculate ALI (AI Load Index) = Number of cameras × Modules per camera<br>2. Use AI_Workstation_Calculator.xlsx to determine GPU level and workstation count<br>3. Reference KB proposals for similar camera/module counts<br>**Output Format**:<br>+ CPU: [e.g., Intel Core i9-14900K or equivalent]<br>+ GPU: [e.g., RTX 5080 or equivalent]<br>+ RAM: [e.g., 64GB]<br>+ Storage: [e.g., 2TB SSD]<br>+ Network card: [e.g., 1Gbps]<br>+ Operating System: [e.g., Ubuntu 24.04]<br>+ Quantity: [Number of workstations]<br>**Reference KB Examples**:<br>- **Lavie_Tech Proposal**: CPU i9-14900K, GPU RTX 4080, RAM 64GB, Storage 2TB, OS Ubuntu 22.04<br>- **Vertiv_Tech Proposal**: CPU i9-14900K, GPU RTX 5080, RAM 64GB, Storage 2TB SSD, OS Ubuntu 24.04<br>- **Nitto Hưng Yên**: CPU i9-14900K, GPU RTX 5080, RAM 64GB, Storage 1TB, OS Ubuntu 24.04<br>- **STS Oman**: CPU i9-14900K, GPU RTX 5080, RAM 64GB, Storage 2TB SSD, OS Ubuntu 24.04<br>- **EGA Proposal**: CPU i7-14700K, GPU RTX 4080, RAM 32GB, Storage >=3TB, OS Ubuntu 24.04<br>**KB Reference**: Search KB "DOCUMENT" or "viAct_Proposal" for "Inference Workstation" specifications<br>**Calculator**: Use AI_Workstation_Calculator.xlsx → Inference calculation section<br>**Logic**:<br>- Camera count ≤ 40 → RAM 32GB, GPU RTX 4070 Super<br>- Camera count 41-120 → RAM 64GB, GPU RTX 4080 Super<br>- Camera count > 120 → RAM 128GB, GPU RTX 5080<br>- CPU mapping: RTX 4070 → i7-13700, RTX 4080/5080 → i9-13900 or i9-14900 |
| **AI Training Workstation** | **IMPORTANT: If Deployment method is Cloud → SKIP this section** (viAct manages cloud infrastructure, client does not need workstation specs)<br><br>**If Deployment method is On-premise or Hybrid**:<br>**Input from Deal Transfer**:<br>+ Number of cameras: S1 - "If VA, do they already have camera installed? Do we need to handle HW implementation? How many camera they would like to run AI model?" (extract number)<br>+ Number of AI modules/camera: From S2 - "List of VA use cases"<br>+ Custom modules: Check S2 - "Any customized AI use cases (description & videos)?"<br>**Calculation Method**:<br>1. Calculate TLI (Training Load Index) = ALI (if training all modules)<br>2. Use AI_Workstation_Calculator.xlsx → Training calculation section<br>3. Reference KB proposals for similar requirements<br>**Output Format**:<br>+ CPU: [e.g., Intel Core i7-14700K or equivalent]<br>+ GPU: [e.g., RTX 4080 or equivalent]<br>+ RAM: [e.g., 64GB]<br>+ Storage: [e.g., 2TB SSD + 6TB HDD] (HDD for training data storage)<br>+ Network card: [e.g., 1Gbps]<br>+ Operating System: [e.g., Ubuntu 22.04 or Ubuntu 24.04]<br>+ Quantity: [Number of workstations, typically 1 unless large scale]<br>**Reference KB Examples**:<br>- **Vertiv_Tech Proposal**: CPU i9-14900K, GPU RTX 5080, RAM 64GB, Storage 2TB SSD + 6TB HDD, OS Ubuntu 24.04<br>- **Lavie_Tech Proposal**: CPU i9-14900K, GPU RTX 4080, RAM 64GB, Storage 4TB, OS Ubuntu 22.04<br>- **Nitto Hưng Yên**: CPU i7-14700K, GPU RTX 4080, RAM 32GB, Storage 3TB, OS Ubuntu 22.04<br>- **STS Oman**: CPU i7-14700K, GPU RTX 5080, RAM 32GB, Storage 2TB SSD, OS Ubuntu 24.04<br>- **EGA Proposal**: CPU i7-14700K, GPU RTX 4080, RAM 64GB, Storage >=1TB, OS Ubuntu 24.04<br>- **PDO Proposal (PoC)**: CPU i9-14900K, GPU RTX 4090, RAM 128GB, Storage >=3TB<br>**KB Reference**: Search KB "DOCUMENT" or "viAct_Proposal" for "Training Workstation" specifications<br>**Calculator**: Use AI_Workstation_Calculator.xlsx → Training baseline: CPU i5/i7, GPU 4060Ti/4070Ti Super (16GB), RAM 64GB, NVMe 2TB<br>**Logic**:<br>- TLI ≤ 100 → 1 training WS with 1× (4060Ti/4070TiS)<br>- 100 < TLI ≤ 300 → 2 training WS or 1 WS with 2 GPUs<br>- TLI > 300 → #WS_training = ceil(TLI / 150)<br>- Standard baseline: CPU i5-14400K or i7-13700, RAM 64GB (increase to 96GB if large dataset), GPU 4060Ti/4070TiS 16GB, NVMe 2-4TB |
| **Dashboard Workstation** | **IMPORTANT: If Deployment method is Cloud → SKIP this section** (Dashboard is hosted on cloud, no on-premise dashboard workstation needed)<br><br>**If Deployment method is On-premise or Hybrid**:<br>**Input from Deal Transfer**:<br>+ Deployment method: S2 - "Specific HW/SW requirements (deployment method)?"<br>+ Number of sites: Check if multiple sites need local dashboard<br>+ Custom dashboard requirements: S2 - "Any customized dashboard?"<br>**Output Format**:<br>+ CPU: [e.g., Intel Core i7-14700K or equivalent]<br>+ RAM: [e.g., 64GB]<br>+ Storage: [e.g., 2TB SSD] (may need additional HDD for long-term data retention)<br>+ Network card: [e.g., 1Gbps]<br>+ Operating System: [e.g., Ubuntu 24.04 or Ubuntu 22.04]<br>+ Quantity: [Number of workstations - typically 1 per site if local dashboard, or 1 centralized if hybrid]<br>**Note**: Dashboard Workstation typically **DOES NOT require GPU** (only CPU, RAM, Storage, Network)<br>**Reference KB Examples**:<br>- **Vertiv_Tech Proposal**: CPU i9-14900K, RAM 64GB, Storage 2TB SSD + 8TB HDD, Network 1Gbps, OS Ubuntu 24.04<br>- **Shell Oman**: CPU i7-14700K, RAM 64GB, Storage 2TB SSD, Network 1Gbps<br>- **EGA Proposal**: CPU i7-14700K, RAM 64GB, Storage 2TB SSD, Network 1Gbps, OS Ubuntu 24.04<br>- **STS Oman**: CPU i7-14700K, RAM 32GB, Storage 2TB SSD, Network 1Gbps, OS Ubuntu 24.04<br>- **Superfine**: CPU i7-14700K, RAM 64GB, Storage 2TB SSD, Network 1Gbps, OS Ubuntu 22.04<br>- **Northern Offshore**: CPU i7-13700K, RAM 16GB, Storage 1TB SSD, OS Ubuntu 22.04 (Platform workstation)<br>**KB Reference**: Search KB "DOCUMENT" or "viAct_Proposal" for "Dashboard Workstation" specifications<br>**Logic**:<br>- If on-premise deployment → Need local dashboard workstation<br>- If hybrid deployment → May need local dashboard workstation depending on requirements<br>- If multiple sites → May need dashboard workstation per site<br>- Storage: 2TB SSD minimum, add HDD if long-term data retention required (e.g., 8TB HDD for Shell Oman)<br>- RAM: Typically 32-64GB depending on data volume and concurrent users |
| **Additional Equipment** | Access control devices, kiosks, sensors, IoT devices, etc.<br>**Source**: S2 - "Any IoT integration?" + S2 - "Any customized HW / IoT?" |

### 5.1 Power Requirements

**IMPORTANT: If Deployment method is Cloud → SKIP this section** (Power requirements for cameras are handled by client and mentioned in Scope of Work - Client Responsibilities. No workstation power requirements needed for cloud deployment.)

**If Deployment method is On-premise or Hybrid**:

| Content | Source/Guidance |
|---------|------------------|
| **Power Source** | Stable / UPS / Generator / etc.<br>**Source**: S2 - "Stable power source?" (check answer: yes/no)<br>**Note**: Include power requirements for workstations, UPS backup if needed, and any power specifications for on-premise infrastructure |

---

## 6. IMPLEMENTATION PLAN (TIMELINE)

### Common Items (Always Present):

### 6.1 Key Milestones

- **Proposal submission date**
- **Project award date** (T0)
- **Hardware deployment** (T1)
- **Software deployment** (T2)
- **Integration period** (T3)

### 6.2 Phasing Structure

> **IMPORTANT**: ALL phases (T0, T1, T2, T3) MUST be included in timeline. **T1 (Hardware Deployment) is REQUIRED even if cameras already installed** - it still requires camera verification, network setup verification, and hardware assessment (1-2 weeks). Only the duration changes based on camera status, not whether T1 exists.

| Phase | Description | Duration | Source/Guidance |
|-------|-------------|----------|-----------------|
| **Phase T0** | Project Award / Contract Signed | — |  |
| **Phase T1** | Hardware Deployment | T0 + X weeks | **REQUIRED - NEVER SKIP**<br>**Logic**:<br>- **If cameras already installed** (S1 - "If VA, do they already have camera installed?" = "Yes" or cameras exist): T1 = T0 + 1-2 weeks (camera verification, network setup verification, hardware assessment)<br>- **If new camera installation**: T1 = T0 + 2-4 weeks (procurement, installation, configuration)<br>**Source**: S1 - "If VA, do they already have camera installed? Do we need to handle HW implementation? How many camera they would like to run AI model?" → Check if cameras exist|
| **Phase T2** | Software Deployment | T1 + X weeks | **Logic**: Depends on number of modules and classification<br>- Standard Modules: 4-6 weeks<br>- Customize Modules: 6-8 weeks per module<br>- If mixed: Calculate based on module count<br>**Source**: S2 - "List of VA use cases" → Identify standard vs custom (check S2 - "Any customized AI use cases") |
| **Phase T3** | System Integration & Handover / UAT | X weeks | **Standard**: T2 + 2-4 weeks<br>**Includes**: Integration testing, UAT, training |

**Source from Deal Transfer:**
- **Primary source**: S1 - "If real project, expected timeline (including tender if any)"
- **Camera status check**: S1 - "If VA, do they already have camera installed? Do we need to handle HW implementation? How many camera they would like to run AI model?" → **Critical for T1 calculation**
- **Logic**:
  - **T1 (Hardware)**: Check if cameras exist → 1-2 weeks if cameras installed, 2-4 weeks if new installation
  - If pilot/PoC → Shorter timeline (4-6 weeks total)
  - If full deployment → Longer timeline (2-4 months total)
  - Custom modules → Add development time (6-8 weeks per custom module)

---

## 7. PROPOSED MODULES & FUNCTIONAL DESCRIPTION

### Common Items (Always Present):

### 7.1 Module Classification

**Divide modules into:**
- **Standard AI Modules**: Available in KB (reference `STANDARD_MODULES.md`), can reuse existing descriptions from KB
- **Custom Modules**: Not found in standard list, need to create descriptions based on customer requirements

**Source**: S2 - "List of VA use cases" → Check against `STANDARD_MODULES.md` to determine if standard or custom

### 7.2 Module Description Template

**For EACH module (both Standard and Custom), fill in the following template:**

| Field | Content | Source/Guidance |
|-------|---------|------------------|
| **Module Name** | [Module Name] | **Source**: S2 - "List of VA use cases" → Convert use case to module name or **AI Modules** from 2<br>**Logic**: Use standard module name from `STANDARD_MODULES.md` if available, otherwise create descriptive name |
| **Module Type** | Standard / Custom | **Logic**: Check if module name exists in `STANDARD_MODULES.md`<br>- If found → Standard<br>- If not found → Custom |
| **Purpose Description** | Describe what this module detects and why it matters | **Source**:<br>- Standard: Search Knowledge Base for module description<br>- Custom: S2 - "Any customized AI use cases (description & videos)?" → Extract purpose<br>**Format**: 1-2 sentences explaining what it detects and business value |
| **Alert Trigger Logic** | When does it alert? | **Source**:<br>- Standard: From KB module descriptions<br>- Custom: S2 - "Any customized AI use cases" → Extract alert conditions<br>**Examples**:<br>- "Alert triggers when worker not wearing safety helmet detected"<br>- "Alert triggers when person enters restricted area"<br>- "Alert triggers when loitering detected for more than [X] seconds" |
| **Detection Criteria** (if custom or specific) | Specific rules, thresholds, conditions | **Source**: S2 - "Any customized AI use cases" → Extract specific requirements<br>**Examples**:<br>- "Loitering threshold: [X] seconds"<br>- "Proximity alert: within 30cm (1 foot) of moving forklift"<br>- "Only for crane operators" (if role-specific) |
| **Preconditions** | Camera angle, height, lighting requirements | **Standard Template**:<br>"Camera must maintain a suitable distance for clear observation, typically between [X] to [Y] meters"<br>**Source**:<br>- Standard: From KB (typically 5-10 meters for general detection, 3-5 meters for detailed PPE)<br>- Custom: S2 - "Any customized AI use cases" → Extract if mentioned<br>**Common Preconditions**:<br>- Distance: 5-10 meters (general), 3-5 meters (detailed detection)<br>- Camera angle: Must face work area directly<br>- Lighting: Avoid glare or strong reflections |
| **Image URL** (if standard module) | URL to demonstration image | **Source**: `STANDARD_MODULES.md` → Look up module name, extract "Image URL" column value<br>**Logic**: Always include for standard modules (found in `STANDARD_MODULES.md`). If Image URL is available (not empty) in `STANDARD_MODULES.md`, use the URL. If Image URL is empty in `STANDARD_MODULES.md`, use empty string `""`<br>**Format**: Direct URL link or `""` (empty string) if not available |
| **Video URL** (if standard module) | URL to demonstration video | **Source**: `STANDARD_MODULES.md` → Look up module name, extract "Video URL" column value<br>**Logic**: Only include if module is Standard (found in `STANDARD_MODULES.md`) AND Video URL is available (not empty)<br>**Format**: Direct URL link or leave blank if not available |
| **Client Data Requirements** (if custom module) | Images, video samples, or labels required for training | **Source**: S2 - "Any customized AI use cases" → Check if training data mentioned<br>**Format**:<br>"Request: Provide [object type] images (color, type) for model training"<br>**Only needed for**: Custom modules requiring model training |

**Module Template Format (Fill for each module):**

```
Module: [Module Name]
Module Type: [Standard / Custom]

• Purpose Description: [1-2 sentences describing what it detects and why it matters]

• Alert Trigger Logic: [When does it alert? Specific conditions]

• Detection Criteria: [If custom, specific rules/thresholds - e.g., "loitering > 30 seconds", "proximity < 30cm"]

• Preconditions: [Camera distance: typically X to Y meters. Camera angle, lighting requirements if specific]

• Image URL: [Only for standard modules - URL from STANDARD_MODULES.md, use "" (empty string) if not available]

• Video URL: [Only for standard modules - URL from STANDARD_MODULES.md, leave blank if not available]

• Client Data Requirements: [Only for custom modules: "Request: Provide [object type] images for model training"]
```

### 7.3 Process for Filling Module Descriptions

| Step | Action | Source/Guidance |
|------|--------|------------------|
| **Step 1: Identify Modules** | Extract list from S2 - "List of VA use cases" | Convert use case descriptions to module names |
| **Step 2: Classify** | Check each module in `STANDARD_MODULES.md` | Standard → Search KB for description<br>Custom → Use Deal Transfer description |
| **Step 3: Fill Template** | For each module, fill all fields in template above | Use KB search for standard modules<br>Use S2 - "Any customized AI use cases" for custom |
| **Step 4: Standard Modules** | Search Knowledge Base + `STANDARD_MODULES.md` | Find existing module descriptions to reuse text (Purpose, Alert Logic, Preconditions)<br>**Extract Image URL and Video URL from `STANDARD_MODULES.md`** - Always include Image URL field (use URL if available, or `""` if empty). Always include Video URL field (use URL if available, or `""` if not available) |
| **Step 5: Custom Modules** | Extract from S2 - "Any customized AI use cases" | Create description based on customer requirements<br>**Note**: Image URL and Video URL are NOT included for custom modules |

### 7.4 Module-to-Pain-Point Mapping (Internal Logic)

**How to derive modules from pain points:**

| Pain Point (Deal Transfer S1) | → | AI Module (Proposal) |
|----------------------------|---|---------------------|
| Safety incidents not detected | → | PPE Detection, Unsafe Behavior Detection, Human Down Detection |
| Manual counting inaccurate | → | People Counting, Vehicle Counting, Object/Package Counting |
| Unauthorized access | → | Facial Recognition, Intrusion Detection, Restricted Area Monitoring |
| Spills/debris not cleaned | → | Spill Detection, Debris Detection |
| Equipment collision risk | → | Anti-collision Detection, Worker-Machine Anti-Collision |
| Workers in restricted areas | → | Restricted Area Monitoring, Red Zone Management |
| Fire/smoke incidents | → | Fire & Smoke Detection |
| Loitering concerns | → | Loitering Detection |
| Vehicle/parking violations | → | Vehicle Detection, Parking Violation Detection |
| Process inefficiencies | → | Process Monitoring, Queue Management |

**Source from Deal Transfer:**
- **Primary source**: S1 - "Current Pain Points of end customer"
- **Logic**: Map each pain point to corresponding AI module(s)
- **Secondary source**: S2 - "List of VA use cases" (if customer already specified)

---

## 8. USER INTERFACE & REPORTING

**IMPORTANT: Include Section 8 ONLY if there are custom requirements. If all features are standard viAct features, SKIP this section.**

**Include Section 8 if:**
- S2 - "Any customized dashboard?" has content (custom KPIs, multi-dashboard, custom reporting features)
- S2 - "How do they want to alert operators on-site?" mentions non-standard channels (VMS integration, on-site alarms, special integrations beyond standard Email/Dashboard/Telegram/SMS)

**Skip Section 8 if:**
- S2 - "Any customized dashboard?" = "no" or blank
- S2 - "How do they want to alert operators on-site?" only mentions standard channels (Dashboard, Email, Telegram, SMS) - these are standard viAct features and do not need to be detailed in proposal

### 8.1 Alerts & Notifications

| Content | Source/Guidance |
|---------|------------------|
| **Channels** | Email, Mobile App, SMS, Dashboard Pop-ups, On-site Alarms, VMS Integration<br>**Source**: S2 - "How do they want to alert operators on-site?" (exact field name)<br>**Logic**:<br>- Answer mentions "Email/dashboard" → Email + Dashboard<br>- Answer mentions "On-site alarm" → Sound/visual alarms<br>- Answer mentions "VMS integration" → VMS pop-up alerts<br>- If answer is blank/not specified → Standard (Email + Dashboard)<br>**Note**: Only include this section if there are non-standard alert channels. Standard channels (Dashboard, Email, Telegram, SMS) are standard viAct features. |

### 8.2 Dashboard Visualizations

| Content | Source/Guidance |
|---------|------------------|
| **Event Analysis** | Charts and graphs of detection frequencies<br>**Source**: Standard feature, mention if customer needs specific KPIs |
| **Alert Timelines** | Chronological view of incidents<br>**Source**: Standard feature |
| **Evidence Snapshots** | Image/Video clips of the detected event<br>**Source**: Standard feature |
| **Custom KPIs** | If customer specified custom KPIs<br>**Source**: S2 - "Any customized dashboard?" → Extract KPI requirements from answer<br>**Example**: Active pumps, Idle pumps, Queue length, Violations per hour, etc.<br>**Note**: Only include if S2 - "Any customized dashboard?" has custom KPI requirements |
| **Multi-Dashboard** | If customer needs per-site + central HQ dashboard<br>**Source**: S2 - "Any customized dashboard?" → Check if answer mentions multi-dashboard<br>**Note**: Only include if multi-dashboard requirement is specified |

### 8.3 Daily / Weekly Summary Reports

| Content | Source/Guidance |
|---------|------------------|
| **Automated Reporting Features** | Sent to stakeholders<br>**Source**: S2 - "Any customized dashboard?" → Check answer for reporting requirements<br>**Logic**:<br>- If answer mentions "daily report" → Include daily summary<br>- If answer mentions "excel export" → Include Excel export<br>- If answer mentions "timestamp filter" → Include filtering options<br>**Format**:<br>- Time range: [e.g., 7 AM - 9 PM] (extract from answer if mentioned)<br>- Export: Excel / PDF / CSV<br>- Filtering: Timestamp, area, event type<br>**Note**: Only include if S2 - "Any customized dashboard?" specifies custom reporting requirements. Standard reporting (daily/weekly summaries, Excel export) are standard viAct features and do not need to be detailed if no custom requirements. |

---

## SUPPORTING SECTIONS (Use to inform main sections above)

### A. Compliance & Security Requirements

**Use this information to inform:**
- System Architecture (deployment method selection)
- System Requirements (data storage location)
- Integration Points (data handling)

**Source from Deal Transfer:**
- S2 - "Any GDPR / data privacy requirements?" (exact field name)
- **Logic**:
  - If answer mentions GDPR or data privacy concerns → On-premise or EU cloud deployment
  - Data retention policy → Storage requirements section (if mentioned in answer)
  - Access control requirements → Integration points section (if mentioned)

### B. Custom Requirements

**Use this information to inform:**
- AI Modules (custom modules needed → Section 7)
- System Architecture (custom integrations → Section 4)
- System Requirements (custom hardware → Section 5)
- Dashboard/Reporting (custom features → Section 8)

**Source from Deal Transfer:**
- S2 - "Any customized AI use cases (description & videos)?" → Custom Modules (Section 7)
- S2 - "Any customized dashboard?" → Dashboard Requirements (Section 8)
- S2 - "Any customized HW / IoT?" → Additional Equipment (Section 5)
- **Logic**:
  - If answer to "Any customized AI use cases" has content → Custom module development → Timeline adjustment (Section 6)
  - If answer to "Any customized dashboard" has content → Dashboard requirements section (Section 8)
  - If answer to "Any customized HW / IoT" has content → Integration points section (Section 4)

---

## MAPPING GUIDE: Deal Transfer → Proposal

### Step-by-Step Conversion Process:

#### Step 1: Extract Project Basics
**From Deal Transfer → Commercial (S1):**
- Customer name → **Cover Page**: Client Name + **Section 2**: Project Owner
- Solutions they want → **Section 2**: Project Objectives
- Timeline → **Section 2**: Project Duration + **Section 6**: Timeline

**From Deal Transfer → Technical (S2):**
- Camera number: S1 - "If VA: camera status & scope" → **Section 2**: Camera Number + **Section 4**: Architecture inputs
- VA use cases: S2 - "List of VA use cases" → **Section 2**: AI Modules List + **Section 7**: Module descriptions
- Deployment method: S2 - "Specific HW/SW requirements (deployment method)?" → **Section 4**: Architecture Type

#### Step 2: Convert Pain Points to Objectives
**Logic:**
- Read pain points (S1) → Identify root causes → Formulate positive objectives
- Example: "Manual counting inaccurate" → "Automate counting process with AI"
- Example: "Safety incidents not detected" → "Real-time safety monitoring and alerting"
- **Output**: **Section 2** - Project Objectives / Work Scope Statement

#### Step 3: Map Use Cases to Modules
**Logic:**
- Use case description (S2) → Standard module name (search KB first)
- If found in KB → Standard module (reuse KB slides)
- If not found → Custom module (create new slide)
- Example: "PPE detection" → "PPE Detection Module" (standard)
- Example: "Count packages at gate" → "Object Counting Module" (may be custom)
- **Output**: **Section 7** - List of AI Modules + Module descriptions

#### Step 4: Determine Architecture
**Logic:**
- Internet stable + no data security concern → Cloud possible
- Internet unstable → On-premise or Edge
- Data security concern → On-premise
- Multiple sites → Edge or Hybrid
- Single site → Centralized or Edge
- **Source**: S2 - "Specific HW/SW requirements (deployment method)?" + S2 - "Stable internet connection?" + S2 - "Any GDPR / data privacy requirements?"
- **Output**: **Section 4** - Architecture Type + Components

#### Step 5: Define Responsibilities
**Logic:**
- Check S1 - "If VA: camera status & scope" → If cameras exist, customer handles HW, viAct handles software
- New installation → Specify who handles what
- Check S2 - "Specific HW/SW requirements (deployment method)?" → If on-premise, customer may provide server/workstation
- If cloud → viAct handles infrastructure
- **Output**: **Section 3** - Scope of Work

#### Step 6: Calculate Timeline
**IMPORTANT: ALWAYS include ALL phases (T0, T1, T2, T3) in timeline. NEVER skip T1 (Hardware Deployment) even if cameras already installed.**

**Logic:**
- **T0**: Project Award / Contract Signed
- **T1 (Hardware Deployment) - REQUIRED**: 
  - **If cameras already installed** (check S1 - "If VA, do they already have camera installed?"): T1 = T0 + 1-2 weeks (camera verification, network setup verification, hardware assessment)
  - **If new camera installation**: T1 = T0 + 2-4 weeks (procurement, installation, configuration)
  - **Note**: T1 is ALWAYS required - even with existing cameras, verification and setup are needed
- **T2 (Software Deployment)**: 
  - Standard modules only → T1 + 4-6 weeks
  - Custom modules → Add 6-8 weeks development per custom module
  - If mixed: Calculate based on module count
- **T3 (Integration & UAT)**: T2 + 2-4 weeks
- **Total timeline**: 
  - Pilot/PoC → 4-6 weeks total
  - Full deployment → 2-4 months total
- **Source**: S1 - "If real project, expected timeline (including tender if any)" + S2 - "Any customized AI use cases (description & videos)?" + S1 - "If VA, do they already have camera installed?"
- **Output**: **Section 6** - Implementation Plan

#### Step 7: Configure Alerts & Dashboard
**Logic:**
- Check S2 - "Any customized dashboard?" → If answer has custom requirements (custom KPIs, multi-dashboard, custom reporting), include Section 8
- Check S2 - "How do they want to alert operators on-site?" → If answer mentions non-standard channels (VMS integration, on-site alarms, special integrations), include Section 8
- **If both are standard/blank**: Skip Section 8 (Dashboard, Email, Telegram, SMS, standard reporting are standard viAct features and do not need to be detailed in proposal)
- **Output**: **Section 8** - Alerts, Dashboard, Reporting (ONLY if custom requirements exist)

#### Step 8: Calculate System Requirements
**Logic:**
- Camera number: S1 - "If VA: camera status & scope" → Network bandwidth (12 Mbps × camera count)
- Number of cameras + modules (from S2 - "List of VA use cases") → Workstation specs (use AI_Workstation_Calculator)
- Deployment method: S2 - "Specific HW/SW requirements (deployment method)?" → Workstation location
- **Output**: **Section 5** - System Requirements

---

## COMMON PATTERNS & LOGIC

### Pattern 1: Safety-Focused Projects
**Typical Modules:**
- PPE Detection
- Restricted Area Monitoring
- Unsafe Behavior Detection
- Anti-collision Detection
- Human Down Detection

**Typical Architecture:**
- On-premise (data security)
- Real-time alerts critical

**Typical Timeline:**
- 2-3 months (full deployment)

### Pattern 2: Operations-Focused Projects
**Typical Modules:**
- People/Vehicle/Object Counting
- Queue Management
- Process Monitoring

**Typical Architecture:**
- Cloud or Hybrid (scalability)
- Dashboard with KPIs important

**Typical Timeline:**
- 4-6 weeks (pilot) or 2-3 months (full)

### Pattern 3: Security-Focused Projects
**Typical Modules:**
- Facial Recognition
- Intrusion Detection
- Loitering Detection

**Typical Architecture:**
- On-premise (privacy)
- Access control integration

**Typical Timeline:**
- 2-4 months (full deployment)

---

## NOTES FOR PRESALE TEAM

1. **Always start with Deal Transfer**: Extract all Commercial (S1) and Technical (S2) information first

2. **Pain Points → Objectives**: Don't just copy pain points, convert them into positive objectives (Section 2)

3. **Use Cases → Modules**: Map each use case to a specific module name (standard or custom). Always search KB first to see if it's a standard module (Section 7)

4. **Architecture Decision**: Base on S2 - "Stable internet connection?", S2 - "Any GDPR / data privacy requirements?", number of sites (Section 4)

5. **Timeline Realism**: 
   - Pilot: 4-6 weeks
   - Full deployment: 2-4 months
   - Custom modules: +6-8 weeks per module

6. **Responsibilities Clarity**: Clearly separate viAct vs Customer responsibilities (Section 3)

7. **Custom Requirements**: Always check S2 - "Any customized AI use cases (description & videos)?", S2 - "Any customized dashboard?", S2 - "Any customized HW / IoT?" - these affect timeline and scope (Supporting Sections)

8. **Missing Information**: If Deal Transfer lacks info, mark as "[To be confirmed]" in proposal

9. **KB Reference**: Always search KB "DOCUMENT" and "viAct_Proposal" for:
   - Standard modules → Reuse existing slides
   - Architecture diagrams → Reference existing slides
   - Workstation specs → Use AI_Workstation_Calculator

10. **Module Description Template**: All modules (standard and custom) should follow the same template structure: Purpose, Alert Logic, Data Requirements, Preconditions. **For standard modules only**: Always include Image URL field (extract from `STANDARD_MODULES.md`, use URL if available or `""` if empty) and Video URL field (extract from `STANDARD_MODULES.md`, use URL if available or  `""` if not available)

