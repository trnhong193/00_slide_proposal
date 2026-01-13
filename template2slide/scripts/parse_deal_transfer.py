#!/usr/bin/env python3
"""
Parse Deal Transfer file (Excel or structured text) and extract architecture information
Determines deployment method based on logic from deployment_method_selection_logic.md
"""

import re
import json
import sys
from pathlib import Path


class DealTransferParser:
    """Parse Deal Transfer file and extract architecture information, determine deployment method"""
    
    def __init__(self, deal_transfer_file):
        self.file_path = Path(deal_transfer_file)
        self.content = self._read_file()
        self.project_info = {}
        
    def _read_file(self):
        """Read file content (supports .txt, .md, .xlsx via text extraction)"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading file: {e}")
            sys.exit(1)
    
    def extract_project_name(self):
        """Extract project name"""
        patterns = [
            r'Project[:\s]+(.+?)(?:\n|$)',
            r'Project Name[:\s]+(.+?)(?:\n|$)',
            r'Client[:\s]+(.+?)(?:\n|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, self.content, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return self.file_path.stem
    
    def extract_client_name(self):
        """Extract client name"""
        patterns = [
            r'Client Name[:\s]+(.+?)(?:\n|$)',
            r'Customer[:\s]+(.+?)(?:\n|$)',
            r'Project Owner[:\s]+(.+?)(?:\n|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, self.content, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return "Client"
    
    def extract_camera_number(self):
        """Extract number of cameras"""
        patterns = [
            r'Camera.*?(\d+)\s*cameras?',
            r'(\d+)\s*cameras?',
            r'Number of cameras[:\s]+(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, self.content, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return None
    
    def extract_ai_modules(self):
        """Extract list of AI modules/use cases"""
        modules = []
        
        # First, try to find "List of VA use cases:" followed by numbered list directly in content
        # This handles the case where the list is right after the header
        # Match until we hit a blank line followed by a non-numbered line or a section header
        pattern = r'List of VA use cases[:\?]\s*\n((?:\d+\.\s*.+?\n)+)'
        match = re.search(pattern, self.content, re.IGNORECASE | re.MULTILINE)
        if match:
            section_text = match.group(1)
            # Extract all numbered items - match lines that start with number and dot
            pattern2 = r'^\d+\.\s*(.+?)$'
            matches = re.findall(pattern2, section_text, re.MULTILINE)
            if matches:
                for m in matches:
                    module_name = m.strip()
                    # Filter out non-module items
                    if (len(module_name) < 200 and 
                        len(module_name) > 3 and  # At least 3 characters
                        not module_name.startswith('Answer:') and
                        not any(skip in module_name.lower() for skip in ['camera', 'deployment', 'internet', 'gdpr', 'number'])):
                        modules.append(module_name)
        
        # If still no modules, try using _extract_section
        if not modules:
            section = self._extract_section("List of VA use cases")
            if not section:
                # Try "AI Modules" or "AI use cases"
                section = self._extract_section("AI Modules") or self._extract_section("AI use cases")
            
            if section:
                # Remove "Answer:" prefix if present
                section = re.sub(r'^Answer:\s*', '', section, flags=re.IGNORECASE)
                
                # Extract numbered items
                pattern = r'^\d+\.\s*(.+?)(?:\n|$)'
                matches = re.findall(pattern, section, re.MULTILINE)
                if matches:
                    for m in matches:
                        module_name = m.strip()
                        if (len(module_name) < 200 and 
                            len(module_name) > 3 and
                            not module_name.startswith('Answer:') and
                            not any(skip in module_name.lower() for skip in ['camera', 'deployment', 'internet', 'gdpr', 'number'])):
                            modules.append(module_name)
        
        # Fallback: search for common AI module patterns in content
        if not modules:
            # Look for patterns like "Smoking Detection", "PPE detection", etc.
            pattern = r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Detection|Monitoring|Recognition|Management|Counting))'
            matches = re.findall(pattern, self.content)
            if matches:
                modules = list(set(matches))[:20]  # Remove duplicates, limit to 20
        
        return modules[:20]  # Limit to 20 modules
    
    def extract_internet_connection(self):
        """Extract internet connection information"""
        internet = {
            "has_connection": False,
            "is_stable": False,
            "connection_type": None,
            "bandwidth": None
        }
        
        # Check for internet connection question
        section = self._extract_section("Does client have stable internet connection")
        if section:
            if re.search(r'\b(yes|stable|fiber|24/24)\b', section, re.IGNORECASE):
                internet["has_connection"] = True
                internet["is_stable"] = True
                
                # Extract connection type
                if re.search(r'\bfiber\b', section, re.IGNORECASE):
                    internet["connection_type"] = "Fiber"
                elif re.search(r'\b4g|5g\b', section, re.IGNORECASE):
                    internet["connection_type"] = "4G/5G"
                elif re.search(r'\bsatellite\b', section, re.IGNORECASE):
                    internet["connection_type"] = "Satellite"
                    # Extract bandwidth for satellite
                    bw_match = re.search(r'(\d+)\s*mbps?', section, re.IGNORECASE)
                    if bw_match:
                        internet["bandwidth"] = int(bw_match.group(1))
            elif re.search(r'\bno\b|\bunstable\b|\blimited\b', section, re.IGNORECASE):
                internet["has_connection"] = False
                internet["is_stable"] = False
        
        return internet
    
    def extract_data_security_requirements(self):
        """Extract data security and GDPR requirements"""
        security = {
            "has_gdpr": False,
            "data_localization": False,
            "prefers_local": False
        }
        
        # Check GDPR section
        section = self._extract_section("GDPR") or self._extract_section("data privacy")
        if section:
            if re.search(r'\b(yes|required|follow|comply)\b', section, re.IGNORECASE):
                security["has_gdpr"] = True
                security["data_localization"] = True
        
        # Check deployment method preference
        section = self._extract_section("deployment method") or self._extract_section("HW/SW requirements")
        if section:
            if re.search(r'\bon-prem|on premise|local\b', section, re.IGNORECASE):
                security["prefers_local"] = True
                security["data_localization"] = True
            elif re.search(r'\bprefer.*?on-prem|strong.*?on-prem\b', section, re.IGNORECASE):
                security["prefers_local"] = True
                security["data_localization"] = True
        
        return security
    
    def extract_deployment_preference(self):
        """Extract explicit deployment method preference"""
        # First search entire content for explicit mentions (more reliable)
        content_lower = self.content.lower()
        
        # Check for hybrid variants first (most specific)
        if re.search(r'\bhybrid.*?ai.*?inference.*?local|ai.*?inference.*?locally.*?training.*?cloud\b', self.content, re.IGNORECASE):
            return "hybrid"
        if re.search(r'\bhybrid.*?training.*?local|ai.*?inference.*?training.*?at.*?site.*?dashboard.*?cloud\b', self.content, re.IGNORECASE):
            return "hybrid-training-local"
        if re.search(r'\bhybrid\b', self.content, re.IGNORECASE):
            return "hybrid"
        
        # Check section
        section = self._extract_section("deployment method") or self._extract_section("HW/SW requirements")
        
        if section:
            if re.search(r'\bhybrid\b', section, re.IGNORECASE):
                # Determine hybrid variant
                if re.search(r'\btraining.*?local|training.*?on-prem|training.*?at.*?site\b', section, re.IGNORECASE):
                    return "hybrid-training-local"
                else:
                    return "hybrid"
            elif re.search(r'\bcloud\b|\bon-cloud\b', section, re.IGNORECASE):
                return "cloud"
            elif re.search(r'\bon-prem|on premise\b', section, re.IGNORECASE):
                return "on-prem"
            elif re.search(r'\b4g.*?vpn|vpn.*?bridge\b', section, re.IGNORECASE):
                return "4g-vpn-bridge"
            elif re.search(r'\bvimov\b', section, re.IGNORECASE):
                return "vimov"
        
        return None
    
    def determine_deployment_method(self):
        """
        Determine deployment method based on Deal Transfer information
        Following logic from deployment_method_selection_logic.md
        """
        # First check explicit preference (highest priority)
        explicit = self.extract_deployment_preference()
        if explicit:
            # Handle hybrid variants
            if explicit == "hybrid":
                # Check if training is local or cloud
                if re.search(r'\btraining.*?local|training.*?on-prem|training.*?at.*?site\b', self.content, re.IGNORECASE):
                    return "hybrid-training-local"
                else:
                    return "hybrid"  # Default: AI Inference at site, Training + Dashboard Cloud
            return explicit
        
        # Get key factors
        internet = self.extract_internet_connection()
        security = self.extract_data_security_requirements()
        
        # Check for remote/mobile deployment
        if re.search(r'\bremote|rural|mobile|temporary|4g.*?sim\b', self.content, re.IGNORECASE):
            if re.search(r'\b4g|5g.*?auto.*?register|vpn.*?bridge\b', self.content, re.IGNORECASE):
                return "4g-vpn-bridge"
            elif re.search(r'\bvimov|high.*?mobility|temporary.*?setup\b', self.content, re.IGNORECASE):
                return "vimov"
        
        # Check for explicit hybrid mentions
        if re.search(r'\bhybrid.*?inference.*?local|ai.*?inference.*?site.*?training.*?cloud\b', self.content, re.IGNORECASE):
            return "hybrid"
        if re.search(r'\bhybrid.*?training.*?local|ai.*?inference.*?training.*?site.*?dashboard.*?cloud\b', self.content, re.IGNORECASE):
            return "hybrid-training-local"
        
        # Decision logic
        # 1. Data security/GDPR → On-premise
        if security["has_gdpr"] or security["data_localization"] or security["prefers_local"]:
            return "on-prem"
        
        # 2. No/Limited Internet → On-premise
        if not internet["has_connection"] or not internet["is_stable"]:
            return "on-prem"
        
        # 3. Limited bandwidth (satellite < 20 Mbps) → On-premise
        if internet["connection_type"] == "Satellite" and internet["bandwidth"]:
            if internet["bandwidth"] < 20:
                return "on-prem"
            elif internet["bandwidth"] >= 20:
                # Satellite with good bandwidth → Hybrid
                return "hybrid"
        
        # 4. Stable internet + no security constraints → Cloud or Hybrid
        if internet["is_stable"] and not security["data_localization"]:
            # Check for multi-site with local dashboards
            if re.search(r'\bmulti.*?site|multiple.*?site|local.*?dashboard\b', self.content, re.IGNORECASE):
                return "hybrid"
            else:
                return "cloud"
        
        # 5. Stable internet + moderate security → Hybrid
        if internet["is_stable"] and internet["bandwidth"] and internet["bandwidth"] >= 20:
            return "hybrid"
        
        # Default: On-premise (safest option)
        return "on-prem"
    
    def extract_alert_methods(self):
        """Extract alert methods"""
        alerts = []
        
        section = self._extract_section("alert") or self._extract_section("notification")
        if section:
            if re.search(r'\bemail\b', section, re.IGNORECASE):
                alerts.append("Email")
            if re.search(r'\bdashboard\b', section, re.IGNORECASE):
                alerts.append("Dashboard")
            if re.search(r'\bmobile|sms\b', section, re.IGNORECASE):
                alerts.append("Mobile")
            if re.search(r'\btelegram\b', section, re.IGNORECASE):
                alerts.append("Telegram")
        
        return alerts if alerts else ["Email", "Dashboard"]
    
    def extract_nvr_requirement(self):
        """Extract NVR requirement"""
        if re.search(r'\bNVR\b|\bNetwork Video Recorder\b', self.content, re.IGNORECASE):
            return True
        return False
    
    def _extract_section(self, section_name):
        """Extract a specific section from content"""
        # Look for section with the name followed by colon or question mark
        patterns = [
            rf'{re.escape(section_name)}[:\?].*?\n(.*?)(?=\n\w+.*?[:\?]|\Z)',
            rf'{re.escape(section_name)}.*?\n(.*?)(?=\n\w+.*?:|\Z)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, self.content, re.IGNORECASE | re.DOTALL)
            if match:
                section_text = match.group(1).strip()
                # Remove "Answer:" prefix if present
                section_text = re.sub(r'^Answer:\s*', '', section_text, flags=re.IGNORECASE)
                if section_text:
                    return section_text
        return None
    
    def parse(self):
        """Parse all information from Deal Transfer"""
        internet = self.extract_internet_connection()
        security = self.extract_data_security_requirements()
        deployment_method = self.determine_deployment_method()
        
        self.project_info = {
            "project_name": self.extract_project_name(),
            "client_name": self.extract_client_name(),
            "deployment_method": deployment_method,
            "num_cameras": self.extract_camera_number(),
            "ai_modules": self.extract_ai_modules(),
            "alert_methods": self.extract_alert_methods(),
            "include_nvr": self.extract_nvr_requirement(),
            "list_ai_modules": True,
            "compact_mode": True,
            "internet_connection": internet["has_connection"],
            "internet_stable": internet["is_stable"],
            "internet_type": internet["connection_type"],
            "internet_bandwidth": internet["bandwidth"],
            "has_gdpr": security["has_gdpr"],
            "data_localization": security["data_localization"],
        }
        
        return self.project_info


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 parse_deal_transfer.py <deal_transfer_file>")
        sys.exit(1)
    
    deal_transfer_file = sys.argv[1]
    parser = DealTransferParser(deal_transfer_file)
    project_info = parser.parse()
    
    print(json.dumps({"project_info": project_info}, indent=2, ensure_ascii=False))

