# Deal Transfer Field Names Reference

> **Purpose**: This document lists the EXACT field names used in Deal Transfer documents based on actual KB content.

## Commercial Sheet (S1) - Field Names

### Format: 
```
Key Information：[Field Name]; Answer：[Answer] ——Commercial
```

### Common Fields:

1. **"Customer overview (short introduction about customer business)"**
   - Contains: Company name, business description

2. **"Are they SI or End-customer?"**
   - Answer format: "End customer" / "SI" / etc.

3. **"If SI, provide overview of end-customer"**
   - Only relevant if answer to #2 is "SI"

4. **"Stakeholders from customer side. Specify decision-maker if possible"**
   - Contains: Names, titles, emails, LinkedIn profiles
   - **Note**: This is NOT included in proposal (internal only)

5. **"Current Pain Points of end customer"**
   - Contains: List of pain points (may have trailing space in some files)
   - Used to derive: Project Objectives

6. **"Is there a real project or just looking around?"**
   - Answer format: "Real project" / "Just looking" / etc.

7. **"If real project, expected timeline (including tender if any)"**
   - Contains: Timeline information

8. **"What is the customer's budget?"**
   - Answer format: Dollar amount or "Not shared yet"

9. **"Competitors (any info), especially offer price"**
   - Contains: Competitor information

10. **"What are the solutions that they are looking to implement?"**
    - Contains: Detailed solution requirements

11. **"If VA, do they already have camera installed? Do we need to handle HW implementation? How many camera they would like to run AI model?"**
    - Contains: Camera information (number, existing/new, locations)


12. **"If IoT, do they already have IoT device installed? Do we need to handle HW implementation? Provide name of the IoT devices"**
    - Contains: IoT device information

13. **"Shall we proceed (commercial)? (1–5 + reason)"**
    - Contains: Rating and reason

---

## Technical Sheet (S2) - Field Names

### Format:
```
Key Information：[Field Name]; Answer：[Answer] ——Technical
```

### Common Fields:

1. **"List of VA use cases"**
   - Contains: List of video analytics use cases
   - Used to derive: AI Modules list

2. **"How do they want to alert operators on-site?"**
   - Contains: Alert method preferences

3. **"Site plan & camera position"**
   - Contains: Site information
   - Answer may be: "To be provided" / "N/A" / etc.

4. **"Stable internet connection?"**
   - Answer format: "Yes" / "No" / "Yes (fiber network)" / "Unstable" / etc.


5. **"Can client camera provide RTSP link (e.g. is it IP-based camera?)"**
   - Answer format: "yes" / "Yes" / "no" / etc.

6. **"Stable power source?"**
   - Answer format: "yes" / "Yes" / "no" / etc.

7. **"Any IoT integration?"**
   - Contains: IoT integration requirements

8. **"Specific HW/SW requirements such as deployment method?"**
   - Contains: Deployment method (On-premise / Cloud / Hybrid)

9. **"Any GDPR / data privacy requirements?"**
   - Contains: Compliance requirements

10. **"Any customized AI use cases (description & videos)?"**
    - Contains: Custom use case descriptions

11. **"Any customized dashboard?"**
    - Contains: Custom dashboard requirements

12. **"Any customized HW / IoT?"**
    - Contains: Custom hardware/IoT requirements

13. **"Shall we proceed (technical)? (1–5 + reason)"**
    - Contains: Technical rating and reason

---

## Notes on Field Names:

1. **Field names are consistent** across Deal Transfer files but may have:
   - Trailing spaces (e.g., "Current Pain Points of end customer " vs "Current Pain Points of end customer")
   - Question marks at the end (e.g., "Stable internet connection?" vs "Stable internet connection")
   - Slight variations in punctuation

2. **Format pattern**:
   - Always starts with "Key Information："
   - Field name followed by "; Answer："
   - Answer followed by " ——Commercial" or " ——Technical"

3. **Some fields may be optional** and not appear in all Deal Transfer files

4. **Always check the exact field name** in the Deal Transfer file you're working with, as there may be minor variations

---

## Usage in Template:

When referencing fields in template_hihi.md, use the exact field names listed above in quotes, e.g.:
- S1 - "Customer overview (short introduction about customer business)"
- S2 - "Specific HW/SW requirements (deployment method)?"
- S2 - "Stable internet connection?"


