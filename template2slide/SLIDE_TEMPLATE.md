# Slide Template Structure - Based on KB Analysis

> **Purpose**: Universal slide template structure for all technical proposals. Based on analysis of actual proposal slides in KB.
> 
> **Source**: KB dataset "viAct_Proposal" - Analyzed from 17+ real proposal slides

---

## Overview

This template defines slide structure for technical proposals, mapping from `TEMPLATE.md` (proposal content) to slide structure. Each section in `TEMPLATE.md` corresponds to one or more slides.

**Key Principles**:
- ✅ Only process **dynamic content** (varies by project)
- ❌ Skip **static slides** (viAct introduction, standard disclaimers)
- ✅ Based on **real KB proposals** (verified structure)
- ✅ **Reusable** for multiple projects

---

## Slide Mapping: TEMPLATE.md → Slides

| TEMPLATE.md Section | Slide Number(s) | Slide Type | Layout |
|---------------------|-----------------|------------|--------|
| 1. Cover Page | Slide 1 | Title slide | `title` |
| 2. Project Requirement Statement | Slide 2 | Content slide | `content_bullets` |
| 3. Scope of Work | Slide 3 | Two-column | `two_column` |
| 4. System Architecture | Slide 4 | Diagram | `diagram` |
| 5. System Requirements | Slide 5-7 | Content slides | `content_bullets` (can be merged if short) |
| 6. Implementation Plan | Slide 8 | Timeline | `timeline` |
| 7. Proposed Modules | Slide 9-20+ | Module descriptions | `module_description` (1 slide per module) |
| 8. User Interface & Reporting | Slide 21-23 | Content slides | `content_bullets` |

**Total Slides**: ~15-25 slides (depends on number of modules)

---

## Slide Type Definitions

### 1. Title Slide (`title`)
**Usage**: Cover page
**Layout**: Centered title + date
**Content Structure**:
```json
{
  "slide_number": 1,
  "type": "title",
  "title": "Video Analytics Solution Proposal for [Client Name]",
  "date": "[Proposal Date]"
}
```

**Note**: Subtitle and logo_path are not used. Title should be complete and descriptive.

---

### 2. Content Slide - Bullet Points (`content_bullets`)
**Usage**: General content with bullet points
**Layout**: Title + Bullet points
**Content Structure**:
```json
{
  "slide_number": 2,
  "type": "content_bullets",
  "title": "Project Requirement Statement",
  "content": [
    {
      "level": 0,
      "text": "Project: AI-based video analytics to monitor unsafe working conditions"
    },
    {
      "level": 0,
      "text": "Project Owner: STS Oman"
    },
    {
      "level": 0,
      "text": "Project duration: 3 months"
    },
    {
      "level": 0,
      "text": "Camera number: 5"
    },
    {
      "level": 1,
      "text": "AI modules:"
    },
    {
      "level": 2,
      "text": "Safety gloves (job-specific) detection"
    },
    {
      "level": 2,
      "text": "Detect when banksman and rigger present on the trailer"
    }
  ]
}
```

**Note**: All content that would be in tables should be converted to bullet points format.

---

### 3. Two-Column Slide (`two_column`)
**Usage**: Scope of Work (viAct vs Client responsibilities)
**Layout**: Title + Two columns side-by-side
**Content Structure**:
```json
{
  "slide_number": 3,
  "type": "two_column",
  "title": "Scope of Work",
  "left_column": {
    "title": "viAct Responsibilities",
    "content": [
      "Software: license, maintenance, support",
      "Camera integration",
      "AI model training and deployment"
    ]
  },
  "right_column": {
    "title": "Client Responsibilities",
    "content": [
      "Hardware: Procurement, configuration, installation",
      "Network infrastructure",
      "Camera installation and configuration"
    ]
  }
}
```

---

### 4. Diagram Slide (`diagram`)
**Usage**: System Architecture diagram
**Layout**: Title + Large image area
**Content Structure**:
```json
{
  "slide_number": 4,
  "type": "diagram",
  "title": "Proposed System Architecture",
  "diagram": {
    "type": "mermaid",
    "code": "graph TB\n    subgraph \"On-Site\"...",
    "description": "Optional: Brief architecture description text below diagram"
  }
}
```

**Note**: Diagram is generated from architecture-generator skill, converted from Mermaid to PNG image.

---

### 5. Timeline Slide (`timeline`)
**Usage**: Implementation Plan timeline
**Layout**: Title + Visual timeline with milestones
**Content Structure**:
```json
{
  "slide_number": 8,
  "type": "timeline",
  "title": "Implementation Plan",
  "timeline": {
    "format": "milestones",
    "milestones": [
      {
        "phase": "T0",
        "event": "Project awarded",
        "date": ""
      },
      {
        "phase": "T1",
        "event": "Hardware deployment finish",
        "date": "T0 + 2-4 weeks"
      },
      {
        "phase": "T2",
        "event": "Software deployment finish",
        "date": "T1 + Dev_time"
      },
      {
        "phase": "T3",
        "event": "Project hand-off",
        "date": "T2 + 1-2 weeks"
      }
    ]
  }
}
```

**Note**: Notes field is not used. Timeline shows only phase, event, and date.

---

### 6. Module Description Slide (`module_description`)
**Usage**: Individual AI module descriptions
**Layout**: Title + Structured content + Image
**Content Structure**:
```json
{
  "slide_number": 9,
  "type": "module_description",
  "title": "Safety Gloves Detection",
  "module_type": "Custom",
  "content": {
    "purpose": "Detects the presence of dedicated safety gloves to ensure workers meet safety gear regulation when lifting beams.",
    "alert_logic": "AI will capture people not wearing dedicated safety gloves and trigger real-time alerts to network strobe siren.",
    "preconditions": "Camera must maintain a suitable distance for clear observation of workers, typically between 3 to 5 meters.",
    "data_requirements": "Request: Provide gloves images (color, type) for model training"
  },
  "image_path": "assets/module_0.png"
}
```

**Important Notes**:
- **Image URL and Video URL are NOT included in slide structure** - they are processed separately
- Images from Google Drive URLs are automatically downloaded during PowerPoint generation
- Downloaded images are saved to `assets/` folder and referenced by `image_path`
- One slide per module (not grouped)

---

## Detailed Slide-by-Slide Structure

### Slide 1: Cover Page
- **Type**: `title`
- **Source**: TEMPLATE.md Section 1
- **Content**:
  - Title: "Video Analytics Solution Proposal for [Client Name]"
  - Date: Proposal submission date
- **Note**: No subtitle or logo_path

---

### Slide 2: Project Requirement Statement
- **Type**: `content_bullets`
- **Source**: TEMPLATE.md Section 2
- **Content Fields** (as bullet points):
  - Project (general pain point)
  - Project Owner
  - Work Scope
  - Project Duration
  - Camera Number
  - Number of AI Module per Camera
  - AI Modules (list)

---

### Slide 3: Scope of Work
- **Type**: `two_column`
- **Source**: TEMPLATE.md Section 3
- **Content**:
  - **Left Column**: viAct Responsibilities
  - **Right Column**: Client Responsibilities

---

### Slide 4: System Architecture
- **Type**: `diagram`
- **Source**: TEMPLATE.md Section 4 + Architecture diagram from architecture-generator skill
- **Content**:
  - Diagram: Generated from architecture-generator
  - Description: Optional brief description (if needed)

---

### Slide 5-7: System Requirements
- **Type**: `content_bullets`
- **Source**: TEMPLATE.md Section 5

**Sub-sections** (can be merged if content is short):
- **Network Requirements** (optional - external bandwidth)
  - Per-camera bandwidth
  - Total system bandwidth
- **Camera Specifications**
  - Resolution, frame rate
  - Connectivity type
- **Workstation Specifications** (can be merged into 1-2 slides if short)
  - AI Training Workstation (if applicable)
  - AI Inference Workstation (if applicable)
  - Dashboard Workstation (if applicable)

**Merging Rules**:
- If Network and Camera sections are short, merge into one slide
- If all Workstation specs are short, merge into one slide
- Otherwise, keep separate slides for better readability

---

### Slide 8: Implementation Plan
- **Type**: `timeline`
- **Source**: TEMPLATE.md Section 6
- **Content**:
  - Timeline: T0, T1, T2, T3 with dates
  - **Note**: Notes field is not used in timeline slides

---

### Slide 9-20+: Proposed Modules
- **Type**: `module_description`
- **Source**: TEMPLATE.md Section 7
- **Structure**: One slide per module

**Content per Module**:
- Module Name
- Module Type (Standard/Custom)
- Purpose Description
- Alert Trigger Logic
- Detection Criteria (if custom)
- Preconditions
- Data Requirements (if custom)
- **Image**: Automatically downloaded from Google Drive URL and inserted into slide

**Important**:
- Image URLs are processed during PowerPoint generation, not stored in slide structure
- Images are downloaded to `assets/` folder
- Each module gets its own slide with image on the right side

---

### Slide 21-23: User Interface & Reporting
- **Type**: `content_bullets`
- **Source**: TEMPLATE.md Section 8

**Sub-slides**:
- **Slide 21**: Alerts & Notifications
  - Channels: Email, Mobile App, SMS, Dashboard, etc.
- **Slide 22**: Dashboard Visualizations
  - Event Analysis, Alert Timelines, Evidence Snapshots, Custom KPIs
- **Slide 23**: Daily/Weekly Summary Reports
  - Automated reporting features

---

## Slide Order Summary

```
1. Cover Page (title)
2. Project Requirement Statement (content_bullets)
3. Scope of Work (two_column)
4. System Architecture (diagram)
5-7. System Requirements (content_bullets, can be merged)
8. Implementation Plan (timeline)
9-20+. Proposed Modules (module_description, 1 per module)
21-23. User Interface & Reporting (content_bullets)
```

**Total**: ~15-25 slides (depends on number of modules and content length)

---

## Content Formatting Rules

### Bullet Points
- **Level 0**: Main points (18pt font, bold)
- **Level 1**: Sub-points (16pt font)
- **Level 2**: Sub-sub-points (14pt font)

### Images
- **Diagram**: Full width, maintain aspect ratio
- **Module Images**: Right side of module description slides, downloaded from Google Drive URLs

---

## Notes for Implementation

1. **Slide numbering**: Start from 1 (not 0)
2. **Speaker notes**: Optional, can be added to each slide
3. **Branding**: Apply viAct colors, fonts (via master template)
4. **Consistency**: Ensure consistent formatting across slides
5. **Page breaks**: Split content if too long (multiple slides per section)
6. **Image handling**: Google Drive URLs are automatically downloaded and inserted during PowerPoint generation

---

## Example JSON Structure

```json
{
  "project_name": "STS Oman Proposal",
  "total_slides": 20,
  "slides": [
    {
      "slide_number": 1,
      "type": "title",
      "title": "Video Analytics Solution Proposal for STS Oman",
      "date": "05 2025"
    },
    {
      "slide_number": 2,
      "type": "content_bullets",
      "title": "Project Requirement Statement",
      "content": [
        {
          "level": 0,
          "text": "Project: AI-based video analytics to monitor unsafe working conditions"
        },
        {
          "level": 0,
          "text": "Project Owner: STS Oman"
        }
      ]
    },
    {
      "slide_number": 3,
      "type": "two_column",
      "title": "Scope of Work",
      "left_column": {
        "title": "viAct Responsibilities",
        "content": [
          "Software: license, maintenance, support",
          "Camera integration"
        ]
      },
      "right_column": {
        "title": "Client Responsibilities",
        "content": [
          "Hardware: Procurement, configuration, installation",
          "Network infrastructure"
        ]
      }
    },
    {
      "slide_number": 9,
      "type": "module_description",
      "title": "Safety Gloves Detection",
      "module_type": "Custom",
      "content": {
        "purpose": "Detects the presence of dedicated safety gloves...",
        "alert_logic": "AI will capture people not wearing...",
        "preconditions": "Camera must maintain a suitable distance...",
        "data_requirements": "Request: Provide gloves images..."
      },
      "image_path": "assets/module_0.png"
    }
  ]
}
```

---

## Testing Checklist

When testing slide-content-mapper, verify:

- [ ] All sections from TEMPLATE.md are mapped to slides
- [ ] Slide types are correct for content (no content_table)
- [ ] Slide numbering is continuous (1, 2, 3...)
- [ ] Content format is correct (bullet points only)
- [ ] Two-column slides have balanced content
- [ ] Diagram slides reference architecture diagram
- [ ] Module slides have images downloaded and inserted
- [ ] Timeline slides have no notes field
- [ ] System Requirements slides are merged if content is short
- [ ] JSON structure is valid and parseable

---

## References

- **TEMPLATE.md**: Proposal content structure
- **KB Proposals**: Real proposal slides analyzed
- **Architecture diagrams**: From architecture-generator skill
