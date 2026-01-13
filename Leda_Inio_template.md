# Video Analytics Solution Proposal for Leda Inio

## 1. COVER PAGE

**Client Name**: Leda Inio  
**Proposal Title**: Video Analytics Solution Proposal for Leda Inio  
**Date**: 2027-01-20

---

## 2. PROJECT REQUIREMENT STATEMENT

**Project**: AI-Powered Video Analytics for Workplace Safety Monitoring and Compliance

**Project Owner**: Leda Inio

**Work Scope**: On-premise AI system to monitor workplace safety compliance in real time

**Project Duration**: 6 months

**Camera Number**: 9 cameras

**Number of AI Module per Camera**: 5 module per camera (7 modules deployed across 9 cameras)

**AI Modules**:
1. Helmet Detection
2. Safety Mask Detection
3. Hi-vis vest detection
4. Fire & Smoke Detection
5. Anti-Collision
6. Intrusion detection (Danger zone)
7. Human Down Detection

---

## 3. SCOPE OF WORK

### viAct Responsibilities
- Software: License, maintenance, and support
- Camera integration and configuration
- AI module deployment and configuration
- System integration and testing
- Training and documentation

### Client Responsibilities
- Hardware: Camera maintenance (9 IP cameras already installed)
- AI Inference Workstation: Procurement, configuration, installation, and maintenance
- AI Training Workstation: Procurement, configuration, installation, and maintenance (if required)
- Dashboard Workstation: Procurement, configuration, installation, and maintenance
- Network infrastructure: Local network setup and maintenance
- Power supply: Stable power source for workstations
- Site access: Provide access for installation and maintenance activities

---

## 4. SYSTEM ARCHITECTURE

**Deployment Method**: On-Premise

The system architecture consists of:

- **9 IP Cameras**: Already installed, providing RTSP streams
- **AI Inference Workstation**: On-site processing for real-time video analytics
- **AI Training Workstation**: For model training and fine-tuning (if required)
- **Dashboard Workstation**: Local dashboard server for monitoring and reporting
- **Network Switch**: Local network infrastructure connecting cameras and workstations
- **Internet Connection**: Stable internet for remote access and updates

**Data Flow**:
1. IP cameras capture video streams and send RTSP feeds to AI Inference Workstation
2. AI Inference Workstation processes video streams using AI modules
3. Detection events trigger alerts and send data to Dashboard Workstation
4. Dashboard Workstation stores events and provides web-based interface
5. Alerts are sent via Dashboard, Email, and Telegram as configured

---

## 5. SYSTEM REQUIREMENTS

### Network
- External bandwidth: 30 Mbps
- Per-camera bandwidth: 12 Mbps
- Total system bandwidth: 108 Mbps (12 Mbps × 9 cameras)

### Camera
- Resolution: 1080p@25fps (minimum)
- Connectivity Type: IP-based cameras with RTSP support
- Quantity: 9 cameras
- Status: Already installed and configured

### AI Inference Workstation
- CPU: Intel Core i7-14700K
- GPU: RTX 4070 Super
- RAM: 32GB
- Storage: 2TB SSD
- Network card: 1Gbps
- Operating System: Ubuntu 24.04
- Quantity: 1 workstation

### AI Training Workstation
- CPU: Intel Core i7-14700K
- GPU: RTX 4070 Super
- RAM: 32GB
- Storage: 2TB SSD + 3TB HDD
- Network card: 1Gbps
- Operating System: Ubuntu 24.04
- Quantity: 1 workstation (if required)

### Dashboard Workstation
- CPU: Intel Core i7-14700K
- RAM: 32GB
- Storage: 2TB SSD
- Network card: 1Gbps
- Operating System: Ubuntu 24.04
- Quantity: 1 workstation

### Power Requirements
- Power Source: Stable power supply (client confirmed stable power source available)
- UPS backup recommended for workstations to ensure continuous operation

---

## 6. IMPLEMENTATION PLAN (TIMELINE)

### Key Milestones
- **T0**: Project Award / Contract Signed
- **T1**: Hardware Deployment (T0 + 2 weeks)
- **T2**: Software Deployment (T1 + 5 weeks)
- **T3**: System Integration & Handover / UAT (T2 + 3 weeks)

### Phase Details

**Phase T0: Project Award**
- Contract signing and project kickoff

**Phase T1: Hardware Deployment (T0 + 2 weeks)**
- Camera verification and RTSP link confirmation
- Network setup verification
- Workstation procurement and installation
- Hardware assessment and configuration

**Phase T2: Software Deployment (T1 + 5 weeks)**
- AI module configuration and deployment
- Dashboard setup and configuration
- Alert channel configuration (Dashboard, Email, Telegram)
- System integration testing

**Phase T3: System Integration & Handover / UAT (T2 + 3 weeks)**
- Integration testing
- User acceptance testing (UAT)
- Training and documentation
- System handover

**Total Duration**: Approximately 10 weeks from contract signing to system handover

---

## 7. PROPOSED MODULES & FUNCTIONAL DESCRIPTION

### Module 1: Helmet Detection
**Module Type**: Standard

• **Purpose Description**: Ensures compliance with safety regulations by identifying workers wearing safety helmets. Detects workers without a safety helmet on the construction site.

• **Alert Trigger Logic**: AI will capture people not wearing a helmet or wearing the helmet, and trigger the real-time alerts.

• **Preconditions**: Camera must maintain a suitable distance for clear observation of workers, typically between 5 to 10 meters.

• **Image URL**: ""

• **Video URL**: https://drive.google.com/file/d/15TS15w2Swd9nbQw82dGnubgJPEP058Mq/view?usp=sharing

---

### Module 2: Safety Mask Detection
**Module Type**: Standard

• **Purpose Description**: Detects the use of protective masks where respiratory protection is required.

• **Alert Trigger Logic**: AI alerts when workers are not wearing required masks in controlled zones.

• **Preconditions**: Camera must have clear facial visibility; angle must avoid obstructions.

• **Image URL**: ""

• **Video URL**: https://drive.google.com/file/d/1abtNV_P-CW-14tH7WY1oQ7Iok4BLTr0M/view?usp=sharing

---

### Module 3: Hi-vis vest detection
**Module Type**: Standard

• **Purpose Description**: Detects workers wearing high-visibility vests. These vests enhance visibility, especially in low-light conditions.

• **Alert Trigger Logic**: Alert will be sent out immediately to remind workers missing a reflective vest. AI identifies missing vests and notifies in real time.

• **Preconditions**: Camera must maintain a suitable distance for clear observation of workers, typically between 5 to 10 meters.

• **Image URL**: ""

• **Video URL**: https://drive.google.com/file/d/1adkUPBJaBPbUVdirflpQwFOVai84p4k2/view?usp=sharing

---

### Module 4: Fire & Smoke Detection
**Module Type**: Standard

• **Purpose Description**: Detects situations where fire or smoke is present in the monitored area, ensuring early intervention and safety compliance.

• **Alert Trigger Logic**: Automatically triggers an alert when fire or smoke is detected in the area, enabling quick response and mitigation actions.

• **Preconditions**: Camera must directly face the work area, allowing a clear view of the work area – the area prone to fire hazards.

• **Image URL**: ""

• **Video URL**: https://drive.google.com/file/d/1hR2FZrlMhmPXq2qvbWm0D7uKZ6KDhtkc/view?usp=sharing

---

### Module 5: Anti-Collision
**Module Type**: Standard

• **Purpose Description**: Detects and identifies potential or actual workers dangerously close to moving machinery within 100 cm (3 feet) and between workers.

• **Alert Trigger Logic**: Automatically triggers an alert when a near-miss from 100cm or a collision occurs.

• **Preconditions**: Requires providing images of different vehicle types for model training.

• **Image URL**: ""

• **Video URL**: https://drive.google.com/file/d/1h50cgHZ0qhxEdUoFLtnSUbxvAgGzX_YR/view?usp=sharing

---

### Module 6: Intrusion detection (Danger zone)
**Module Type**: Standard

• **Purpose Description**: Alerts for unauthorized entry into restricted zones (e.g., construction sites, secure facilities). Enhances security and prevents unauthorized access.

• **Alert Trigger Logic**: Alarms trigger if someone enters without authorization.

• **Preconditions**: Cameras cover perimeter areas, continuously monitoring for intruders.

• **Image URL**: ""

• **Video URL**: https://drive.google.com/file/d/1nOg_F26X5p00VwunI7vxq2NC3f3ENK2G/view?usp=sharing

---

### Module 7: Human Down Detection
**Module Type**: Standard

• **Purpose Description**: Detects worker falls or immobility.

• **Alert Trigger Logic**: AI will capture a worker's fall and inform immediately.

• **Preconditions**: Camera must maintain a suitable distance for clear observation of workers, typically between 5 to 10 meters.

• **Image URL**: ""

• **Video URL**: https://drive.google.com/file/d/1td7wDI3hPH50adRF2SzcfxalXl_h7vw_/view?usp=sharing

---

