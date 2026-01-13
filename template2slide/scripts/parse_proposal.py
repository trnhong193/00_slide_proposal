#!/usr/bin/env python3
"""
Parse proposal template (from proposal-template-generation-skill) and extract architecture information
"""

import re
import json
import sys
from pathlib import Path


class ProposalParser:
    """Parse proposal markdown template and extract architecture information"""
    
    def __init__(self, markdown_file):
        self.file_path = Path(markdown_file)
        self.content = self._read_file()
        self.project_info = {}
        
    def _read_file(self):
        """Read markdown file content"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading file: {e}")
            sys.exit(1)
    
    def extract_project_name(self):
        """Extract project name from proposal title"""
        # Look for "Proposal Title:" or title in markdown
        pattern = r'\*\*Proposal Title:\*\*\s*(.+?)(?:\n|$)'
        match = re.search(pattern, self.content, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        
        # Fallback: extract from first heading
        pattern = r'^#\s+(.+?)$'
        match = re.search(pattern, self.content, re.MULTILINE)
        if match:
            return match.group(1).strip()
        
        return self.file_path.stem
    
    def extract_client_name(self):
        """Extract client name - NO DEFAULT VALUES"""
        pattern = r'\*\*Client Name:\*\*\s*(.+?)(?:\n|$)'
        match = re.search(pattern, self.content, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        
        # Try "Project Owner"
        pattern = r'\*\*Project Owner:\*\*\s*(.+?)(?:\n|$)'
        match = re.search(pattern, self.content, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        
        # Try alternate format: **Project Owner** Value (colon outside bold)
        pattern = r'\*\*Project Owner\*\*[:\s]+(.+?)(?:\n|$)'
        match = re.search(pattern, self.content, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        
        print("⚠️  ERROR: Client Name (Project Owner) not found in template. Please check the template.")
        print("   Expected format: **Client Name:** Value or **Project Owner:** Value")
        return None
    
    def extract_camera_number(self):
        """Extract number of cameras"""
        patterns = [
            r'\*\*Camera Number:\*\*\s*(\d+)\s*cameras?',
            r'(\d+)\s*cameras?\s*(?:\(|at|total)',
            r'Camera.*?(\d+)\s*cameras?',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, self.content, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        # Try to find number in "Camera Number:" section
        section = self._extract_section("Camera Number")
        if section:
            match = re.search(r'(\d+)', section)
            if match:
                return int(match.group(1))
        
        return None
    
    def extract_ai_modules(self):
        """Extract list of AI modules"""
        modules = []
        
        # First, try to find in PROJECT REQUIREMENT STATEMENT section
        section = self._extract_section("PROJECT REQUIREMENT STATEMENT")
        if section:
            # Look for "AI Modules:" followed by numbered list
            # Support both formats: **AI Modules:** and **AI Modules**:
            pattern1 = r'\*\*AI Modules:\*\*.*?\n((?:\d+\.\s*[^\n]+\n?)+)'
            pattern2 = r'\*\*AI Modules\*\*:.*?\n((?:\d+\.\s*[^\n]+\n?)+)'
            match = re.search(pattern1, section, re.IGNORECASE | re.DOTALL) or re.search(pattern2, section, re.IGNORECASE | re.DOTALL)
            if match:
                module_list = match.group(1)
                # Extract each numbered item
                pattern = r'^\d+\.\s*(.+?)$'
                matches = re.findall(pattern, module_list, re.MULTILINE)
                if matches:
                    for m in matches:
                        module_name = m.strip()
                        # Filter out non-module items
                        if len(module_name) < 100 and not any(keyword in module_name.lower() for keyword in 
                            ['data flow', 'capture video', 'processes video', 'alert data', 'delivered via']):
                            modules.append(module_name)
        
        # If still no modules, try finding standalone "AI Modules:" section
        if not modules:
            section = self._extract_section("AI Modules")
            if section:
                lines = section.split('\n')
                for line in lines:
                    match = re.match(r'^\d+\.\s*(.+?)$', line.strip())
                    if match:
                        module_name = match.group(1).strip()
                        if len(module_name) < 100:
                            modules.append(module_name)
                    elif line.strip() == '' and modules:
                        break
        
        # Fallback: search entire document for numbered list after "AI Modules:"
        # Support both formats: **AI Modules:** and **AI Modules**:
        if not modules:
            pattern1 = r'\*\*AI Modules:\*\*.*?\n((?:\d+\.\s*[^\n]{0,100}\n?)+)'
            pattern2 = r'\*\*AI Modules\*\*:.*?\n((?:\d+\.\s*[^\n]{0,100}\n?)+)'
            match = re.search(pattern1, self.content, re.IGNORECASE | re.DOTALL) or re.search(pattern2, self.content, re.IGNORECASE | re.DOTALL)
            if match:
                module_list = match.group(1)
                pattern = r'^\d+\.\s*(.+?)$'
                matches = re.findall(pattern, module_list, re.MULTILINE)
                if matches:
                    modules = [m.strip() for m in matches if len(m.strip()) < 100]
        
        return modules
    
    def extract_deployment_method(self):
        """Extract deployment method (Cloud/On-premise/Hybrid)"""
        # Look for "Deployment Method:" section
        section = self._extract_section("SYSTEM ARCHITECTURE")
        if section:
            # Check for deployment method keywords
            if re.search(r'\bCloud-based\b|\bCloud\b|\bOn-cloud\b', section, re.IGNORECASE):
                return "cloud"
            elif re.search(r'\bOn-premise\b|\bOn-prem\b|\bOn premise\b', section, re.IGNORECASE):
                return "on-prem"
            elif re.search(r'\bHybrid\b', section, re.IGNORECASE):
                return "hybrid"
        
        # Check in "Deployment Method:" field - support both formats:
        # **Deployment Method:** Value (colon inside bold)
        # **Deployment Method**: Value (colon outside bold)
        pattern1 = r'\*\*Deployment Method:\*\*\s*(.+?)(?:\n|$)'
        pattern2 = r'\*\*Deployment Method\*\*:\s*(.+?)(?:\n|$)'
        match = re.search(pattern1, self.content, re.IGNORECASE) or re.search(pattern2, self.content, re.IGNORECASE)
        if match:
            method = match.group(1).lower()
            if 'cloud' in method:
                return "cloud"
            elif 'on-prem' in method or 'on premise' in method or 'on-premise' in method:
                return "on-prem"
            elif 'hybrid' in method:
                return "hybrid"
        
        # Try to infer from content - but still warn if not explicit
        if re.search(r'\bcloud\b', self.content, re.IGNORECASE):
            print("⚠️  WARNING: Deployment method not explicitly found. Inferred 'cloud' from content.")
            print("   Expected format: **Deployment Method:** Value or explicit mention in SYSTEM ARCHITECTURE section")
            return "cloud"
        elif re.search(r'\bon-prem\b|\bon premise\b', self.content, re.IGNORECASE):
            print("⚠️  WARNING: Deployment method not explicitly found. Inferred 'on-premise' from content.")
            print("   Expected format: **Deployment Method:** Value or explicit mention in SYSTEM ARCHITECTURE section")
            return "on-prem"
        
        print("⚠️  ERROR: Deployment method not found in template. Please check the template.")
        print("   Expected: 'Cloud', 'On-Premise', or 'Hybrid' in SYSTEM ARCHITECTURE section")
        print("   Or use format: **Deployment Method:** Value")
        return None
    
    def extract_alert_methods(self):
        """Extract alert methods"""
        alerts = []
        
        # Look for alert section
        section = self._extract_section("Alerts & Notifications")
        if not section:
            section = self._extract_section("Alert")
        
        if section:
            # Check for common alert types
            if re.search(r'\bEmail\b', section, re.IGNORECASE):
                alerts.append("Email")
            if re.search(r'\bTelegram\b', section, re.IGNORECASE):
                alerts.append("Telegram")
            if re.search(r'\bDashboard\b', section, re.IGNORECASE):
                alerts.append("Dashboard")
            if re.search(r'\bMobile\b', section, re.IGNORECASE):
                alerts.append("Mobile")
            if re.search(r'\bSMS\b', section, re.IGNORECASE):
                alerts.append("SMS")
            if re.search(r'\bWhatsApp\b', section, re.IGNORECASE):
                alerts.append("WhatsApp")
        
        # Fallback: search in entire document
        if not alerts:
            if re.search(r'\bemail\b', self.content, re.IGNORECASE):
                alerts.append("Email")
            if re.search(r'\btelegram\b', self.content, re.IGNORECASE):
                alerts.append("Telegram")
            if re.search(r'\bdashboard\b', self.content, re.IGNORECASE):
                alerts.append("Dashboard")
        
        if not alerts:
            print("⚠️  WARNING: Alert methods not found in template. Please check the template.")
            print("   Expected: Email, Telegram, Dashboard, SMS, Mobile, or WhatsApp mentioned in template")
            return []
        
        return alerts
    
    def extract_nvr_requirement(self):
        """Extract NVR requirement - check if NVR is mentioned or needed"""
        # Check if NVR is explicitly mentioned
        if re.search(r'\bNVR\b|\bNetwork Video Recorder\b', self.content, re.IGNORECASE):
            # Check if it's marked as optional
            nvr_section = self._extract_section("SYSTEM ARCHITECTURE")
            if nvr_section:
                # If marked as optional or not required, return False
                if re.search(r'NVR.*optional|optional.*NVR|NVR.*\*', nvr_section, re.IGNORECASE):
                    return False
                # If explicitly mentioned without "optional", assume needed
                return True
            return True
        
        # For on-premise, NVR is common but optional
        # For cloud, NVR is usually optional
        deployment = self.extract_deployment_method()
        if deployment == 'cloud':
            return False  # Cloud usually doesn't need NVR
        else:
            return True  # On-premise may have NVR (but mark as optional)
    
    def extract_network_info(self):
        """Extract network information"""
        network = {
            "internet_connection": False,
            "internet_type": None  # Don't default, only set if found
        }
        
        # Check for internet connection
        if re.search(r'internet connection.*?(?:required|confirmed|yes|stable)', self.content, re.IGNORECASE):
            network["internet_connection"] = True
            # Extract internet type - look for specific patterns
            # Pattern 1: "4G/5G/WiFi" or similar combinations
            pattern1 = r'(?:internet|connection|network).*?(?:4G|5G|WiFi|Wi-Fi|Ethernet|Fiber|Satellite)'
            match1 = re.search(pattern1, self.content, re.IGNORECASE)
            if match1:
                # Extract the type
                type_match = re.search(r'(4G|5G|WiFi|Wi-Fi|Ethernet|Fiber|Satellite|Broadband)', self.content, re.IGNORECASE)
                if type_match:
                    network["internet_type"] = type_match.group(1)
            
            # Pattern 2: Look for bandwidth specifications that might indicate type
            # If no specific type found, check if it's mentioned in network section
            if not network["internet_type"]:
                network_section = self._extract_section("SYSTEM REQUIREMENTS")
                if network_section:
                    type_match = re.search(r'(4G|5G|WiFi|Wi-Fi|Ethernet|Fiber|Satellite|Broadband)', network_section, re.IGNORECASE)
                    if type_match:
                        network["internet_type"] = type_match.group(1)
        
        return network
    
    def _extract_section(self, section_name):
        """Extract a specific section from markdown"""
        # Look for section heading
        pattern = rf'##+\s*{re.escape(section_name)}.*?\n(.*?)(?=##|\Z)'
        match = re.search(pattern, self.content, re.IGNORECASE | re.DOTALL)
        if match:
            return match.group(1)
        return None
    
    def parse(self):
        """Parse all information from proposal - validates required fields"""
        client_name = self.extract_client_name()
        deployment_method = self.extract_deployment_method()
        num_cameras = self.extract_camera_number()
        ai_modules = self.extract_ai_modules()
        
        # Validate critical fields
        errors = []
        if client_name is None:
            errors.append("Client Name (Project Owner)")
        if deployment_method is None:
            errors.append("Deployment Method")
        if num_cameras is None:
            errors.append("Camera Number")
        if not ai_modules:
            errors.append("AI Modules")
        
        if errors:
            print("\n" + "="*80)
            print("❌ CRITICAL ERRORS: Required fields not found in template")
            print("="*80)
            for error in errors:
                print(f"   - {error}")
            print("\n⚠️  Please check the template and ensure all required fields are present.")
            print("   Do NOT use default values - all values must be extracted from the template.")
            print("="*80 + "\n")
            # Raise error instead of using defaults
            raise ValueError(f"Required fields not found: {', '.join(errors)}")
        
        self.project_info = {
            "project_name": self.extract_project_name(),
            "client_name": client_name,  # No default - must be extracted
            "deployment_method": deployment_method,  # No default - must be extracted
            "num_cameras": num_cameras,  # No default - must be extracted
            "ai_modules": ai_modules,  # No default - must be extracted
            "alert_methods": self.extract_alert_methods(),
            "include_nvr": self.extract_nvr_requirement(),
            "list_ai_modules": True,  # Default: list all modules (can be set to False to hide)
            "compact_mode": True,  # Default: use compact mode (AI modules inline, simplified labels)
        }
        
        # Add network info
        network = self.extract_network_info()
        self.project_info.update(network)
        
        return self.project_info


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 parse_proposal.py <proposal_file.md>")
        sys.exit(1)
    
    proposal_file = sys.argv[1]
    parser = ProposalParser(proposal_file)
    project_info = parser.parse()
    
    print(json.dumps({"project_info": project_info}, indent=2, ensure_ascii=False))

