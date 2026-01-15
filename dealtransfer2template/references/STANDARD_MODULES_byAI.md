# Standard AI Modules List

> **Source**: Extracted from KB (viAct_Proposal, REASON, DOCUMENT knowledge bases)
> **Purpose**: Reference list of standard AI modules that have been used in proposals. Search KB "DOCUMENT" or "viAct_Proposal" for existing slides when these modules are needed.

---

## Safety & Compliance Modules

### PPE Detection Modules
1. **Safety Helmet Detection** / **Helmet Detection**
   - Detects workers not wearing safety helmets
   - Real-time alerts for non-compliance
   - KB Reference: Multiple proposals (EGA, SOCAR, STS Oman, etc.)

2. **Safety Vest Detection** / **Hi-vis Vest Detection** / **Reflective Vest Detection**
   - Detects workers without high-visibility vests
   - Alert triggers when worker missing reflective vest
   - KB Reference: Multiple proposals

3. **Safety Gloves Detection**
   - Detects presence of safety gloves
   - Job-specific glove detection (e.g., dedicated gloves for lifting beams)
   - KB Reference: STS Oman, Conestoga Meats

4. **Safety Shoes Detection** / **Safety Boots Detection**
   - Detects workers without safety shoes/boots
   - Verifies proper footwear usage
   - KB Reference: SOCAR, STS Oman

5. **Safety Glasses Detection** / **Safety Goggles Detection**
   - Detects workers with/without safety glasses
   - Eye protection compliance
   - KB Reference: Multiple proposals

6. **Safety Arm Guards Detection** / **Arm Protection Detection**
   - Detects arm protection equipment
   - KB Reference: Glassjet

7. **Safety Respirator Detection**
   - Detects respiratory protection equipment
   - KB Reference: EGA

8. **Clean Uniform Detection**
   - Detects clean uniform compliance
   - KB Reference: EGA

9. **Apron Detection**
   - Detects apron wearing
   - KB Reference: Vertiv

10. **Mask Detection**
    - Detects face mask compliance
    - KB Reference: Vertiv

11. **Face Shield Detection**
    - Detects face shield protection
    - KB Reference: Vertiv

12. **Head Cover Detection**
    - Detects head covering compliance
    - KB Reference: Vertiv

13. **Earmuff Detection**
    - Detects hearing protection
    - KB Reference: Vertiv

14. **Safety Ear Plug Detection**
    - Detects ear plug usage
    - KB Reference: Vertiv

15. **Bump Cap Detection**
    - Detects bump cap wearing
    - KB Reference: Vertiv

### Restricted Area & Zone Monitoring
16. **Restricted Area Monitoring** / **Restricted Zone Monitoring**
    - Detects unauthorized entry into restricted areas
    - Alerts when employees enter restricted zones
    - KB Reference: Multiple proposals (Conestoga Meats, EDO, etc.)

17. **Red Zone Management** / **Red Zone Detection**
    - Detects breaches into danger/red zones
    - HSE compliance monitoring
    - KB Reference: EDO, EGA

18. **Danger Zone Intrusion Detection**
    - Detects intrusion into danger zones
    - KB Reference: STS Oman, EDO

19. **Unauthorized Access Detection**
    - Detects unauthorized personnel access
    - KB Reference: Multiple proposals

20. **Perimeter Intrusion Detection**
    - Detects unauthorized access to perimeter areas
    - KB Reference: Shell Oman, VDP Qatar

21. **After-hours Access Area Detection**
    - Detects access during non-operational hours
    - KB Reference: Shell Oman

### Safety Behavior Detection
22. **Anti-collision Detection** / **Worker-Machine Anti-Collision**
    - Detects proximity between workers and moving equipment (forklifts, jitneys)
    - Alerts when someone gets within safety distance (e.g., 30cm/1 foot)
    - KB Reference: Conestoga Meats, VDP Qatar, Shell Oman

23. **Human Down Detection**
    - Detects workers who have fallen or are lying down
    - Near-miss detection (slip and fall)
    - KB Reference: Conestoga Meats

24. **Unsafe Behavior Detection** / **Unsafe Act Detection**
    - General unsafe behavior detection
    - KB Reference: Multiple proposals

25. **Unsafe Driving Behaviour Detection**
    - Detects unsafe driving acts (e.g., not facing direction of travel)
    - KB Reference: Conestoga Meats

26. **Unsafe Knife Proximity Detection**
    - Detects knives getting close to other workers
    - KB Reference: Conestoga Meats

27. **Improper Lifting Detection**
    - Detects improper lifting techniques
    - KB Reference: Conestoga Meats

28. **Lift Assist Zone Compliance Detection**
    - Detects if workers are lifting in areas where they should use lift assist
    - KB Reference: Conestoga Meats

29. **Knife Handling Posture Detection**
    - Detects unsafe knife handling (e.g., raising arm above shoulder level)
    - KB Reference: Conestoga Meats

30. **Workers Under Suspended Load Detection**
    - Detects workers present under suspended loads
    - Audible alert when workers under suspended load
    - KB Reference: PDO

---

## Security & Access Control Modules

31. **Facial Recognition**
    - Employee/visitor identification
    - Access control integration
    - Database capacity: 1,000+ profiles
    - KB Reference: EDO, VDP Qatar, Glassjet, Shell Oman, Multiple proposals

32. **Intrusion Detection**
    - General intrusion detection in restricted areas
    - KB Reference: Multiple proposals

33. **Loitering Detection**
    - Detects prolonged presence in restricted areas
    - Customizable threshold (seconds-level)
    - KB Reference: VDP Qatar, Shell Oman

34. **Tailgating Detection**
    - Detects unauthorized following through access points
    - KB Reference: VDP Qatar

---

## Operations & Counting Modules

35. **People Counting**
    - Counts number of people in specific zones
    - Entry/exit counting
    - KB Reference: VDP Qatar, EDO, Superfine Industries, Multiple proposals

36. **Vehicle Counting**
    - Counts vehicles in/out
    - KB Reference: Multiple proposals

37. **Object/Package Counting**
    - Counts objects or packages
    - Raw material counting, finished product counting
    - KB Reference: Superfine Industries

38. **Worker Counting**
    - Counts workers in specific areas
    - Emergency muster point counting
    - KB Reference: Vertiv, EDO

39. **Roll Type Classification** / **Product Type Classification**
    - Differentiates between product types (e.g., 90kg vs 300kg rolls)
    - KB Reference: Superfine Industries

---

## Process & Operational Modules

40. **Queue Management** / **Queue Length Monitoring**
    - Monitors queue length and congestion
    - KB Reference: EDO, Shell Oman

41. **Entrance/Exit Congestion Detection**
    - Detects congestion at entry/exit points
    - KB Reference: Shell Oman

42. **Pump Occupancy Calculation**
    - Calculates pump occupancy status
    - KB Reference: Shell Oman (custom)

43. **Pump Idle Calculation**
    - Calculates idle pump status
    - KB Reference: Shell Oman (custom)

44. **Vehicle Direction Detection** / **Wrong Direction Detection**
    - Detects vehicles driving in wrong direction
    - One-way traffic monitoring
    - KB Reference: DPI, Glassjet

45. **Speed Limit Monitoring** / **Speeding Detection**
    - Detects vehicles exceeding speed limits (e.g., 5 km/h)
    - KB Reference: Shell Oman, Lavie

46. **Vehicle Proximity Alerts**
    - Alerts when vehicles are within proximity threshold (e.g., 3m)
    - KB Reference: Lavie

---

## Environmental & Hazard Detection Modules

47. **Spill Detection** / **Liquid Leakage Detection**
    - Detects liquid spills in monitored area
    - Alert triggers after threshold duration (e.g., 5 minutes)
    - KB Reference: Conestoga Meats, Shell Oman

48. **Debris Detection**
    - Detects debris on floors or in work areas
    - Remains for more than threshold time (e.g., 5 minutes)
    - KB Reference: Conestoga Meats

49. **Fire & Smoke Detection**
    - Video-based fire and smoke detection
    - Early warning system
    - KB Reference: Multiple proposals (Shell Oman, VDP Qatar, PDO, Glassjet)

50. **Illegal Dumping Detection** / **Unsafe Unloading Detection**
    - Detects improper dumping or unloading
    - KB Reference: EDO

---

## Specialized Detection Modules

51. **Smoking Detection**
    - Detects people smoking in restricted areas
    - KB Reference: Shell Oman, PDO

52. **Mobile Phone Usage Detection**
    - Detects workers using mobile phones during working hours
    - KB Reference: Shell Oman

53. **Parking Violation Detection** / **Wrong Parking Detection** / **Illegal Parking Detection**
    - Detects vehicles parked in wrong areas
    - Alert after threshold duration (e.g., >X seconds)
    - KB Reference: Shell Oman

54. **Number Plate Detection** / **License Plate Recognition** / **LPR**
    - Detects and recognizes vehicle license plates
    - KB Reference: Shell Oman, VDP Qatar

55. **Camera Health Monitoring** / **Camera Connection & Status Monitoring**
    - Tracks camera connectivity and video feed health
    - Alerts if cameras go offline or video is obstructed
    - KB Reference: VDP Qatar

56. **Tamper Detection**
    - Price totems tamper detection
    - Camera poles tamper detection
    - Electric panel tamper detection
    - KB Reference: Shell Oman

57. **Gate Opening Monitoring**
    - Monitors gate opening events
    - KB Reference: Shell Oman

58. **Gate Closing Monitoring**
    - Monitors gate closing events
    - KB Reference: Shell Oman

59. **Fuel Truck Arrival/Departure Monitoring**
    - Detects fuel truck arrival and departure
    - Timestamp logging
    - KB Reference: Shell Oman

60. **Fuel Truck Unloading with Person Presence Monitoring**
    - Monitors fuel truck unloading with personnel detection
    - KB Reference: Shell Oman

61. **Fuel Leak Visual Detection**
    - Visual detection of fuel leaks
    - KB Reference: Shell Oman

---

## Crowd & Traffic Management Modules

62. **Crowd Management** / **Crowd Density Detection** / **Over-Manning Detection**
    - Detects abnormal gatherings or congestion
    - Threshold: typically >= 5 persons
    - KB Reference: VDP Qatar, Shell Oman

63. **Heat Mapping** / **Heatmap** / **Movement Density Analysis**
    - Analyzes movement density and zone utilization
    - People movement tracking
    - KB Reference: VDP Qatar, EDO

---

## Additional Specialized Modules

64. **Access Control by PPE Color**
    - Monitoring based on colored vest requirements
    - KB Reference: PDO

65. **Worker Leaving Assigned Station Detection**
    - Detects workers leaving their assigned workstations
    - KB Reference: Vertiv

66. **Clean Uniform Detection**
    - Detects clean uniform compliance
    - KB Reference: EGA

67. **Safety Tube Cloth Detection**
    - Detects tube cloth protection
    - KB Reference: EGA

68. **Vehicle Collision Detection**
    - Detects collisions between vehicles
    - KB Reference: Shell Oman

---

## Module Categories Summary

### Safety & Compliance (PPE & Behavior)
- PPE Detection modules (Helmet, Vest, Gloves, Shoes, Glasses, etc.)
- Restricted Area Monitoring
- Unsafe Behavior Detection
- Anti-collision
- Human Down Detection

### Security
- Facial Recognition
- Intrusion Detection
- Loitering Detection
- Tailgating Detection
- Perimeter Intrusion

### Operations
- People/Vehicle/Object Counting
- Queue Management
- Process Monitoring
- Traffic Management

### Environmental
- Spill/Leakage Detection
- Debris Detection
- Fire & Smoke Detection

### Specialized
- Smoking Detection
- Mobile Phone Detection
- Parking Violations
- License Plate Recognition
- Camera Health Monitoring
- Tamper Detection

---

## Notes

1. **Standard vs Custom**: Most modules listed above are standard. Custom modules are typically:
   - Industry-specific variations (e.g., "Package counting IN by human" for Superfine Industries)
   - Specific workflow integrations
   - Unique detection criteria combinations

2. **KB Search**: When a module is needed, search KB "DOCUMENT" or "viAct_Proposal" for:
   - Existing module slides
   - Purpose descriptions
   - Alert trigger logic
   - Preconditions

3. **Module Combinations**: Some use cases require multiple modules working together (e.g., Facial Recognition + People Counting for emergency muster points)

4. **Module Variants**: Some modules have multiple names for similar functionality (e.g., "Safety Helmet Detection" vs "Helmet Detection" - same module)

