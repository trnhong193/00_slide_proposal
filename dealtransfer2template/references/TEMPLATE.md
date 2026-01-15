# Technical Proposal Template

> **Purpose**: Minimal structure for extracting information from Deal Transfer documents (S1: Commercial, S2: Technical) to generate proposals.

---

## 1. COVER PAGE

| Field | Source | Logic |
|-------|--------|-------|
| Proposal Title | S1 - "Customer overview" | Format: "Video Analytics Solution Proposal for [Customer Name]" |
| Client Name | S1 - "Customer overview" | Extract company name |
| Date | | Proposal submission date |

---

## 2. PROJECT REQUIREMENT STATEMENT

| Field | Source | Logic |
|-------|--------|-------|
| Project | S1 - "Current Pain Points" | General pain point description |
| Project Owner | S1 - "Customer overview" | Customer name |
| Work Scope | S2 - "deployment method?" + S1 - "Pain Points" | Format: `[Deployment method] AI system to [general objective]` (one sentence, no module list) |
| Project Duration | S1 - "expected timeline" | X years/months |
| Camera Number | S1 - "camera installed? How many?" | X cameras |
| AI Modules per Camera | S2 - "List of VA use cases" | Count modules ÷ camera number (default: 3-4 if not specified) |
| AI Modules | S2 - "List of VA use cases" | List all modules (see Logic below) |

**Logic for AI Modules:**
- Break vague use cases into specific modules (see `Logic_for_Determining_List_of_AI_Modules_from_VA_usecases_and_Client_Painpoint.md`)
- Check `STANDARD_MODULES.md` to classify Standard vs Custom
- Cross-reference S1 pain points with S2 use cases

---

## 3. SCOPE OF WORK

| Field | Source | Logic |
|-------|--------|-------|
| viAct Responsibilities | S2 - "deployment method?" | Software: License, maintenance, support, camera integration |
| Client Responsibilities | S1 - "camera installed?" | If cameras exist → Client handles HW; If new → specify; If on-premise → may need server/workstation |

---

## 4. SYSTEM ARCHITECTURE

| Deployment Method | Source | Logic |
|------------------|--------|-------|
| Cloud | S2 - "deployment method?" = "Cloud" | KB: Search "Architecture-Cloud" |
| On Premise | S2 - "deployment method?" = "On-premise" | KB: Search "Architecture" (On-Premise) |
| Hybrid | S2 - "deployment method?" = blank | Default when not specified; KB: Search "Architecture-Hybrid" |
| Edge | S2 - "deployment method?" mentions "local" OR S2 - "Stable internet?" = "No" | For multiple sites or unstable internet |
| Other Components | S2 - Integration requirements | NVR, VPN Bridge, additional network equipment |

**Inputs needed:** Camera number (S1), AI modules list (S2)

---

## 5. SYSTEM REQUIREMENTS

### Network

| Deployment | Calculation | Source |
|------------|-------------|--------|
| Cloud | Internet: [Value] Mbps<br>Per-camera: 5-12 Mbps<br>Total: Per-camera × Camera Number | S2 - "Stable internet?" |
| On-premise/Hybrid | External: [Value] Mbps<br>Per-camera: 12 Mbps<br>Total: 12 Mbps × Camera Number | S2 - "Stable internet?" |

### Camera

| Field | Source | Logic |
|-------|--------|-------|
| Resolution | S2 - "Can client camera provide RTSP?" | Minimum: 1080p@25fps |
| Connectivity | S2 - "Can client camera provide RTSP?" | IP-based with RTSP support |

### AI Inference Workstation

**Skip if Cloud deployment**

| Field | Source | Calculation |
|-------|--------|-------------|
| Specs | S1 - Camera number<br>S2 - Modules/camera | ALI = Cameras × Modules/camera<br>Use AI_Workstation_Calculator.xlsx<br>Reference KB for similar projects |
| Output | | CPU, GPU, RAM, Storage, Network, OS, Quantity |

**Logic:**
- ≤40 cameras → RAM 32GB, GPU RTX 4070 Super
- 41-120 cameras → RAM 64GB, GPU RTX 4080 Super
- >120 cameras → RAM 128GB, GPU RTX 5080

### AI Training Workstation

**Skip if Cloud deployment**

| Field | Source | Calculation |
|-------|--------|-------------|
| Specs | S1 - Camera number<br>S2 - Modules/camera<br>S2 - Custom modules? | TLI = ALI (if training all)<br>Use AI_Workstation_Calculator.xlsx<br>Reference KB for similar projects |
| Output | | CPU, GPU, RAM, Storage (SSD + HDD), Network, OS, Quantity |

**Logic:**
- TLI ≤ 100 → 1 WS with 1× GPU (4060Ti/4070TiS)
- 100 < TLI ≤ 300 → 2 WS or 1 WS with 2 GPUs
- TLI > 300 → ceil(TLI / 150) workstations

### Dashboard Workstation

**Skip if Cloud deployment**

| Field | Source | Logic |
|-------|--------|-------|
| Specs | S2 - "deployment method?"<br>S2 - "customized dashboard?" | No GPU needed<br>CPU, RAM, Storage, Network, OS, Quantity |

### Additional Equipment

| Field | Source |
|-------|--------|
| IoT/Devices | S2 - "Any IoT integration?" + S2 - "Any customized HW / IoT?" |

### Power Requirements

**Skip if Cloud deployment**

| Field | Source |
|-------|--------|
| Power Source | S2 - "Stable power source?" |

---

## 6. IMPLEMENTATION PLAN (TIMELINE)

**IMPORTANT: ALL phases (T0, T1, T2, T3) MUST be included. T1 is REQUIRED even if cameras already installed.**

| Phase | Description | Duration | Source | Logic |
|-------|-------------|----------|--------|-------|
| T0 | Project Award / Contract Signed | — | | |
| T1 | Hardware Deployment | T0 + X weeks | S1 - "camera installed?" | **REQUIRED**<br>If cameras exist → 1-2 weeks (verification)<br>If new → 2-4 weeks (installation) |
| T2 | Software Deployment | T1 + X weeks | S2 - "List of VA use cases"<br>S2 - "customized AI use cases?" | Standard: 4-6 weeks<br>Custom: +6-8 weeks per module |
| T3 | Integration & UAT | T2 + 2-4 weeks | | Standard: 2-4 weeks |

**Total timeline:** Pilot/PoC: 4-6 weeks; Full deployment: 2-4 months

---

## 7. PROPOSED MODULES & FUNCTIONAL DESCRIPTION

### Module Classification

- **Standard**: Check `STANDARD_MODULES.md` → Search KB for descriptions
- **Custom**: Not in standard list → Create from S2 - "customized AI use cases"

### Module Template (Fill for each module)

| Field | Source | Logic |
|-------|--------|-------|
| Module Name | S2 - "List of VA use cases" | Use standard name from `STANDARD_MODULES.md` if available |
| Module Type | Check `STANDARD_MODULES.md` | Standard or Custom |
| Purpose Description | KB (standard) or S2 - "customized AI use cases" (custom) | 1-2 sentences: what it detects and why |
| Alert Trigger Logic | KB (standard) or S2 (custom) | When does it alert? |
| Detection Criteria | S2 - "customized AI use cases" | Specific rules/thresholds (if custom) |
| Preconditions | KB (standard) or S2 (custom) | Camera distance: 5-10m (general), 3-5m (detailed) |
| Image URL | `STANDARD_MODULES.md` (standard only) | Use URL if available, `""` if empty |
| Video URL | `STANDARD_MODULES.md` (standard only) | Use URL if available, `""` if not available |
| Client Data Requirements | S2 - "customized AI use cases" (custom only) | Training data needed (if custom) |

**Format:**
```
Module: [Name]
Module Type: [Standard/Custom]
• Purpose Description: [1-2 sentences]
• Alert Trigger Logic: [Conditions]
• Detection Criteria: [If custom: rules/thresholds]
• Preconditions: [Camera distance, angle, lighting]
• Image URL: [Standard only: URL or ""]
• Video URL: [Standard only: URL or ""]
• Client Data Requirements: [Custom only: training data needed]
```

---

## 8. USER INTERFACE & REPORTING

**Include ONLY if custom requirements exist. Skip if all features are standard.**

**Include if:**
- S2 - "Any customized dashboard?" has content (custom KPIs, multi-dashboard, custom reporting)
- S2 - "How do they want to alert operators on-site?" mentions non-standard channels (VMS, on-site alarms, beyond Email/Dashboard/Telegram/SMS)

**Skip if:**
- S2 - "Any customized dashboard?" = "no" or blank
- S2 - "How do they want to alert operators on-site?" only mentions standard channels

| Section | Field | Source | Logic |
|---------|-------|--------|-------|
| 8.1 Alerts & Notifications | Channels | S2 - "How do they want to alert operators on-site?" | Email, Mobile App, SMS, Dashboard, On-site Alarms, VMS Integration |
| 8.2 Dashboard Visualizations | Event Analysis | | Standard feature |
| | Alert Timelines | | Standard feature |
| | Evidence Snapshots | | Standard feature |
| | Custom KPIs | S2 - "Any customized dashboard?" | Extract KPI requirements |
| | Multi-Dashboard | S2 - "Any customized dashboard?" | Per-site + central HQ dashboard |
| 8.3 Reports | Automated Reporting | S2 - "Any customized dashboard?" | Daily/weekly summaries, Excel export, filtering |

---

## Supporting Information

### Compliance & Security

| Field | Source | Logic |
|-------|--------|-------|
| GDPR/Privacy | S2 - "Any GDPR / data privacy requirements?" | If mentioned → On-premise or EU cloud |

### Custom Requirements

| Field | Affects Section | Source |
|-------|----------------|--------|
| Custom AI use cases | Section 7 (Modules), Section 6 (Timeline) | S2 - "Any customized AI use cases?" |
| Custom dashboard | Section 8 | S2 - "Any customized dashboard?" |
| Custom HW/IoT | Section 4 (Architecture), Section 5 (Requirements) | S2 - "Any customized HW / IoT?" |

---

## Quick Reference: Pain Point → Module Mapping

| Pain Point (S1) | → | AI Module |
|-----------------|---|-----------|
| Safety incidents not detected | → | PPE Detection, Unsafe Behavior, Human Down |
| Manual counting inaccurate | → | People/Vehicle/Object Counting |
| Unauthorized access | → | Facial Recognition, Intrusion Detection, Restricted Area |
| Spills/debris | → | Spill Detection, Debris Detection |
| Equipment collision | → | Anti-collision Detection |
| Workers in restricted areas | → | Restricted Area Monitoring, Red Zone Management |
| Fire/smoke | → | Fire & Smoke Detection |
| Loitering | → | Loitering Detection |
| Vehicle/parking violations | → | Vehicle Detection, Parking Violation |
| Process inefficiencies | → | Process Monitoring, Queue Management |

---

## Common Patterns

| Pattern | Typical Modules | Architecture | Timeline |
|---------|----------------|--------------|----------|
| Safety-Focused | PPE, Restricted Area, Unsafe Behavior, Anti-collision, Human Down | On-premise | 2-3 months |
| Operations-Focused | People/Vehicle/Object Counting, Queue Management, Process Monitoring | Cloud/Hybrid | 4-6 weeks (pilot) or 2-3 months (full) |
| Security-Focused | Facial Recognition, Intrusion Detection, Loitering | On-premise | 2-4 months |
