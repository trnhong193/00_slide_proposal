# Architecture Templates from KB Examples

This document contains architecture patterns extracted from KB "DOCUMENT" dataset examples. Use these as reference when generating architecture diagrams.

## Cloud Architecture Pattern

**From KB Examples:**
- Shell Oman POC (On-cloud in AWS)
- viAct Sales Deck - Construction & Engineering
- glassjetTechnical Proposal (Cloud)

**Structure:**
```
On-Site Infrastructure:
  - Cameras (Up to X Cameras, IP-based Camera)
  - (NVR)* optional - Network Video Recorder (NVR)*
  - Internet Connection (4G/5G/WiFi, Provided by Client)

Cloud Infrastructure:
  - AI Training (Cloud)
  - On-cloud in AWS (viAct's CMP) with AI modules inside

Output Services (separate subgraph - client-accessible outputs):
  - Centralized Dashboard
  - Alert/Notification (Email & Mobile)
  - HSE Manager

AI Modules:
  - List all modules with full names (embedded in Cloud Inference node)

Flow:
  Camera → (NVR optional) → RTSP Links → Internet → Cloud Processing → Output Services (Dashboard & Alert) → HSE Manager
```

**Key Features:**
- NVR is optional (marked with *)
- Internet connection shown on-site
- Cloud processing shown as "On-cloud in AWS" or "viAct's CMP"
- AI modules embedded inside Cloud Inference node (compact mode) or listed separately
- Output Services (Dashboard, Alert, HSE Manager) grouped in separate subgraph to emphasize client-accessible outputs
- HSE Manager receives information from both Dashboard and Alert
- No internal cloud infrastructure details

## On-Premise Architecture Pattern

**From KB Examples:**
- Nitto Hưng Yên (Full Deployment On Premise)
- Al Harthy x EDO (On-premise)
- Northern Offshore (On-Premise)
- EGA, Superfine (On-premise)

**Structure:**
```
On-Site Infrastructure:
  - Cameras (Up to X Cameras, IP-based Camera)
  - (NVR)* optional - Network Video Recorder (NVR)*
  - AI Modules (On-Premise Processing: Training+Inference )
  - Local Dashboard (On premise)
  - Alert/Notification (Email & Mobile)
  - note that on premise, AI training/inference/dashboard-alert all need viAct enginner access

AI Modules:
  - List all modules with full names

Flow:
  Camera → (NVR optional) → RTSP Links → AI Processing (on premise) → Local Dashboard & Alert
```

**Key Features:**
- NVR usually shown (but marked optional with *)
- AI processing on-site
- Local dashboard
- AI modules listed separately
- No workstation specs in diagram

## Hybrid Architecture Pattern

**From KB Examples:**
- Melones Technical Proposal (Hybrid)
- Conestoga Meats (Hybrid)

**Structure:**
```
On-Site Infrastructure:
  - Cameras (Up to X Cameras, IP-based Camera)
  - (NVR)* optional - Network Video Recorder (NVR)*
  - AI Modules (On-Premise Processing)
  - Local Dashboard
  - Internet Connection

Cloud Infrastructure:
  - viAct's Cloud (AI Model Training)
  - Online Dashboard
  - Alert/Notification (Email & Mobile)

AI Modules:
  - List all modules with full names (no prefixes)

Flow:
  Camera → (NVR optional) → RTSP Links → AI Processing → Local Dashboard & Alert
  Internet → Cloud Training → Updated Models → AI Processing
  AI Processing → API → Online Dashboard
```

**Key Features:**
- On-premise AI inference
- Cloud for training
- local or online dashboards
- Model updates from cloud

## Common Patterns

### AI Modules Display

**Correct Format:**
```
subgraph "AI Modules"
    Mod1["Safety Helmet Detection"]
    Mod2["Safety Vest Detection"]
    Mod3["Safety Boots Detection"]
    ...
end
```

**Incorrect Format:**
- ❌ M1: Safety Helmet Detection
- ❌ Module 1: Safety Helmet Detection
- ❌ Just count: "5 AI Modules"

### NVR Display

**When to Show:**
- On-premise deployments (usually shown)
- When explicitly mentioned in proposal
- When client has existing NVR

**How to Mark:**
- Always mark as optional: `(NVR)*`
- Note: "Network Video Recorder (NVR)*"

**When to Hide:**
- Cloud deployments (usually hidden)
- When not mentioned in proposal

### Flow Simplification

**Essential Flow:**
```
Camera → (NVR optional) → RTSP Links → AI System → Dashboard & Alert
```

**Don't Show:**
- Router/Switch details
- Network topology details
- Internal cloud services (DB, API Gateway, Auth)
- Workstation specs in diagram

### Component Labels

**Cameras:**
- Format: `"Up to X Cameras<br/>IP-based Camera"`
- Or: `"Fixed Camera or Pan Tilt Zoom Camera"`

**AI System:**
- Cloud: `"viAct's CMP<br/>(Cloud Processing)"`
- On-premise: `"AI Modules<br/>On-Premise Processing"`

**Dashboard:**
- Cloud: `"Online Dashboard<br/>• Desktop & Mobile friendly<br/>• Real-time alerts<br/>• Video clips review<br/>• Analytics"`
- On-premise: `"Local Dashboard<br/>• Real-time alerts<br/>• Video review<br/>• Analytics"`

**Alert:**
- Format: `"Alert/Notification<br/>(Email & Dashboard)"`
- Or: `"Alert/Notification<br/>(Email & Mobile)"`

## Examples from KB

### Example 1: Cloud (Shell Oman POC)

**Components:**
- Up to 15 Cameras
- RTSP Links
- Network Video Recorder (NVR)
- On-cloud in AWS
- Centralized Dashboard
- Alert/Notification (Email & Mobile)
- 24 AI Modules listed

**AI Modules Listed:**
- Smoke Detection
- Liquid Leakage Detection
- Number Plate Detection
- Fire and Smoke Detection
- (and 20 more...)

### Example 2: On-Premise (Nitto Hưng Yên)

**Components:**
- Up to 20 Cameras
- RTSP Links
- Network Video Recorder (NVR)
- On-premise
- viAct's AI Engineer (VPN Access)
- HSE Manager
- API (AI Detection results, event alerts, processed metadata)
- Localized Dashboard
- AI Inference Workstation
- Alert/Notification (Email & Mobile)

**Flow:**
- Camera → NVR → RTSP Links → AI Inference Workstation
- AI Inference → Dashboard
- AI Inference → Alert

### Example 3: Hybrid (Melones)

**Components:**
- Fixed Camera or Pan Tilt Zoom Camera
- Network Video Recorder (NVR)*
- AI Modules on Premise Processing
- Online Training on viAct's cloud
- Control Room
- Satellites Internet Connection (20-30 Mbps)
- RTSP Links
- Edge AI Processor
- Online Dashboard

**AI Modules Listed:**
- Helmet detection
- Vest detection
- Safety Shoes detection

## Notes

1. **Keep it Simple**: Show only essential components clients need to understand
2. **Match KB Examples**: Follow the same structure as proposal slides
3. **List All Modules**: optional
4. **Mark Optional**: NVR should be marked as optional with *
5. **Clean Flow**: Camera → Processing → Dashboard & Alert
6. **No Internal Details**: Hide DB, API Gateway, Auth Service

