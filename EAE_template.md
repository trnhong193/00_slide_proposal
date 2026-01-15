# Video Analytics Solution Proposal for EAE

## 1. COVER PAGE

**Proposal Title:** Video Analytics Solution Proposal for EAE

**Client Name:** EAE

**Date:** January 15, 2026

---

## 2. PROJECT REQUIREMENT STATEMENT

**Project:** AI-Powered Video Analytics for Workforce Safety Monitoring and Compliance

**Project Owner:** EAE

**Work Scope:** On-premise AI system to monitor workplace safety compliance and prevent accidents in real time

**Project Duration:** 6 months

**Camera Number:** 9 cameras

**Number of AI Module per Camera:** 3-4 modules per camera (typical average)

**AI Modules:**
1. Helmet Detection
2. Hi-vis Vest Detection
3. Fire & Smoke Detection
4. Anti Collision
5. Intrusion Detection (Danger Zone)
6. Human Down Detection

---

## 3. SCOPE OF WORK

### viAct Responsibilities
- Software: License, maintenance, and support
- Camera integration and AI model deployment
- System configuration and training

### Client Responsibilities
- Hardware: Procurement, configuration, installation, and maintenance of cameras and network infrastructure
- On-premise workstation procurement and setup
- Power supply and network connectivity

---

## 4. SYSTEM ARCHITECTURE

**Deployment Method:** On-Premise

The system architecture consists of:
- 9 IP cameras connected via network switch
- AI Inference Workstation for real-time video processing
- AI Training Workstation for model training (if required)
- Dashboard Workstation for monitoring and reporting
- Local network infrastructure for data transmission

**Data Flow:**
- Video streams from IP cameras → Network Switch → AI Inference Workstation
- Processed alerts and events → Dashboard Workstation
- Real-time notifications via Dashboard, Email, and Telegram

**Hardware Components Placement:**
- AI Inference Workstation: Central location for processing all camera feeds
- Dashboard Workstation: Central location for monitoring and reporting
- Network Switch: Central location connecting all cameras and workstations

---

## 5. SYSTEM REQUIREMENTS

### Network

**External Bandwidth:** 20 Mbps [NETWORK_001] (for remote access and updates)

**Per-camera Bandwidth:** 12 Mbps

**Total System Bandwidth:** 108 Mbps (12 Mbps × 9 cameras)

### Camera

**Resolution:** 1080p@25fps (minimum)

**Connectivity Type:** IP-based cameras with RTSP support

**Quantity:** 9 IP cameras

### AI Inference Workstation

**CPU:** Intel Core i7-13700K or equivalent

**GPU:** NVIDIA RTX 4070 Super or equivalent

**RAM:** 32GB

**Storage:** 2TB SSD

**Network Card:** 1Gbps

**Operating System:** Ubuntu 24.04

**Quantity:** 1 workstation

### AI Training Workstation

**CPU:** Intel Core i5-14400K or equivalent

**GPU:** NVIDIA RTX 4060Ti or RTX 4070Ti Super (16GB) or equivalent

**RAM:** 64GB

**Storage:** 2TB SSD + 6TB HDD

**Network Card:** 1Gbps

**Operating System:** Ubuntu 24.04

**Quantity:** 1 workstation

### Dashboard Workstation

**CPU:** Intel Core i7-14700K or equivalent

**RAM:** 64GB

**Storage:** 2TB SSD

**Network Card:** 1Gbps

**Operating System:** Ubuntu 24.04

**Quantity:** 1 workstation

### Power Requirements

**Power Source:** Stable power supply (UPS recommended for workstations)

---

## 6. IMPLEMENTATION PLAN (TIMELINE)

**Key Milestones:**
- Proposal submission date: [Date]
- Project award date (T0): [Date]
- Hardware deployment completion (T1): T0 + 1-2 weeks
- Software deployment completion (T2): T1 + 4-6 weeks
- Integration & UAT completion (T3): T2 + 2-4 weeks

**Phase T0:** Project Award / Contract Signed

**Phase T1:** Hardware Deployment
- Duration: T0 + 1-2 weeks
- Activities: Camera verification, network setup verification, hardware assessment, workstation installation and configuration

**Phase T2:** Software Deployment
- Duration: T1 + 4-6 weeks
- Activities: AI model deployment, system configuration, module testing

**Phase T3:** System Integration & Handover / UAT
- Duration: T2 + 2-4 weeks
- Activities: Integration testing, user acceptance testing, training, system handover

**Total Project Duration:** Approximately 8-12 weeks from project award

---

## 7. PROPOSED MODULES & FUNCTIONAL DESCRIPTION

### Module 1: Helmet Detection

**Module Type:** Standard

**Purpose Description:** Ensures compliance with safety regulations by identifying workers wearing safety helmets. Detects workers without a safety helmet on the construction site.

**Alert Trigger Logic:** AI will capture people not wearing a helmet or wearing the helmet, and trigger the real-time alerts.

**Preconditions:** Camera must maintain a suitable distance for clear observation of workers, typically between 5 to 10 meters.

**Image URL:** ""

**Video URL:** https://drive.google.com/file/d/1adkUPBJaBPbUVdirflpQwFOVai84p4k2/view?usp=sharing

---

### Module 2: Hi-vis Vest Detection

**Module Type:** Standard

**Purpose Description:** Detects workers wearing high-visibility vests. These vests enhance visibility, especially in low-light conditions.

**Alert Trigger Logic:** Alert will be sent out immediately to remind workers missing a reflective vest. AI identifies missing vests and notifies in real time.

**Preconditions:** Camera must maintain a suitable distance for clear observation of workers, typically between 5 to 10 meters.

**Image URL:** ""

**Video URL:** https://drive.google.com/file/d/1adkUPBJaBPbUVdirflpQwFOVai84p4k2/view?usp=sharing

---

### Module 3: Fire & Smoke Detection

**Module Type:** Standard

**Purpose Description:** Detects situations where fire or smoke is present in the monitored area, ensuring early intervention and safety compliance.

**Alert Trigger Logic:** Automatically triggers an alert when fire or smoke is detected in the area, enabling quick response and mitigation actions.

**Preconditions:** Camera must directly face the work area, allowing a clear view of the work area – the area prone to fire hazards.

**Image URL:** ""

**Video URL:** https://drive.google.com/file/d/1hR2FZrlMhmPXq2qvbWm0D7uKZ6KDhtkc/view?usp=sharing

---

### Module 4: Anti Collision

**Module Type:** Standard

**Purpose Description:** Detects and identifies potential or actual workers dangerously close to moving machinery within 100 cm (3 feet) and between workers.

**Alert Trigger Logic:** Automatically triggers an alert when a near-miss from 100cm or a collision occurs.

**Preconditions:** Requires providing images of different vehicle types for model training.

**Image URL:** ""

**Video URL:** https://drive.google.com/file/d/1h50cgHZ0qhxEdUoFLtnSUbxvAgGzX_YR/view?usp=sharing

---

### Module 5: Intrusion Detection (Danger Zone)

**Module Type:** Standard

**Purpose Description:** Alerts for unauthorized entry into restricted zones (e.g., construction sites, secure facilities). Enhances security and prevents unauthorized access.

**Alert Trigger Logic:** Alarms trigger if someone enters without authorization.

**Preconditions:** Cameras cover perimeter areas, continuously monitoring for intruders.

**Image URL:** ""

**Video URL:** https://drive.google.com/file/d/1nOg_F26X5p00VwunI7vxq2NC3f3ENK2G/view?usp=sharing

---

### Module 6: Human Down Detection

**Module Type:** Standard

**Purpose Description:** Detects worker falls or immobility.

**Alert Trigger Logic:** AI will capture a worker's fall and inform immediately.

**Preconditions:** Camera must maintain a suitable distance for clear observation of workers, typically between 5 to 10 meters.

**Image URL:** ""

**Video URL:** https://drive.google.com/file/d/1td7wDI3hPH50adRF2SzcfxalXl_h7vw_/view?usp=sharing

---
