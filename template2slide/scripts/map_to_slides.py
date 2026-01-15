#!/usr/bin/env python3
"""
Map proposal template (markdown) to slide structure (JSON)
Converts TEMPLATE.md sections to slide-by-slide structure following SLIDE_TEMPLATE.md
"""

import sys
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional

# Try to use markdown parser for better accuracy, fallback to regex if not available
try:
    import markdown
    from markdown.extensions import codehilite, fenced_code
    HAS_MARKDOWN = True
except ImportError:
    HAS_MARKDOWN = False

# Pre-compile regex patterns for better performance
REGEX_PATTERNS = {
    # Section headers
    'section_header': re.compile(r'^##\s+(.+?)(?:\s*---)?\s*$', re.MULTILINE),
    'separator_line': re.compile(r'^---\s*\n?', re.MULTILINE),
    'leading_empty_lines': re.compile(r'^\s*\n+', re.MULTILINE),
    
    # Project name extraction
    'title_heading': re.compile(r'^#\s+(.+?)$', re.MULTILINE),
    'technical_proposal': re.compile(r'Technical\s+Proposal.*$', re.IGNORECASE),
    
    # Key-value pairs - unified pattern supporting both formats
    'table_row': re.compile(r'\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|'),
    'key_marker_colon_inside': re.compile(r'\*\*([^:]+?):\*\*\s*', re.MULTILINE),
    'key_marker_colon_outside': re.compile(r'\*\*([^:]+?)\*\*:\s*', re.MULTILINE),
    'source_reference': re.compile(r'\*\*Source[:\s]*.*$', re.IGNORECASE),
    'separator_in_value': re.compile(r'\n\s*---\s*(\n|$)', re.MULTILINE),
    'trailing_separator': re.compile(r'\n\s*---\s*$', re.MULTILINE),
    'numbered_list': re.compile(r'^\d+\.\s+', re.MULTILINE),
    'newlines': re.compile(r'\n+'),
    
    # Date extraction - unified pattern
    'date_pattern': re.compile(r'\*\*Date(?:\*\*[:\s]+|:\*\*\s*)(\d{4}-\d{2}-\d{2}|\w+\s+\d{4})', re.IGNORECASE),
    
    # Client name extraction - unified pattern
    'client_name_pattern1': re.compile(r'\*\*Project Owner:\*\*\s*(.+?)(?:\n|$)', re.IGNORECASE),
    'client_name_pattern2': re.compile(r'\*\*Project Owner\*\*[:\s]+(.+?)(?:\n|$)', re.IGNORECASE),
    'client_name_pattern3': re.compile(r'\*\*Client Name:\*\*\s*(.+?)(?:\n|$)', re.IGNORECASE),
    
    # Module extraction - unified patterns
    'module_header_hash': re.compile(r'^###\s+Module(?:\s+\d+)?\s*:\s*(.+?)$', re.IGNORECASE | re.MULTILINE),
    'module_header_bold': re.compile(r'\*\*Module\s+(?:\d+)?:\s*(.+?)\*\*', re.IGNORECASE),
    'module_header_plain': re.compile(r'(?:Module|Module Name)[:\s]+(.+?)(?:\n|$)', re.IGNORECASE | re.MULTILINE),
    'next_module_hash': re.compile(r'^###\s+Module(?:\s+\d+)?\s*:\s*', re.IGNORECASE | re.MULTILINE),
    'next_module_bold': re.compile(r'\*\*Module\s+(?:\d+)?:\s*', re.IGNORECASE),
    
    # Module fields - unified pattern
    'module_type': re.compile(r'\*\*Module Type(?::\*\*|\*\*:)\s*(.+?)(?:\n|$)', re.IGNORECASE),
    'field_marker': re.compile(r'(?:•\s*)?\*\*([^:]+?)(?::\*\*|\*\*:)\s*(.*)$', re.MULTILINE),
    
    # Timeline extraction - unified patterns
    'timeline_phase_pattern1': re.compile(r'\*\*Phase\s+(T\d+):\s*([^*\n]+?)\*\*', re.IGNORECASE | re.MULTILINE),
    'timeline_phase_pattern2': re.compile(r'\*\*Phase\s+(T\d+):\*\*\s*(.+?)(?=\*\*Phase|\*\*Total|---|\Z)', re.IGNORECASE | re.DOTALL),
    'timeline_phase_pattern3': re.compile(r'\*\*Phase\s+(T\d+)\*\*:\s*(.+?)(?=\n\*\*Phase|\n\*\*Total|\n---|\Z)', re.IGNORECASE | re.MULTILINE | re.DOTALL),
    'next_phase': re.compile(r'\*\*Phase\s+T\d+', re.IGNORECASE),
    'next_duration': re.compile(r'\*\*Total Duration', re.IGNORECASE),
    'next_separator': re.compile(r'\n\s*---\s*\n', re.IGNORECASE),
    'timeline_date_format1': re.compile(r'(T\d+)\s*=\s*T\d+\s*\+\s*(.+?)(?:\n|$|\)|,|\.)', re.IGNORECASE),
    'timeline_date_format2': re.compile(r'\(?\s*T\d+\s*\+\s*(.+?)\s*\)?', re.IGNORECASE),
    'timeline_duration': re.compile(r'(\d+\s*[-–]\s*\d+|\d+)\s*(weeks?|days?|months?)', re.IGNORECASE),
    
    # Mermaid diagram extraction
    'mermaid_code_block1': re.compile(r'```mermaid\s*\n(.*?)\n```', re.DOTALL),
    'mermaid_code_block2': re.compile(r'```mermaid\s*\n(.*?)```', re.DOTALL),
    
    # Placeholder validation
    'placeholder_pattern': re.compile(r'\[([A-Z_]+_\d+)\]'),
    
    # Bullet points
    'bullet_marker': re.compile(r'^\s*[-*•]\s*', re.MULTILINE),
    'nested_bullet_2': re.compile(r'^\s{2}[-*•]\s+', re.MULTILINE),
    'nested_bullet_4': re.compile(r'^\s{4}[-*•]\s+', re.MULTILINE),
    
    # Cleanup patterns
    'bold_markers': re.compile(r'\*\*'),
    'whitespace': re.compile(r'\s+'),
}


class ProposalParser:
    """Parse proposal markdown template"""
    
    def __init__(self, markdown_file: str):
        self.file_path = Path(markdown_file)
        self.content = self._read_file()
        self.sections = {}
        self._validate_no_placeholders()
        
    def _read_file(self) -> str:
        """Read markdown file"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading file: {e}")
            sys.exit(1)
    
    def _validate_no_placeholders(self) -> None:
        """Validate that template has no unresolved placeholders"""
        placeholders = REGEX_PATTERNS['placeholder_pattern'].findall(self.content)
        if placeholders:
            print("\n" + "="*80)
            print("❌ ERROR: Template contains unresolved placeholders!")
            print("="*80)
            print(f"Found {len(placeholders)} placeholder(s):")
            for placeholder in set(placeholders[:10]):  # Show first 10 unique
                print(f"   - [{placeholder}]")
            if len(placeholders) > 10:
                print(f"   ... and {len(placeholders) - 10} more")
            print("\n⚠️  Please update the template using checklist before proceeding.")
            print("   Template must be placeholder-free (no [NETWORK_001], [TIMELINE_001], etc.)")
            print("="*80 + "\n")
            raise ValueError(f"Template contains {len(placeholders)} unresolved placeholders. Please resolve them first.")
    
    def parse(self) -> Dict[str, Any]:
        """Parse proposal and extract sections"""
        # Extract project name
        project_name = self._extract_project_name()
        
        # Extract sections
        sections = self._extract_sections()
        
        return {
            "project_name": project_name,
            "sections": sections
        }
    
    def _extract_project_name(self) -> str:
        """Extract project name from proposal"""
        # Try to find from title or first heading
        match = REGEX_PATTERNS['title_heading'].search(self.content)
        if match:
            title = match.group(1).strip()
            # Remove "Technical Proposal" or similar
            title = REGEX_PATTERNS['technical_proposal'].sub('', title).strip()
            return title
        
        # Fallback to filename
        return self.file_path.stem
    
    def _extract_sections(self) -> Dict[str, str]:
        """Extract sections from markdown using improved parsing"""
        sections = {}
        
        # Use markdown parser if available for more accurate parsing
        if HAS_MARKDOWN:
            try:
                md = markdown.Markdown(extensions=['meta', 'fenced_code'])
                html = md.convert(self.content)
                # Fallback to regex for section extraction (markdown library doesn't preserve section structure easily)
            except:
                pass
        
        # Pattern to match section headers (## Section Name) - using pre-compiled pattern
        matches = list(REGEX_PATTERNS['section_header'].finditer(self.content))
        
        for i, match in enumerate(matches):
            section_name = match.group(1).strip()
            start_pos = match.end()
            
            # Find end position (next section or end of file)
            if i + 1 < len(matches):
                end_pos = matches[i + 1].start()
            else:
                end_pos = len(self.content)
            
            section_content = self.content[start_pos:end_pos].strip()
            # Remove leading separator lines (---) and empty lines - using pre-compiled patterns
            section_content = REGEX_PATTERNS['separator_line'].sub('', section_content)
            section_content = REGEX_PATTERNS['leading_empty_lines'].sub('', section_content)
            sections[section_name] = section_content
        
        return sections


class SlideMapper:
    """Map proposal sections to slide structure"""
    
    def __init__(self, proposal_data: Dict[str, Any], architecture_diagram_path: Optional[str] = None):
        self.proposal_data = proposal_data
        self.architecture_diagram_path = architecture_diagram_path
        self.slides = []
        self.slide_number = 1
        
    def map(self) -> Dict[str, Any]:
        """Map all sections to slides"""
        sections = self.proposal_data["sections"]
        project_name = self.proposal_data["project_name"]
        
        # Slide 1: Cover Page
        self._map_cover_page(sections)
        
        # Slide 2: Project Requirement Statement
        self._map_project_requirement(sections)
        
        # Slide 3-4: Scope of Work
        self._map_scope_of_work(sections)
        
        # Slide 5-6: System Architecture
        self._map_system_architecture(sections)
        
        # Slide 7-10: System Requirements
        self._map_system_requirements(sections)
        
        # Slide 11-12: Implementation Plan
        self._map_implementation_plan(sections)
        
        # Slide 13-20+: Proposed Modules
        self._map_proposed_modules(sections)
        
        # Slide 21-23: User Interface & Reporting
        self._map_user_interface(sections)
        
        # Extract client name from project requirement
        client_name = self._extract_client_name(sections)
        
        return {
            "project_name": project_name,
            "client_name": client_name,
            "total_slides": len(self.slides),
            "slides": self.slides
        }
    
    def _map_cover_page(self, sections: Dict[str, str]):
        """Map Cover Page section to title slide"""
        cover_page = sections.get("1. COVER PAGE", "")
        project_req = sections.get("2. PROJECT REQUIREMENT STATEMENT", "")
        
        # Extract title
        title = f"Video Analytics Solution Proposal for {self._extract_client_name(sections)}"
        
        # Extract date - using unified pre-compiled pattern
        date_match = REGEX_PATTERNS['date_pattern'].search(cover_page)
        if date_match:
            date = date_match.group(1)
        else:
            date = ""
            print("⚠️  Warning: Date not found in Cover Page section. Please verify.")
        
        self.slides.append({
            "slide_number": self.slide_number,
            "type": "title",
            "title": title,
            "date": date
        })
        self.slide_number += 1
    
    def _map_project_requirement(self, sections: Dict[str, str]):
        """Map Project Requirement Statement to content slide"""
        section_content = sections.get("2. PROJECT REQUIREMENT STATEMENT", "")
        
        # Extract fields from table or markdown
        fields = self._extract_key_value_pairs(section_content)
        
        # Convert to bullet points format (no table)
        # Special handling for AI Modules: list each module at level 0 (same level as Project, Project Owner)
        content = []
        for k, v in fields.items():
            if k.lower() in ["ai modules", "ai module"]:
                # Split value by numbered list (1. 2. 3.) or line breaks
                lines = v.split('\n')
                module_list = []
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    # Remove leading number and dot if present (e.g., "1. Helmet Detection" -> "Helmet Detection")
                    line = re.sub(r'^\d+\.\s*', '', line)
                    if line:
                        module_list.append(line)
                
                # List each module at level 0 (same level as Project, Project Owner)
                # Format as "AI Modules: Module1" for first, then just module names for rest
                for idx, module in enumerate(module_list):
                    if idx == 0:
                        content.append({"level": 0, "text": f"{k}: {module}"})
                    else:
                        content.append({"level": 0, "text": module})
            else:
                content.append({"level": 0, "text": f"{k}: {v}"})
        
        self.slides.append({
            "slide_number": self.slide_number,
            "type": "content_bullets",
            "title": "Project Requirement Statement",
            "content": content
        })
        self.slide_number += 1
    
    def _map_scope_of_work(self, sections: Dict[str, str]):
        """Map Scope of Work to two-column slide"""
        section_content = sections.get("3. SCOPE OF WORK", "")
        
        # Extract viAct and Client responsibilities
        viact_items = self._extract_bullet_points(section_content, "viAct")
        client_items = self._extract_bullet_points(section_content, "Client")
        
        self.slides.append({
            "slide_number": self.slide_number,
            "type": "two_column",
            "title": "Scope of Work",
            "left_column": {
                "title": "viAct Responsibilities",
                "content": viact_items
            },
            "right_column": {
                "title": "Client Responsibilities",
                "content": client_items
            }
        })
        self.slide_number += 1
    
    def _map_system_architecture(self, sections: Dict[str, str]):
        """Map System Architecture to diagram + description slides"""
        section_content = sections.get("4. SYSTEM ARCHITECTURE", "")
        
        # Check if architecture diagram file exists and read it
        diagram_code = None
        if self.architecture_diagram_path:
            diagram_code = self._read_architecture_diagram()
        
        # Create diagram slide from Mermaid code (not from template)
        self.slides.append({
            "slide_number": self.slide_number,
            "type": "diagram",
            "title": "Proposed System Architecture",
            "diagram": {
                "type": "mermaid",
                "code": diagram_code or "",
                "description": self._extract_architecture_description(section_content)
            }
        })
        self.slide_number += 1
        
        # Optional: Slide 2 - Detailed description (if needed)
        if self._has_detailed_description(section_content):
            self.slides.append({
                "slide_number": self.slide_number,
                "type": "content_bullets",
                "title": "System Architecture Description",
                "content": self._format_bullet_points(section_content)
            })
            self.slide_number += 1
    
    def _map_system_requirements(self, sections: Dict[str, str]):
        """Map System Requirements to slides with clear section separation"""
        section_content = sections.get("5. SYSTEM REQUIREMENTS", "")
        
        # Split into sub-sections
        subsections = self._extract_subsection(section_content)
        
        # Group related sections: Network, Camera, AI Training, AI Inference, Dashboard
        related_sections = {
            "Network": subsections.get("Network", ""),
            "Camera": subsections.get("Camera", ""),
            "AI Training": subsections.get("AI Training", ""),
            "AI Training Workstation": subsections.get("AI Training Workstation", ""),
            "AI Inference": subsections.get("AI Inference", ""),
            "AI Inference Workstation": subsections.get("AI Inference Workstation", ""),
            "Dashboard": subsections.get("Dashboard", ""),
            "Dashboard Workstation": subsections.get("Dashboard Workstation", "")
        }
        
        # Group Network and Camera together on one slide
        network_content = related_sections.get("Network", "")
        camera_content = related_sections.get("Camera", "")
        
        if network_content or camera_content:
            content = []
            if network_content:
                content.append({"level": 0, "text": "Network"})
                network_bullets = self._format_bullet_points(network_content)
                content.extend(network_bullets)
            if camera_content:
                content.append({"level": 0, "text": "Camera"})
                camera_bullets = self._format_bullet_points(camera_content)
                content.extend(camera_bullets)
            
            if content:
                self.slides.append({
                    "slide_number": self.slide_number,
                    "type": "content_bullets",
                    "title": "System Requirements",
                    "content": content
                })
                self.slide_number += 1
        
        # Group AI Training, AI Inference, Dashboard - group by complete sections, not cut mid-content
        # Strategy: Always group complete sections together
        # - If all fit in one slide (<= 15 items), put all in one slide
        # - If too long, split by complete sections: AI Training + AI Inference in first, Dashboard in second
        # - Never cut a section in the middle
        ai_training = related_sections.get("AI Training", "") or related_sections.get("AI Training Workstation", "")
        ai_inference = related_sections.get("AI Inference", "") or related_sections.get("AI Inference Workstation", "")
        dashboard = related_sections.get("Dashboard", "") or related_sections.get("Dashboard Workstation", "")
        
        if ai_training or ai_inference or dashboard:
            # Count total items for each complete section
            training_items = []
            inference_items = []
            dashboard_items = []
            
            if ai_training:
                training_bullets = self._format_bullet_points(ai_training)
                training_items = [{"level": 0, "text": "AI Training"}] + training_bullets
            if ai_inference:
                inference_bullets = self._format_bullet_points(ai_inference)
                inference_items = [{"level": 0, "text": "AI Inference"}] + inference_bullets
            if dashboard:
                dashboard_bullets = self._format_bullet_points(dashboard)
                dashboard_items = [{"level": 0, "text": "Dashboard"}] + dashboard_bullets
            
            total_items = len(training_items) + len(inference_items) + len(dashboard_items)
            
            # If total items <= 15, put all in one slide
            if total_items <= 15:
                content = training_items + inference_items + dashboard_items
                if content:
                    self.slides.append({
                        "slide_number": self.slide_number,
                        "type": "content_bullets",
                        "title": "System Requirements",
                        "content": content
                    })
                    self.slide_number += 1
            else:
                # Split by complete sections: AI Training + AI Inference in first, Dashboard in second
                # Slide 1: AI Training + AI Inference (complete sections, not cut)
                content1 = training_items + inference_items
                if content1:
                    self.slides.append({
                        "slide_number": self.slide_number,
                        "type": "content_bullets",
                        "title": "System Requirements",
                        "content": content1
                    })
                    self.slide_number += 1
                
                # Slide 2: Dashboard (complete section, if exists)
                if dashboard_items:
                    self.slides.append({
                        "slide_number": self.slide_number,
                        "type": "content_bullets",
                        "title": "System Requirements",
                        "content": dashboard_items
                    })
                    self.slide_number += 1
        
        # Process remaining subsections (not Network, Camera, AI Training, AI Inference, Dashboard)
        processed_names = ["Network", "Camera", "AI Training", "AI Training Workstation", 
                          "AI Inference", "AI Inference Workstation", "Dashboard", "Dashboard Workstation"]
        for subsection_name, subsection_content in subsections.items():
            if not subsection_content.strip() or subsection_name in processed_names:
                continue
            
            self.slides.append({
                "slide_number": self.slide_number,
                "type": "content_bullets",
                "title": f"System Requirements: {subsection_name}",
                "content": self._format_bullet_points(subsection_content)
            })
            self.slide_number += 1
    
    def _map_implementation_plan(self, sections: Dict[str, str]):
        """Map Implementation Plan to timeline slide"""
        section_content = sections.get("6. IMPLEMENTATION PLAN (TIMELINE)", "")
        
        # Extract milestones (without notes)
        milestones = self._extract_timeline_milestones(section_content)
        
        # Validate milestones - must have at least one milestone
        if not milestones:
            print("⚠️  Warning: No timeline milestones found in Implementation Plan section.")
            print("   Expected format: **Phase T0: Event Name** with date information")
            # Create empty timeline slide as fallback
            milestones = []
        
        # Remove notes from milestones (not used in timeline display)
        for milestone in milestones:
            if "notes" in milestone:
                del milestone["notes"]
        
        self.slides.append({
            "slide_number": self.slide_number,
            "type": "timeline",
            "title": "Implementation Plan",
            "timeline": {
                "format": "milestones",
                "milestones": milestones
            }
        })
        self.slide_number += 1
    
    def _map_proposed_modules(self, sections: Dict[str, str]):
        """Map Proposed Modules to module description slides"""
        section_content = sections.get("7. PROPOSED MODULES & FUNCTIONAL DESCRIPTION", "")
        
        # Extract modules
        modules = self._extract_modules(section_content)
        
        # Group modules by category
        grouped_modules = self._group_modules(modules)
        
        for category, module_list in grouped_modules.items():
            # One slide per module
            for module in module_list:
                module_name = module.get("name", "")
                if not module_name:
                    print(f"\n❌ ERROR: Module name not found for module at slide {self.slide_number}.")
                    print(f"   Cannot create slide without module name.")
                    print(f"   Please check the template and ensure module name is properly formatted.")
                    raise ValueError(f"Module name not found for module at slide {self.slide_number}")
                
                module_type = module.get("type", "")
                
                # Only create slide if we have a valid module name (not just "Type: Standard")
                if module_name and not module_name.startswith("Type:"):
                    # Validate required fields - NO DEFAULT VALUES
                    purpose = module.get("purpose", "").strip()
                    alert_logic = module.get("alert_logic", "").strip()
                    preconditions = module.get("preconditions", "").strip()
                    
                    missing_fields = []
                    if not purpose:
                        missing_fields.append("Purpose Description")
                    if not alert_logic:
                        missing_fields.append("Alert Trigger Logic")
                    if not preconditions:
                        missing_fields.append("Preconditions")
                    
                    if missing_fields:
                        print(f"\n❌ ERROR: Required fields not found for module '{module_name}' (slide {self.slide_number}):")
                        for field in missing_fields:
                            print(f"   - {field}")
                        print(f"   Please check the template and ensure all required module fields are present.")
                        raise ValueError(f"Required fields missing for module '{module_name}': {', '.join(missing_fields)}")
                    
                    # Image URL and Video URL are optional (can be empty)
                    image_url = module.get("image_url", "").strip()
                    video_url = module.get("video_url", "").strip()
                    
                    # Data Requirements is optional (can be empty)
                    data_requirements = module.get("data_requirements", "").strip()
                    
                    self.slides.append({
                        "slide_number": self.slide_number,
                        "type": "module_description",
                        "title": module_name,
                        "module_type": module_type,
                        "content": {
                            "purpose": purpose,
                            "alert_logic": alert_logic,
                            "preconditions": preconditions,
                            "data_requirements": data_requirements  # Optional field
                        },
                        # Store image_url and video_url separately for download processing (not in content)
                        # Always include both fields (empty string if not provided)
                        "_image_url": image_url,
                        "_video_url": video_url
                    })
                    self.slide_number += 1
                elif not module_type:
                    print(f"⚠️  Warning: Module type not found for '{module_name}'. Skipping module type slide.")
    
    def _map_user_interface(self, sections: Dict[str, str]):
        """Map User Interface & Reporting to content slides"""
        section_content = sections.get("8. USER INTERFACE & REPORTING", "")
        
        # Split into sub-sections
        subsections = self._extract_subsection(section_content)
        
        for subsection_name, subsection_content in subsections.items():
            if not subsection_content.strip():
                continue
            
            self.slides.append({
                "slide_number": self.slide_number,
                "type": "content_bullets",
                "title": subsection_name,
                "content": self._format_bullet_points(subsection_content)
            })
            self.slide_number += 1
    
    # Helper methods
    
    def _extract_client_name(self, sections: Dict[str, str]) -> str:
        """Extract client name from Project Requirement Statement"""
        project_req = sections.get("2. PROJECT REQUIREMENT STATEMENT", "")
        # Try patterns in order using pre-compiled patterns
        for pattern_name in ['client_name_pattern1', 'client_name_pattern2', 'client_name_pattern3']:
            match = REGEX_PATTERNS[pattern_name].search(project_req)
            if match:
                return match.group(1).strip()
        print("\n❌ ERROR: Client Name (Project Owner) not found in template.")
        print("   Expected format: **Project Owner:** Value or **Client Name:** Value")
        print("   Please check the template and ensure client name is present.")
        raise ValueError("Client Name (Project Owner) not found in template")
    
    def _extract_work_scope(self, content: str) -> str:
        """Extract work scope one-liner"""
        match = re.search(r'\*\*Work Scope\*\*[:\s]+(.+?)(?:\n\n|\n\*\*|$)', content, re.IGNORECASE | re.DOTALL)
        if match:
            scope = match.group(1).strip()
            # Take first sentence or first 100 chars
            scope = scope.split('.')[0] if '.' in scope else scope[:100]
            return scope
        # Work scope is optional, so we can return empty string but log a warning
        print("⚠️  Warning: Work Scope not found. This field is optional.")
        return ""
    
    def _extract_key_value_pairs(self, content: str) -> Dict[str, str]:
        """Extract key-value pairs from markdown table or **Key:** Value format"""
        pairs = {}
        
        # Method 1: Try table format first (| **Key** | Value |) - using pre-compiled pattern
        for match in REGEX_PATTERNS['table_row'].finditer(content):
            key = match.group(1).strip()
            value = match.group(2).strip()
            # Clean value (remove markdown, source references) - using pre-compiled patterns
            value = REGEX_PATTERNS['source_reference'].sub('', value).strip()
            value = REGEX_PATTERNS['bold_markers'].sub('', value).strip()
            pairs[key] = value
        
        # Method 2: Try **Key:** Value format (if table format didn't find anything)
        if not pairs:
            # Try both patterns and use whichever finds matches
            key_markers1 = list(REGEX_PATTERNS['key_marker_colon_inside'].finditer(content))
            key_markers2 = list(REGEX_PATTERNS['key_marker_colon_outside'].finditer(content)) if not key_markers1 else []
            key_markers = key_markers1 if key_markers1 else key_markers2
            
            for i, marker in enumerate(key_markers):
                key = marker.group(1).strip()
                start_pos = marker.end()
                
                # Find end position: next key marker or separator
                if i + 1 < len(key_markers):
                    end_pos = key_markers[i + 1].start()
                else:
                    end_pos = len(content)
                
                # Extract value, but stop at separator (---) if found
                value_section = content[start_pos:end_pos]
                separator_match = REGEX_PATTERNS['separator_in_value'].search(value_section)
                if separator_match:
                    value_section = value_section[:separator_match.start()]
                
                value = value_section.strip()
                
                # Remove any trailing separators - using pre-compiled pattern
                value = REGEX_PATTERNS['trailing_separator'].sub('', value).strip()
                
                # Special handling for list values (like AI Modules)
                # If value starts with numbered list (1. 2. 3.), keep line breaks
                if REGEX_PATTERNS['numbered_list'].match(value):
                    # Keep as multiline, just clean up extra whitespace
                    lines = [line.strip() for line in value.split('\n') if line.strip()]
                    value = '\n'.join(lines)
                else:
                    # For non-list values, replace newlines with space - using pre-compiled pattern
                    value = REGEX_PATTERNS['newlines'].sub(' ', value).strip()
                
                # Clean value - remove trailing source references - using pre-compiled patterns
                value = REGEX_PATTERNS['source_reference'].sub('', value).strip()
                value = REGEX_PATTERNS['bold_markers'].sub('', value).strip()
                
                if value:
                    pairs[key] = value
        
        return pairs
    
    def _extract_bullet_points(self, content: str, keyword: str) -> List[str]:
        """
        Extract bullet points containing keyword from Scope of Work section.
        
        Supports multiple formats:
        1. ### viAct Responsibilities: / ### Client Responsibilities:
        2. **viAct Responsibilities:** / **Client Responsibilities:**
        3. viAct Responsibilities: (plain text header)
        """
        items = []
        lines = content.split('\n')
        in_section = False
        
        # Normalize keyword for matching (case-insensitive, handle variations)
        keyword_lower = keyword.lower()
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            line_lower = line.lower()
            
            # Check if this line is a header with the keyword
            # Format 1: ### viAct Responsibilities: or ### Client Responsibilities:
            # Format 2: **viAct Responsibilities:** or **Client Responsibilities:**
            # Format 3: viAct Responsibilities: (plain text)
            is_header = False
            if keyword_lower in line_lower:
                if (line_stripped.startswith('###') or 
                    line_stripped.startswith('**') or
                    (':' in line_stripped and not line_stripped.startswith('-'))):
                    is_header = True
            
            if is_header:
                in_section = True
                # Skip the header line itself, continue to next line
                continue
            elif in_section:
                # Check if we hit another section header (starts with ### or **)
                if (line_stripped.startswith('###') or 
                    (line_stripped.startswith('**') and ':' in line_stripped and 
                     keyword_lower not in line_lower)):
                    break
                
                # Skip separator lines (---)
                if line_stripped.startswith('---'):
                    continue
                
                # Check if this is a bullet point (supports -, *, •)
                if (line_stripped.startswith('-') or 
                    line_stripped.startswith('*') or 
                    line_stripped.startswith('•')):
                    # Remove bullet marker - using pre-compiled pattern
                    item = REGEX_PATTERNS['bullet_marker'].sub('', line)
                    # Remove markdown bold markers - using pre-compiled pattern
                    item = REGEX_PATTERNS['bold_markers'].sub('', item).strip()
                    # Skip if item is just dashes, empty, or separator
                    if item and not re.match(r'^-+$', item) and item != '---':
                        items.append(item)
                # If we hit an empty line after collecting items, continue
                # (might be spacing between items)
                elif line_stripped == '':
                    continue
        
        return items
    
    def _extract_subsection(self, content: str) -> Dict[str, str]:
        """Extract sub-sections (### Subsection Name)"""
        subsections = {}
        # Using a simple pattern for subsection headers
        pattern = re.compile(r'^###\s+(.+?)$', re.MULTILINE)
        matches = list(pattern.finditer(content))
        
        for i, match in enumerate(matches):
            subsection_name = match.group(1).strip()
            start_pos = match.end()
            end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(content)
            subsection_content = content[start_pos:end_pos].strip()
            subsections[subsection_name] = subsection_content
        
        return subsections
    
    def _format_bullet_points(self, content: str) -> List[Dict[str, Any]]:
        """Format content as bullet points with levels"""
        bullets = []
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line or line.startswith('|'):
                continue
            
            # Determine level - using pre-compiled patterns
            level = 0
            if REGEX_PATTERNS['bullet_marker'].match(line):
                level = 0
                line = REGEX_PATTERNS['bullet_marker'].sub('', line)
            elif REGEX_PATTERNS['nested_bullet_2'].match(line):
                level = 1
                line = REGEX_PATTERNS['nested_bullet_2'].sub('', line)
            elif REGEX_PATTERNS['nested_bullet_4'].match(line):
                level = 2
                line = REGEX_PATTERNS['nested_bullet_4'].sub('', line)
            
            # Clean markdown - using pre-compiled patterns
            line = REGEX_PATTERNS['bold_markers'].sub('', line)
            line = REGEX_PATTERNS['source_reference'].sub('', line).strip()
            
            if line:
                bullets.append({
                    "level": level,
                    "text": line
                })
        
        return bullets
    
    def _extract_timeline_milestones(self, content: str) -> List[Dict[str, Any]]:
        """Extract timeline milestones with date format: T1 = T0 + x weeks"""
        milestones = []
        
        # Try patterns in order using pre-compiled patterns
        matches1 = list(REGEX_PATTERNS['timeline_phase_pattern1'].finditer(content))
        if not matches1:
            matches1 = list(REGEX_PATTERNS['timeline_phase_pattern2'].finditer(content))
        if not matches1:
            matches1 = list(REGEX_PATTERNS['timeline_phase_pattern3'].finditer(content))
        
        for match in matches1:
            phase = match.group(1).strip()
            event_name = match.group(2).strip()
            
            # Clean event_name - extract just the phase name (e.g., "Hardware Deployment")
            # The event_name might contain the full text including "- Duration:" line
            # Extract only the first line (phase name)
            phase_name = event_name.split('\n')[0].strip()
            phase_name = re.sub(r'^[-*•]\s*', '', phase_name).strip()
            
            # Find the section content after this phase header
            start_pos = match.end()
            # Look for next phase (with **Phase) or end of section - using pre-compiled patterns
            next_phase = REGEX_PATTERNS['next_phase'].search(content[start_pos:])
            next_duration = REGEX_PATTERNS['next_duration'].search(content[start_pos:])
            next_separator = REGEX_PATTERNS['next_separator'].search(content[start_pos:])
            
            end_pos = len(content)
            if next_phase:
                end_pos = start_pos + next_phase.start()
            elif next_duration:
                end_pos = start_pos + next_duration.start()
            elif next_separator:
                end_pos = start_pos + next_separator.start()
            
            phase_content = content[start_pos:end_pos]
            
            # Extract duration - search in both event_name and phase_content
            # The duration might be in event_name (if pattern captured it) or in phase_content
            date = ""
            # Pattern: "- Duration:" or "Duration:" followed by duration (e.g., "T0 + 1-2 weeks")
            # Search in event_name first (it might contain the duration line)
            duration_match = re.search(r'[-*•]?\s*Duration:\s*([^\n]+)', event_name, re.IGNORECASE)
            if not duration_match:
                # If not in event_name, search in phase_content
                duration_match = re.search(r'[-*•]?\s*Duration:\s*([^\n]+)', phase_content, re.IGNORECASE)
            
            if duration_match:
                duration_text = duration_match.group(1).strip()
                # Remove trailing punctuation and clean up
                duration_text = re.sub(r'[.,;]$', '', duration_text).strip()
                date = duration_text
            elif phase == "T0":
                date = "T0"
            
            # Store phase_name as the phase name to display, and date as duration
            milestones.append({
                "phase": phase_name,  # Phase name (e.g., "Software Deployment")
                "event": phase_name,  # Keep for compatibility
                "date": date,  # Duration (e.g., "T1 + 4-6 weeks")
                "notes": []
            })
        
        return milestones
    
    def _extract_modules(self, content: str) -> List[Dict[str, Any]]:
        """
        Extract module information from PROPOSED MODULES section.
        
        Supports multiple formats:
        1. #### Module 1: Safety Helmet Detection (markdown header)
        2. **Module 1: Safety Helmet Detection** (with number)
        3. **Module: Safety Helmet Detection** (without number)
        4. Module: Safety Helmet Detection (plain text)
        5. Module Name: Safety Helmet Detection
        
        Field formats supported:
        - **Field:** Value (markdown bold)
        - Field: Value (plain text)
        - • Field: Value (bullet with bullet point)
        """
        modules = []
        
        # Pattern 1: ### Module [number]: [Name] (markdown header format - 3 hashes)
        # Using pre-compiled pattern
        matches1 = list(REGEX_PATTERNS['module_header_hash'].finditer(content))
        
        for match in matches1:
            module_name = match.group(1).strip()
            # Extract module details from the section following this module name
            start_pos = match.end()
            # Find the end of this module's section (next module or end of content) - using pre-compiled pattern
            next_module = REGEX_PATTERNS['next_module_hash'].search(content[start_pos:])
            end_pos = start_pos + next_module.start() if next_module else len(content)
            module_content = content[start_pos:end_pos]
            
            # Extract module fields
            module_data = self._extract_module_fields(module_content)
            modules.append({
                "name": module_name,
                "type": module_data["type"],
                "purpose": module_data["purpose"],
                "alert_logic": module_data["alert_logic"],
                "preconditions": module_data["preconditions"],
                "detection_criteria": module_data["detection_criteria"],
                "data_requirements": module_data["data_requirements"],
                "image_url": module_data["image_url"],
                "video_url": module_data["video_url"]
            })
        
        # Pattern 2: **Module [number]: [Name]** (e.g., **Module 1: Safety Helmet Detection**)
        # Fallback pattern for bold format - using pre-compiled pattern
        if not modules:
            matches2 = list(REGEX_PATTERNS['module_header_bold'].finditer(content))
            
            for match in matches2:
                module_name = match.group(1).strip()
                # Extract module details from the section following this module name
                start_pos = match.end()
                # Find the end of this module's section (next module or end of content) - using pre-compiled pattern
                next_module = REGEX_PATTERNS['next_module_bold'].search(content[start_pos:])
                end_pos = start_pos + next_module.start() if next_module else len(content)
                module_content = content[start_pos:end_pos]
                
                # Extract module fields
                module_data = self._extract_module_fields(module_content)
                modules.append({
                    "name": module_name,
                    "type": module_data["type"],
                    "purpose": module_data["purpose"],
                    "alert_logic": module_data["alert_logic"],
                    "preconditions": module_data["preconditions"],
                    "detection_criteria": module_data["detection_criteria"],
                    "data_requirements": module_data["data_requirements"],
                    "image_url": module_data["image_url"],
                    "video_url": module_data["video_url"]
                })
        
        # Pattern 3: Module: [Name] or Module Name: [Name] (fallback for other formats)
        if not modules:
            # Try pattern without ** markers - using pre-compiled pattern
            matches2 = REGEX_PATTERNS['module_header_plain'].finditer(content)
            for match in matches2:
                module_name = match.group(1).strip()
                # Remove markdown if present - using pre-compiled pattern
                module_name = REGEX_PATTERNS['bold_markers'].sub('', module_name).strip()
                if module_name:
                    modules.append({
                        "name": module_name,
                        "type": "",  # Changed: no default, must be extracted
                        "purpose": "",
                        "alert_logic": "",
                        "preconditions": "",
                        "detection_criteria": "",
                        "data_requirements": "",
                        "image_url": "",
                        "video_url": ""
                    })
        
        return modules
    
    def _extract_module_fields(self, module_content: str) -> Dict[str, str]:
        """Extract module fields from module content section"""
        module_type = ""
        purpose = ""
        alert_logic = ""
        preconditions = ""
        detection_criteria = ""
        data_requirements = ""
        image_url = ""
        video_url = ""
        
        # First, extract Module Type (can be on separate line without bullet)
        # Using pre-compiled pattern
        module_type_match = REGEX_PATTERNS['module_type'].search(module_content)
        if module_type_match:
            module_type = module_type_match.group(1).strip()
        
        # Use line-by-line parsing to handle empty values correctly
        lines = module_content.split('\n')
        current_field = None
        current_value = []
        
        for line in lines:
            line_stripped = line.strip()
            
            # Check if this line starts a new field - using pre-compiled pattern
            field_match = REGEX_PATTERNS['field_marker'].match(line_stripped)
            if field_match:
                # Save previous field if exists
                if current_field:
                    field_name = current_field
                    field_value = '\n'.join(current_value).strip()
                    # Clean up the value - using pre-compiled patterns
                    field_value = REGEX_PATTERNS['whitespace'].sub(' ', field_value).strip()
                    field_value = REGEX_PATTERNS['bold_markers'].sub('', field_value).strip()
                    # Remove trailing separators
                    field_value = REGEX_PATTERNS['trailing_separator'].sub('', field_value).strip()
                    # Process this field
                    field_lower = field_name.lower()
                    if 'purpose description' in field_lower or ('purpose' in field_lower and 'description' in field_lower):
                        purpose = field_value
                    elif 'alert trigger logic' in field_lower or 'alert logic' in field_lower:
                        alert_logic = field_value
                    elif 'preconditions' in field_lower:
                        preconditions = field_value
                    elif 'detection criteria' in field_lower:
                        detection_criteria = field_value
                    elif 'image url' in field_lower:
                        if field_value and 'http' in field_value.lower():
                            image_url = field_value
                        else:
                            image_url = ""
                    elif 'video url' in field_lower:
                        if field_value and 'http' in field_value.lower():
                            video_url = field_value
                        else:
                            video_url = ""
                    elif 'data requirements' in field_lower or 'client data requirements' in field_lower:
                        data_requirements = field_value
                
                # Start new field
                current_field = field_match.group(1).strip()
                initial_value = field_match.group(2).strip()
                current_value = [initial_value] if initial_value else []
            else:
                # Continue current field value (skip empty lines only if we have a field)
                if current_field:
                    if line_stripped:
                        current_value.append(line_stripped)
        
        # Process last field
        if current_field:
            field_name = current_field
            field_value = '\n'.join(current_value).strip()
            field_value = REGEX_PATTERNS['whitespace'].sub(' ', field_value).strip()
            field_value = REGEX_PATTERNS['bold_markers'].sub('', field_value).strip()
            # Remove trailing separators
            field_value = REGEX_PATTERNS['trailing_separator'].sub('', field_value).strip()
            # Process this field
            field_lower = field_name.lower()
            if 'purpose description' in field_lower or ('purpose' in field_lower and 'description' in field_lower):
                purpose = field_value
            elif 'alert trigger logic' in field_lower or 'alert logic' in field_lower:
                alert_logic = field_value
            elif 'preconditions' in field_lower:
                preconditions = field_value
            elif 'detection criteria' in field_lower:
                detection_criteria = field_value
            elif 'image url' in field_lower:
                if field_value and 'http' in field_value.lower():
                    image_url = field_value
                else:
                    image_url = ""
            elif 'video url' in field_lower:
                if field_value and 'http' in field_value.lower():
                    video_url = field_value
                else:
                    video_url = ""
            elif 'data requirements' in field_lower or 'client data requirements' in field_lower:
                data_requirements = field_value
        
        return {
            "type": module_type,
            "purpose": purpose,
            "alert_logic": alert_logic,
            "preconditions": preconditions,
            "detection_criteria": detection_criteria,
            "data_requirements": data_requirements,
            "image_url": image_url,
            "video_url": video_url
        }
    
    def _extract_field_value(self, line: str) -> str:
        """
        Extract field value from a line in various formats:
        - **Field:** Value
        - Field: Value
        - - **Field:** Value
        - • Field: Value
        """
        # Remove leading bullet markers
        line = re.sub(r'^[-*•]\s*', '', line.strip())
        
        # Try to extract value after :** or :
        # Pattern 1: **Field:** Value
        match = re.search(r':\*\*\s*(.+)$', line)
        if match:
            return match.group(1).strip()
        
        # Pattern 2: Field: Value
        match = re.search(r':\s*(.+)$', line)
        if match:
            value = match.group(1).strip()
            # Remove remaining markdown
            value = re.sub(r'\*\*', '', value).strip()
            return value
        
        return ""
    
    def _group_modules(self, modules: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Group modules by category"""
        groups = {
            "PPE Detection": [],
            "Safety": [],
            "Operations": [],
            "Other": []
        }
        
        for module in modules:
            name = module.get("name", "").lower()
            if any(keyword in name for keyword in ["helmet", "vest", "glove", "boot", "ppe"]):
                groups["PPE Detection"].append(module)
            elif any(keyword in name for keyword in ["safety", "unsafe", "danger"]):
                groups["Safety"].append(module)
            elif any(keyword in name for keyword in ["count", "queue", "process"]):
                groups["Operations"].append(module)
            else:
                groups["Other"].append(module)
        
        # Remove empty groups
        return {k: v for k, v in groups.items() if v}
    
    def _is_table_format(self, content: str) -> bool:
        """Check if content is in table format"""
        return '|' in content and content.count('|') > 3
    
    def _extract_table_rows(self, content: str) -> List[List[str]]:
        """Extract rows from markdown table"""
        rows = []
        lines = content.split('\n')
        
        for line in lines:
            if '|' in line and not line.strip().startswith('|---'):
                cells = [cell.strip() for cell in line.split('|')[1:-1]]  # Skip first and last empty
                if len(cells) >= 2:
                    rows.append(cells[:2])  # Take first two columns
        
        return rows
    
    def _read_architecture_diagram(self) -> Optional[str]:
        """Read architecture diagram Mermaid code"""
        if not self.architecture_diagram_path:
            return None
        
        diagram_path = Path(self.architecture_diagram_path)
        
        # Resolve relative path to absolute
        if not diagram_path.is_absolute():
            diagram_path = diagram_path.resolve()
        
        try:
            if not diagram_path.exists():
                print(f"⚠️  Warning: Architecture diagram file not found: {diagram_path}")
                return None
            
            with open(diagram_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract mermaid code block - try multiple patterns using pre-compiled patterns
            match = REGEX_PATTERNS['mermaid_code_block1'].search(content)
            if not match:
                match = REGEX_PATTERNS['mermaid_code_block2'].search(content)
            
            if match:
                code = match.group(1).strip()
                if code:
                    print(f"✅ Extracted mermaid diagram code ({len(code)} chars)")
                    return code
            
            print(f"⚠️  Warning: No mermaid code block found in {diagram_path}")
            return None
            
        except Exception as e:
            print(f"⚠️  Warning: Error reading architecture diagram: {e}")
            return None
    
    def _extract_architecture_description(self, content: str) -> str:
        """Extract architecture description"""
        # Extract first paragraph after section header
        lines = content.split('\n')
        description = []
        in_description = False
        
        for line in lines:
            if line.strip().startswith('###'):
                in_description = True
                continue
            if in_description and line.strip() and not line.strip().startswith('|'):
                description.append(line.strip())
                if len(description) > 3:  # Limit to first few lines
                    break
        
        return ' '.join(description)
    
    def _has_detailed_description(self, content: str) -> bool:
        """Check if architecture section has detailed description"""
        # Check for subsection headers or detailed content
        return bool(re.search(r'###\s+.*(?:Description|Data Flow|Components)', content, re.IGNORECASE))


def map_proposal_to_slides(proposal_file: str, architecture_diagram: Optional[str] = None, output_dir: Optional[str] = None) -> Dict[str, str]:
    """
    Main function to map proposal template to slide structure
    
    Args:
        proposal_file: Path to proposal markdown template
        architecture_diagram: Optional path to architecture diagram markdown
        output_dir: Output directory (default: same as proposal file)
    
    Returns:
        Dict with output file paths
    """
    proposal_file = Path(proposal_file)
    
    if not proposal_file.exists():
        print(f"Error: Proposal file not found: {proposal_file}")
        return {}
    
    print(f"📄 Parsing proposal: {proposal_file.name}")
    
    # Parse proposal
    parser = ProposalParser(str(proposal_file))
    proposal_data = parser.parse()
    
    print(f"✅ Extracted {len(proposal_data['sections'])} sections")
    
    # Map to slides
    print("🗺️  Mapping to slide structure...")
    mapper = SlideMapper(proposal_data, architecture_diagram)
    slide_structure = mapper.map()
    
    # Generate output
    if output_dir is None:
        output_dir = proposal_file.parent
    else:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save JSON
    json_file = output_dir / f"{proposal_file.stem}_slide_structure.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(slide_structure, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved slide structure to: {json_file}")
    
    # Save human-readable summary (optional)
    md_file = output_dir / f"{proposal_file.stem}_slide_content.md"
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write(f"# Slide Content Summary: {slide_structure['project_name']}\n\n")
        f.write(f"**Client:** {slide_structure['client_name']}\n")
        f.write(f"**Total Slides:** {slide_structure['total_slides']}\n\n")
        f.write("---\n\n")
        
        for slide in slide_structure['slides']:
            f.write(f"## Slide {slide['slide_number']}: {slide.get('title', 'Untitled')}\n\n")
            f.write(f"**Type:** {slide['type']}\n\n")
            # Add content preview
            if 'table' in slide:
                f.write("**Content:** Table format\n\n")
            elif 'content' in slide:
                f.write(f"**Content:** {len(slide['content'])} bullet points\n\n")
            f.write("---\n\n")
    
    print(f"✅ Saved slide summary to: {md_file}")
    
    print(f"\n📊 Summary:")
    print(f"   Project: {slide_structure['project_name']}")
    print(f"   Client: {slide_structure['client_name']}")
    print(f"   Total Slides: {slide_structure['total_slides']}")
    print(f"\n📁 Output files:")
    print(f"   - JSON: {json_file}")
    print(f"   - Summary: {md_file}")
    
    return {
        "json_file": str(json_file),
        "summary_file": str(md_file),
        "slide_structure": slide_structure
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python map_to_slides.py <proposal_template.md> [architecture_diagram.md] [output_dir]")
        sys.exit(1)
    
    proposal_file = sys.argv[1]
    architecture_diagram = sys.argv[2] if len(sys.argv) > 2 else None
    output_dir = sys.argv[3] if len(sys.argv) > 3 else None
    
    map_proposal_to_slides(proposal_file, architecture_diagram, output_dir)


