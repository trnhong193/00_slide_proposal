# Deployment Method Selection Logic and Architecture Requirements

## Overview
This document outlines the logic and reasoning for selecting deployment methods based on information from Deal Transfer files and corresponding Technical Proposals. It also specifies what information is required from Deal Transfer files to design system architecture for each deployment method.

---

## 1. Cloud Deployment (All at the Cloud)

### Selection Logic & Reasoning:
**When to Choose:**
- **POC/Proof of Concept**: Often used for initial demonstrations to showcase capabilities quickly
- **Stable Internet Connection**: Client has reliable, high-bandwidth internet (fiber network, stable 24/7)
- **No Data Security Constraints**: Client doesn't have strict data localization requirements
- **Single Site Initial Deployment**: Easier to approach and demonstrate ability at one site first
- **Client Preference**: Client explicitly prefers cloud-based solutions

**Key Decision Factors from Deal Transfer:**
- `Does client have stable internet connection?` → **Yes, stable/fiber network**
- `Any GDPR or data privacy requirements?` → **No or minimal**
- `Any specific HW/SW requirements such as deployment method?` → **Cloud preferred or flexible**
- **POC vs Full Deployment**: Often used for POC even when full deployment will be on-premise

**Example Cases:**
- **Ooredoo x Shell Oman (POC)**: Cloud for POC to demonstrate capability at 1 site, even though full deployment is on-premise
- **ADM (POC)**: Cloud for POC (5 cameras, 2 weeks), full deployment on-premise
- **glassjet**: On-cloud platform for pilot project

### Architecture Information Required from Deal Transfer:

**From Deal Transfer Files:**
1. **Camera Information:**
   - Number of cameras
   - Camera type (IP-based, RTSP support)
   - Camera specifications (1080p@25fps minimum)
   - Camera positions/coverage areas

2. **AI Requirements:**
   - List of AI modules/use cases
   - Number of AI modules per camera
   - Total AI flow calculation (cameras × modules per camera)

3. **Internet Connectivity:**
   - Internet connection type (fiber, stable connection)
   - Bandwidth availability
   - RTSP link access capability

4. **Dashboard Requirements:**
   - Dashboard type (single site, multi-site, centralized)
   - Custom dashboard requirements
   - Alert distribution methods

5. **Data & Security:**
   - GDPR requirements (if any)
   - Data retention policies
   - Access control requirements

---

## 2. Hybrid Deployment (AI Inference at Site, Dashboard + Training Cloud)

### Selection Logic & Reasoning:
**When to Choose:**
- **Cost-Effective Solution**: More cost-effective than full on-premise while maintaining local processing
- **Stable Internet Required**: Needs stable internet connection (20-30 Mbps for satellite, fiber preferred)
- **Real-time Local Processing**: Client needs real-time AI inference at site for immediate alerts
- **Cloud Benefits for Training**: Online AI training on cloud even when site is remote (e.g., vessels at sea)
- **Centralized Dashboard**: Need for centralized cloud dashboard for multi-site monitoring
- **Modular & Scalable**: Architecture must be modular, scalable, and integrable with future systems

**Key Decision Factors from Deal Transfer:**
- `Does client have stable internet connection?` → **Yes, stable (20-30 Mbps minimum for satellite)**
- `Any specific HW/SW requirements such as deployment method?` → **Modular, scalable architecture**
- **Multi-site Deployment**: Often chosen for multi-site projects with centralized management
- **Client Capability**: Client has capability for both cloud and on-premise components

**Example Cases:**
- **Melones (Vessels)**: Hybrid mode - AI inference locally on vessel, online AI training and dashboards on cloud (requires 20-30 Mbps satellite)
- **vdpqatar**: Hybrid (AI Infer on-premise, AI training and Dashboard on-cloud) for modular, scalable architecture
- **Conestoga Meats**: Cloud preferred but capability for all three → Hybrid suggested

### Architecture Information Required from Deal Transfer:

**From Deal Transfer Files:**
1. **Site Infrastructure:**
   - Number of sites
   - Local workstation availability/capability
   - Internet connection type and bandwidth (critical: 20-30 Mbps for satellite)

2. **AI Processing:**
   - Number of cameras per site
   - AI modules per camera
   - Total AI flow per site
   - Workstation specifications for local inference

3. **Network Requirements:**
   - Internet bandwidth (upload/download speeds)
   - Satellite connection details (if applicable)
   - Data usage considerations (AI training pulls significant bandwidth)

4. **Dashboard Requirements:**
   - Local dashboard needs (if any)
   - Centralized cloud dashboard requirements
   - Multi-site management needs

5. **Training Requirements:**
   - Frequency of AI retraining
   - Data transfer needs for training
   - Bandwidth consumption for training sessions

---

## 3. Hybrid Deployment (AI Inference + Training at Site, Dashboard Cloud)

### Selection Logic & Reasoning:
**When to Choose:**
- **Limited Internet for Training**: Internet connection not sufficient for frequent training data uploads
- **Local Training Capability**: Client has infrastructure for local AI training
- **Cloud Dashboard Only**: Only dashboard needs to be in cloud for remote access
- **Data Security**: Some data processing must remain local, but dashboard can be cloud-based

**Key Decision Factors from Deal Transfer:**
- `Does client have stable internet connection?` → **Limited or moderate bandwidth**
- `Any specific HW/SW requirements such as deployment method?` → **Local processing preferred**
- **Training Frequency**: Less frequent training or training can wait for better connectivity

### Architecture Information Required from Deal Transfer:

**From Deal Transfer Files:**
1. **Local Infrastructure:**
   - Training workstation specifications (CPU, RAM, GPU, Storage)
   - Inference workstation specifications
   - Local storage capacity

2. **Internet Connectivity:**
   - Bandwidth for dashboard access only
   - Connection stability for dashboard viewing

3. **Training Schedule:**
   - Training frequency requirements
   - Offline training capability needs

---

## 4. Full On-Premise Deployment (All at the Sites)

### Selection Logic & Reasoning:
**When to Choose:**
- **Data Security/Privacy Concerns**: Strong preference for local data storage and processing
- **GDPR/Data Localization Requirements**: Client must comply with data localization laws
- **Limited/Unstable Internet**: Poor or no internet connection (satellite with limited bandwidth, no connection)
- **Client Preference**: Explicit client requirement for on-premise only
- **Multi-Site with Local Dashboards**: Each site needs local dashboard, with optional central HQ dashboard
- **No Cloud Data Transfer**: Client doesn't want video data sent outside due to cost and safety
- **Critical Real-time Processing**: Need foolproof, stable local processing (no trial & error tolerance)

**Key Decision Factors from Deal Transfer:**
- `Does client have stable internet connection?` → **No, limited, or unstable (e.g., Starlink with tight bandwidth, satellite 5 Mbps)**
- `Any GDPR or data privacy requirements?` → **Yes, or strong data localization concerns**
- `Any specific HW/SW requirements such as deployment method?` → **On-premise only, no cloud**
- **Data Security**: "We will need several approvals before letting data go through any outsource server"
- **Client Statement**: "All video data stored locally", "On-premise deployment only (no cloud)"

**Example Cases:**
- **SATECH**: On-premise only (no cloud), AI on local workstation or control room server, must be foolproof
- **Superfine Industries**: Strong preference - all video data stored locally, optional cloud dashboard for viewing only
- **Melones (On-premise option)**: More efficient in limited internet areas, no AI retraining at sea
- **Northern Offshore**: Likely 100% on-premise, satellite internet 5 Mbps upload/download
- **Ooredoo x Shell Oman (Full)**: 220 sites with local dashboard requirement at each site
- **Vertiv UAE**: Prefers on-premise due to data security concerns for full implementation
- **Lavie**: On-prem deployment due to data protection

### Architecture Information Required from Deal Transfer:

**From Deal Transfer Files:**
1. **Hardware Specifications:**
   - **Inference Workstation:**
     - CPU: Intel Core i9 14900K or equivalent
     - RAM: 64 GB
     - GPU: RTX 5080 or equivalent
     - Storage: >=1TB
     - OS: Ubuntu 24.04
   
   - **Training Workstation (if needed):**
     - CPU: Intel Core i7 14700K or equivalent
     - RAM: 32 GB
     - GPU: RTX 4080 or equivalent
     - Storage: >=3TB
     - OS: Ubuntu 22.04
   
   - **Dashboard Workstation:**
     - CPU: Intel Core i7-14700K or equivalent
     - RAM: 64GB
     - Storage: 2TB SSD
     - Network card: 1Gbps

2. **Camera Information:**
   - Number of cameras
   - Camera specifications (1080p@25fps minimum)
   - RTSP link capability
   - Camera positions

3. **AI Requirements:**
   - List of AI modules
   - Number of AI modules per camera
   - Total AI flow (cameras × modules per camera)
   - Custom AI module requirements

4. **Network Requirements:**
   - Local bandwidth: 100Mbps (for local network)
   - External bandwidth: 30 Mbps (if any external connection needed)
   - VPN access requirements (for viAct support)

5. **Storage & NVR:**
   - NVR requirements
   - Video storage duration
   - Raw video clips and detection logs storage

6. **Dashboard Requirements:**
   - Local dashboard at each site
   - Central HQ dashboard (if multi-site)
   - API connections between sites and HQ

7. **Internet Connectivity (Limited):**
   - Connection type (satellite, Starlink, etc.)
   - Bandwidth limitations
   - Usage constraints (e.g., 1TB/month, 80% consumed by week 3)

8. **Data Security:**
   - GDPR requirements
   - Data localization requirements
   - Access control policies

---

## 5. 4G: VPN Bridge Deployment

### Selection Logic & Reasoning:
**When to Choose:**
- **Remote Locations**: Cameras in remote, rural, or low-visibility areas without fixed internet
- **No Static IP Required**: Cameras need to auto-register without static IP addresses
- **Mobile Network Coverage**: 4G/5G mobile network available at deployment sites
- **Rapid Deployment**: Need quick deployment without extensive infrastructure
- **Cost-Effective Connectivity**: Reduces OPEX (no need for fixed SIM data plans with static IPs)

**Key Decision Factors from Deal Transfer:**
- `Does client have stable internet connection?` → **No fixed internet, but 4G/5G available**
- **Remote Site Characteristics**: Remote areas, rural locations, underground infrastructure
- **Camera Auto-Registration**: Need for cameras to register automatically with central NVR

**Example Cases:**
- **Openreach**: Copper theft detection in remote areas, 4G SIM cards per camera, auto-registration with Dahua NVR

### Architecture Information Required from Deal Transfer:

**From Deal Transfer Files:**
1. **4G/5G Network Requirements:**
   - **Per Camera:**
     - Minimum uplink speed: 15 Mbps
     - No speed caps or fair usage throttling
     - Monthly bandwidth: 2TB or Unlimited (preferred)
   
   - **For viBUZZ (4G siren, if used):**
     - Monthly bandwidth: 2GB

2. **Central Site Requirements:**
   - Static IP address (at central NVR location)
   - External bandwidth: 30Mbps (estimated for around 5 cameras)

3. **Camera Specifications:**
   - 4G/5G capable cameras
   - Auto-registration capability (e.g., Dahua Auto Registration)
   - PTZ or fixed camera requirements

4. **NVR Requirements:**
   - Central NVR location
   - Auto-registration support
   - Video storage capacity

5. **Power Source:**
   - 12V DC or mains power availability
   - Solar power option (if off-grid)

6. **Site Characteristics:**
   - Remote/rural location details
   - Mobile network coverage
   - Number of cameras per site

---

## 6. viMov Deployment

### Selection Logic & Reasoning:
**When to Choose:**
- **High Mobility Monitoring**: Cameras need to be moved frequently (dynamic site conditions)
- **Limited Internet/Power**: Sites with limited or no internet/power infrastructure
- **Temporary/Mobile Setups**: Temporary deployments, mobile camera setups
- **Remote Monitoring**: Need for mobile-ready solution for remote areas
- **Rapid Deployment**: Quick deployment without fixed infrastructure

**Key Decision Factors from Deal Transfer:**
- **Mobility Requirements**: "Cameras to be moved and reconfigured depending on project phase"
- **Temporary Setups**: "New sites will deploy temporary or mobile setups"
- **Limited Infrastructure**: Internet/power limitations at deployment sites

**Example Cases:**
- **Openreach**: viMOV solution for copper theft detection
- **ADM**: Dynamic site conditions, cameras moved based on project phase

### Architecture Information Required from Deal Transfer:

**From Deal Transfer Files:**
1. **Mobility Requirements:**
   - Frequency of camera movement
   - Reconfiguration needs
   - Temporary vs permanent deployment

2. **Power Requirements:**
   - Power source availability (solar, battery, mains)
   - Power stability requirements

3. **Connectivity:**
   - Internet availability (if any)
   - Mobile network coverage
   - Data transfer requirements

4. **Camera Specifications:**
   - Portable/mobile camera requirements
   - Battery life needs
   - Weather resistance (IP rating)

5. **Deployment Characteristics:**
   - Number of temporary sites
   - Duration of deployment per site
   - Site accessibility

---

## Summary: Key Information from Deal Transfer Files

### Critical Questions to Answer from Deal Transfer:

1. **Internet Connectivity:**
   - `Does client have stable internet connection?`
   - Connection type (fiber, satellite, 4G, unstable)
   - Bandwidth (Mbps upload/download)
   - Usage limitations (data caps, monthly limits)

2. **Data Security & Privacy:**
   - `Any GDPR or data privacy requirements?`
   - Data localization requirements
   - Client preference for local vs cloud data storage
   - Approval processes for external servers

3. **Deployment Method Preference:**
   - `Any specific HW/SW requirements such as deployment method?`
   - Client's explicit preference
   - POC vs Full deployment requirements

4. **Camera Information:**
   - Number of cameras
   - Camera type (IP-based, RTSP support)
   - Camera specifications
   - Camera positions/coverage

5. **AI Requirements:**
   - List of AI modules/use cases
   - Number of AI modules per camera
   - Total AI flow calculation

6. **Infrastructure:**
   - Existing hardware (workstations, servers)
   - Power source stability
   - Local network capabilities

7. **Multi-Site Considerations:**
   - Number of sites
   - Central vs local dashboard requirements
   - Site-to-site connectivity needs

8. **Special Requirements:**
   - Mobility needs (viMov)
   - Remote location characteristics (4G VPN Bridge)
   - Critical real-time processing needs (On-premise)

---

## Decision Flow Chart Logic

```
Start: Analyze Deal Transfer Information
│
├─ Internet Connection?
│  ├─ No/Limited/Unstable → Consider: On-premise, 4G VPN Bridge, viMov
│  └─ Stable/High Bandwidth → Consider: Cloud, Hybrid
│
├─ Data Security/GDPR Requirements?
│  ├─ Strong Requirements → On-premise (or Hybrid with local inference)
│  └─ No/Minimal → Cloud or Hybrid
│
├─ Client Preference?
│  ├─ Explicit On-premise → On-premise
│  ├─ Explicit Cloud → Cloud (if internet allows)
│  └─ Flexible → Consider Hybrid
│
├─ Multi-Site?
│  ├─ Yes + Local Dashboards → On-premise with central HQ
│  ├─ Yes + Centralized → Hybrid or Cloud
│  └─ Single Site → All options possible
│
├─ Remote/Mobile Deployment?
│  ├─ Remote Areas → 4G VPN Bridge
│  ├─ Mobile/Temporary → viMov
│  └─ Fixed Location → Other methods
│
└─ POC vs Full Deployment?
   ├─ POC → Often Cloud (easier demonstration)
   └─ Full Deployment → Based on above factors
```

---

## Notes

- **POC vs Full Deployment**: Many projects use Cloud for POC (easier to demonstrate) but On-premise for full deployment (data security, multi-site requirements)
- **Internet Bandwidth Critical**: Hybrid deployments require stable internet (20-30 Mbps minimum for satellite)
- **Data Security is Primary Driver**: Strong data security/GDPR requirements almost always lead to On-premise
- **Multi-Site Complexity**: Multi-site projects with local dashboard requirements typically need On-premise with central coordination
- **Cost vs Security Trade-off**: Hybrid offers cost savings but requires stable internet; On-premise offers security but higher infrastructure costs

