#!/usr/bin/env python3
"""
Generate Mermaid Architecture Diagrams matching KB examples
Clean, client-friendly format showing essential flow only
Compact mode: AI modules embedded inline, simplified labels
"""

import re


class ArchitectureGenerator:
    """Generate Mermaid architecture diagrams matching KB examples"""
    
    def __init__(self, project_info):
        self.info = project_info
    
    def _get_ai_modules_styles(self, ai_modules):
        """Generate style statements for all AI modules"""
        if not ai_modules:
            return ''
        styles = []
        for i in range(len(ai_modules)):
            styles.append(f'    class Mod_{i+1} aiModuleStyle')
        return '\n'.join(styles)
    
    def _format_ai_modules_inline(self, ai_modules, max_length=50):
        """Format AI modules as inline list for compact display"""
        if not ai_modules:
            return ""
        # Shorten module names if needed, then join with line breaks
        short_modules = []
        for module in ai_modules:
            # Remove common suffixes in parentheses for compactness
            short_name = re.sub(r'\s*\([^)]*\)\s*$', '', module.strip())
            # Truncate if too long
            if len(short_name) > max_length:
                short_name = short_name[:max_length-3] + "..."
            short_modules.append(short_name)
        return "<br/>".join(short_modules)
        
    def _should_show_nvr(self):
        """Determine if NVR should be shown based on deployment method and requirements"""
        # Check if include_nvr is explicitly set in project info
        if 'include_nvr' in self.info:
            # Respect explicit flag for both cloud and on-premise
            return self.info.get('include_nvr')
        
        # Default behavior if flag is not set
        if self.info.get('deployment_method') == 'cloud':
            # For cloud, NVR is usually optional (default False)
            return False
        else:
            # For on-premise, show NVR by default (but mark as optional)
            return True
    
    def generate_on_prem(self):
        """Generate On-Premise Architecture Diagram matching KB examples"""
        num_cameras = self.info.get('num_cameras', 8)
        ai_modules = self.info.get('ai_modules', [])
        show_nvr = self._should_show_nvr()
        list_ai_modules = self.info.get('list_ai_modules', True)
        compact_mode = self.info.get('compact_mode', True)
        
        # Camera - match KB format
        camera_group = f'Cameras["Up to {num_cameras} Cameras<br/>IP-based Camera"]'
        
        # NVR (optional) - match KB format: "Network Video Recorder (NVR)*"
        nvr_node = ''
        nvr_connection = ''
        if show_nvr:
            nvr_node = 'NVR["Network Video Recorder<br/>(NVR)*"]'
            nvr_connection = 'Cameras -->|RTSP Links| NVR\n    NVR -->|RTSP Links| AI_Inference'
        else:
            nvr_connection = 'Cameras -->|RTSP Links| AI_Inference'
        
        # AI System - clearly label as Training + Inference (both on-premise)
        ai_training = 'AI_Training["AI Training<br/>(On-Premise)"]'
        
        # AI Modules: embed inline if compact_mode, otherwise separate subgraph
        if compact_mode and ai_modules:
            ai_modules_text = self._format_ai_modules_inline(ai_modules)
            ai_inference = f'AI_Inference["AI Inference<br/>(On-Premise Processing)<br/>{ai_modules_text}"]'
            ai_modules_subgraph = ''
            ai_modules_connections = ''
            ai_modules_styles = ''
        else:
            ai_inference = 'AI_Inference["AI Inference<br/>(On-Premise Processing)"]'
            # AI Modules - list all with full names, arranged horizontally (optional)
            ai_modules_subgraph = ''
            ai_modules_connections = ''
            if list_ai_modules and ai_modules:
                module_list = []
                for i, module in enumerate(ai_modules, 1):
                    module_name = module.strip()
                    node_id = f'Mod_{i}'
                    module_list.append(f'{node_id}["{module_name}"]')
                    ai_modules_connections += f'    AI_Inference --> {node_id}\n'
                
                ai_modules_nodes = '\n        '.join(module_list)
                ai_modules_subgraph = f'''    subgraph "AI Modules"
        direction LR
        {ai_modules_nodes}
    end
    '''
            ai_modules_styles = self._get_ai_modules_styles(ai_modules) if list_ai_modules and ai_modules else ''
        
        # Dashboard - simplified, compact format
        dashboard = 'Dashboard["Local Dashboard"]'
        
        # Alert system - simplified, compact format
        alerts = self.info.get('alert_methods', ['Email', 'Dashboard'])
        alert_list = ' & '.join(alerts) if alerts else 'Email & Dashboard'
        alert_system = f'Alert["Alert/Notification<br/>({alert_list})"]'
        
        template = f"""graph TB
    subgraph "On-Premise Infrastructure"
        {camera_group}
        {nvr_node}
        {ai_training}
        {ai_inference}
        {dashboard}
        {alert_system}
    end
    
{ai_modules_subgraph}    {nvr_connection}
    AI_Training -->|Trained Models| AI_Inference
    AI_Inference -->|Detection Results| Dashboard
    AI_Inference -->|Alerts| Alert
{ai_modules_connections}    style AI_Training fill:#e1f5ff,stroke:#01579b,stroke-width:2px,color:#000000
    style AI_Inference fill:#81d4fa,stroke:#0277bd,stroke-width:2px,color:#000000
    style Dashboard fill:#fff4e1,stroke:#e65100,stroke-width:2px,color:#000000
    style Alert fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000000
    style Cameras fill:#ffffff,stroke:#424242,stroke-width:2px,color:#000000
    classDef aiModuleStyle fill:#f5f5f5,stroke:#616161,stroke-width:2px,color:#000000
{ai_modules_styles}
"""
        return template
    
    def generate_cloud(self):
        """Generate Cloud Architecture Diagram matching KB examples - compact format"""
        num_cameras = self.info.get('num_cameras', 8)
        ai_modules = self.info.get('ai_modules', [])
        # Cloud deployment: Show NVR if include_nvr = true
        include_nvr = self.info.get('include_nvr', False)
        list_ai_modules = self.info.get('list_ai_modules', True)
        compact_mode = self.info.get('compact_mode', True)  # Default to compact mode
        
        # On-site components - match KB format
        camera_group = f'Cameras["Up to {num_cameras} Cameras<br/>IP-based Camera"]'
        
        # Internet connection - only show type if specified
        internet_type = self.info.get('internet_type')
        if internet_type:
            internet = f'Internet["Internet Connection<br/>({internet_type})<br/>(Provided by Client)"]'
        else:
            internet = 'Internet["Internet Connection<br/>(Provided by Client)"]'
        
        # NVR (optional) - show if include_nvr = true, viết tắt "NVR" thôi
        nvr_node = ''
        nvr_connection = ''
        if include_nvr:
            nvr_node = 'NVR["NVR"]'  # Không có indentation, template sẽ tự thêm
            # Nếu có NVR: Cameras -> NVR -> RTSP Links -> Internet (không có label RTSP Links trên Cameras -> NVR)
            nvr_connection = '    Cameras --> NVR\n    NVR -->|RTSP Links| Internet'
        else:
            # Nếu không có NVR: Cameras -> RTSP Links -> Internet (không có NVR node)
            nvr_connection = '    Cameras -->|RTSP Links| Internet'
        
        # Cloud components - NO Cloud Training (removed)
        # AI Modules: embed inline in Cloud Inference node if compact_mode
        if compact_mode and ai_modules:
            ai_modules_text = self._format_ai_modules_inline(ai_modules)
            cloud_inference = f'Cloud_Inference["On-cloud in AWS<br/>(viAct\'s CMP)<br/>{ai_modules_text}"]'
            ai_modules_subgraph = ''
            ai_modules_connections = ''
            ai_modules_styles = ''
        else:
            cloud_inference = 'Cloud_Inference["On-cloud in AWS<br/>(viAct\'s CMP - Cloud Processing)"]'
            # AI Modules - list all with full names, arranged horizontally (optional)
            ai_modules_subgraph = ''
            ai_modules_connections = ''
            if list_ai_modules and ai_modules:
                module_list = []
                for i, module in enumerate(ai_modules, 1):
                    module_name = module.strip()
                    node_id = f'Mod_{i}'
                    module_list.append(f'{node_id}["{module_name}"]')
                    ai_modules_connections += f'    Cloud_Inference --> {node_id}\n'
                
                ai_modules_nodes = '\n        '.join(module_list)
                ai_modules_subgraph = f'''    subgraph "AI Modules"
        direction LR
        {ai_modules_nodes}
    end
    '''
            ai_modules_styles = self._get_ai_modules_styles(ai_modules) if list_ai_modules and ai_modules else ''
        
        # Output Services - grouped together in separate subgraph
        dashboard = 'Dashboard["Centralized Dashboard"]'
        
        # Alert system - match KB format
        alerts = self.info.get('alert_methods', ['Email', 'Dashboard'])
        alert_list = ' & '.join(alerts) if alerts else 'Email & Dashboard'
        alert_system = f'Alert["Alert/Notification<br/>({alert_list})"]'
        
        # HSE Manager - OUTSIDE all subgraphs, positioned separately
        hse_manager = 'HSE_Manager["HSE Manager"]'
        
        # Layout: Horizontal arrangement for slide presentation
        # On-Site | On-Cloud (contains Cloud Infrastructure + Output Services) | HSE Manager - horizontal
        # Output Services xếp thành cột dọc (direction TB)
        # HSE Manager nằm trên cùng hàng ngang nhưng ở cuối cùng, trỏ vào Output Services
        # Từ Cloud Infrastructure sang Output Services: 1 mũi tên từ chính giữa khối này sang chính giữa khối kia
        nvr_style = '    style NVR fill:#f5f5f5,stroke:#616161,stroke-width:2px,color:#000000\n' if include_nvr else ''
        
        template = f"""graph LR
    subgraph "On-Site Infrastructure"
        direction TB
        {camera_group}
        {nvr_node}
        {internet}
    end
    
    subgraph "On-Cloud"
        direction LR
        subgraph "Cloud Infrastructure"
            direction TB
            {cloud_inference}
        end
        
        subgraph "Output Services"
            direction TB
            {dashboard}
            {alert_system}
        end
    end
    
    {hse_manager}
    
{ai_modules_subgraph}{nvr_connection}
    Internet --> Cloud_Inference
    Cloud_Inference --> Dashboard
    HSE_Manager --> Dashboard
{ai_modules_connections}    style Cloud_Inference fill:#81d4fa,stroke:#0277bd,stroke-width:3px,color:#000000
    style Dashboard fill:#fff4e1,stroke:#e65100,stroke-width:2px,color:#000000
    style Alert fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000000
    style HSE_Manager fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    style Internet fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000000
    style Cameras fill:#ffffff,stroke:#424242,stroke-width:2px,color:#000000
{nvr_style}    classDef aiModuleStyle fill:#f5f5f5,stroke:#616161,stroke-width:2px,color:#000000
{ai_modules_styles}"""
        return template
    
    def generate_hybrid(self):
        """Generate Hybrid Architecture Diagram matching KB examples"""
        num_cameras = self.info.get('num_cameras', 8)
        ai_modules = self.info.get('ai_modules', [])
        show_nvr = self._should_show_nvr()
        list_ai_modules = self.info.get('list_ai_modules', True)
        compact_mode = self.info.get('compact_mode', True)
        
        # On-site components
        camera_group = f'Cameras["Up to {num_cameras} Cameras<br/>IP-based Camera"]'
        
        # Internet connection - only show type if specified
        internet_type = self.info.get('internet_type')
        if internet_type:
            internet = f'Internet["Internet Connection<br/>({internet_type})"]'
        else:
            internet = 'Internet["Internet Connection"]'
        
        # NVR (optional)
        nvr_node = ''
        nvr_connection = ''
        if show_nvr:
            nvr_node = 'NVR["Network Video Recorder<br/>(NVR)*"]'
            nvr_connection = 'Cameras -->|RTSP Links| NVR\n    NVR -->|RTSP Links| AI_Inference'
        else:
            nvr_connection = 'Cameras -->|RTSP Links| AI_Inference'
        
        # On-premise AI - clearly label as Inference only (Training is on cloud)
        # AI Modules: embed inline if compact_mode
        if compact_mode and ai_modules:
            ai_modules_text = self._format_ai_modules_inline(ai_modules)
            ai_inference = f'AI_Inference["AI Inference<br/>(On-Premise Processing)<br/>{ai_modules_text}"]'
            ai_modules_subgraph = ''
            ai_modules_connections = ''
            ai_modules_styles = ''
        else:
            ai_inference = 'AI_Inference["AI Inference<br/>(On-Premise Processing)"]'
            # AI Modules - list all with full names, arranged horizontally (optional)
            ai_modules_subgraph = ''
            ai_modules_connections = ''
            if list_ai_modules and ai_modules:
                module_list = []
                for i, module in enumerate(ai_modules, 1):
                    module_name = module.strip()
                    node_id = f'Mod_{i}'
                    module_list.append(f'{node_id}["{module_name}"]')
                    ai_modules_connections += f'    AI_Inference --> {node_id}\n'
                
                ai_modules_nodes = '\n        '.join(module_list)
                ai_modules_subgraph = f'''    subgraph "AI Modules"
        direction LR
        {ai_modules_nodes}
    end
    '''
            ai_modules_styles = self._get_ai_modules_styles(ai_modules) if list_ai_modules and ai_modules else ''
        
        local_dashboard = 'Local_Dashboard["Local Dashboard"]'
        
        # Cloud components - clearly label Training and Online Dashboard
        cloud_training = 'Cloud_Training["AI Training<br/>(Cloud - viAct\'s Cloud)"]'
        online_dashboard = 'Online_Dashboard["Online Dashboard"]'
        
        # Alert system - can be on-premise or cloud, default to cloud for hybrid
        alerts = self.info.get('alert_methods', ['Email', 'Dashboard'])
        alert_list = ' & '.join(alerts) if alerts else 'Email & Dashboard'
        alert_system = f'Alert["Alert/Notification<br/>({alert_list})"]'
        
        template = f"""graph TB
    subgraph "On-Premise Infrastructure"
        {camera_group}
        {nvr_node}
        {ai_inference}
        {local_dashboard}
        {internet}
    end
    
    subgraph "Cloud Infrastructure"
        {cloud_training}
        {online_dashboard}
        {alert_system}
    end
    
{ai_modules_subgraph}    {nvr_connection}
    AI_Inference -->|Detection Results| Local_Dashboard
    AI_Inference -->|Alerts| Alert
    Internet -->|Model Updates| Cloud_Training
    Cloud_Training -.->|Updated Models| AI_Inference
    AI_Inference -->|API| Online_Dashboard
{ai_modules_connections}    style AI_Inference fill:#81d4fa,stroke:#0277bd,stroke-width:2px,color:#000000
    style Local_Dashboard fill:#fff4e1,stroke:#e65100,stroke-width:2px,color:#000000
    style Cloud_Training fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000000
    style Online_Dashboard fill:#fff4e1,stroke:#e65100,stroke-width:2px,color:#000000
    style Alert fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000000
    style Cameras fill:#ffffff,stroke:#424242,stroke-width:2px,color:#000000
    style Internet fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000000
    classDef aiModuleStyle fill:#f5f5f5,stroke:#616161,stroke-width:2px,color:#000000
{ai_modules_styles}
"""
        return template
    
    def generate_hybrid_training_local(self):
        """Generate Hybrid Architecture (AI Inference + Training at Site, Dashboard Cloud)"""
        num_cameras = self.info.get('num_cameras', 8)
        ai_modules = self.info.get('ai_modules', [])
        show_nvr = self._should_show_nvr()
        list_ai_modules = self.info.get('list_ai_modules', True)
        compact_mode = self.info.get('compact_mode', True)
        
        camera_group = f'Cameras["Up to {num_cameras} Cameras<br/>IP-based Camera"]'
        
        nvr_node = ''
        nvr_connection = ''
        if show_nvr:
            nvr_node = 'NVR["Network Video Recorder<br/>(NVR)*"]'
            nvr_connection = 'Cameras -->|RTSP Links| NVR\n    NVR -->|RTSP Links| AI_Inference'
        else:
            nvr_connection = 'Cameras -->|RTSP Links| AI_Inference'
        
        # Both Training and Inference on-premise
        ai_training = 'AI_Training["AI Training<br/>(On-Premise)"]'
        
        if compact_mode and ai_modules:
            ai_modules_text = self._format_ai_modules_inline(ai_modules)
            ai_inference = f'AI_Inference["AI Inference<br/>(On-Premise Processing)<br/>{ai_modules_text}"]'
            ai_modules_subgraph = ''
            ai_modules_connections = ''
            ai_modules_styles = ''
        else:
            ai_inference = 'AI_Inference["AI Inference<br/>(On-Premise Processing)"]'
            ai_modules_subgraph = ''
            ai_modules_connections = ''
            if list_ai_modules and ai_modules:
                module_list = []
                for i, module in enumerate(ai_modules, 1):
                    node_id = f'Mod_{i}'
                    module_list.append(f'{node_id}["{module.strip()}"]')
                    ai_modules_connections += f'    AI_Inference --> {node_id}\n'
                
                ai_modules_nodes = '\n        '.join(module_list)
                ai_modules_subgraph = f'''    subgraph "AI Modules"
        direction LR
        {ai_modules_nodes}
    end
    '''
            ai_modules_styles = self._get_ai_modules_styles(ai_modules) if list_ai_modules and ai_modules else ''
        
        # Internet for dashboard access only
        internet_type = self.info.get('internet_type')
        if internet_type:
            internet = f'Internet["Internet Connection<br/>({internet_type})<br/>Dashboard Access Only"]'
        else:
            internet = 'Internet["Internet Connection<br/>Dashboard Access Only"]'
        
        # Cloud dashboard only
        online_dashboard = 'Online_Dashboard["Online Dashboard<br/>(Cloud)"]'
        
        alerts = self.info.get('alert_methods', ['Email', 'Dashboard'])
        alert_list = ' & '.join(alerts) if alerts else 'Email & Dashboard'
        alert_system = f'Alert["Alert/Notification<br/>({alert_list})"]'
        
        template = f"""graph TB
    subgraph "On-Premise Infrastructure"
        {camera_group}
        {nvr_node}
        {ai_training}
        {ai_inference}
        {internet}
    end
    
    subgraph "Cloud Infrastructure"
        {online_dashboard}
        {alert_system}
    end
    
{ai_modules_subgraph}    {nvr_connection}
    AI_Training -->|Trained Models| AI_Inference
    AI_Inference -->|Detection Results| Online_Dashboard
    AI_Inference -->|Alerts| Alert
    Internet -->|API| Online_Dashboard
{ai_modules_connections}    style AI_Training fill:#e1f5ff,stroke:#01579b,stroke-width:2px,color:#000000
    style AI_Inference fill:#81d4fa,stroke:#0277bd,stroke-width:2px,color:#000000
    style Online_Dashboard fill:#fff4e1,stroke:#e65100,stroke-width:2px,color:#000000
    style Alert fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000000
    style Internet fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000000
    style Cameras fill:#ffffff,stroke:#424242,stroke-width:2px,color:#000000
    classDef aiModuleStyle fill:#f5f5f5,stroke:#616161,stroke-width:2px,color:#000000
{ai_modules_styles}
"""
        return template
    
    def generate_4g_vpn_bridge(self):
        """Generate 4G VPN Bridge Architecture"""
        num_cameras = self.info.get('num_cameras', 5)
        ai_modules = self.info.get('ai_modules', [])
        compact_mode = self.info.get('compact_mode', True)
        
        camera_group = f'Cameras["Up to {num_cameras} Cameras<br/>4G/5G Enabled<br/>Auto-Registration"]'
        
        # 4G SIM cards per camera
        sim_cards = 'SIM_Cards["4G SIM Cards<br/>Per Camera<br/>15 Mbps Uplink<br/>2TB/Month"]'
        
        # Central NVR with VPN
        nvr_central = 'NVR_Central["Central NVR<br/>(Static IP)<br/>Auto-Registration"]'
        
        # VPN Bridge
        vpn_bridge = 'VPN_Bridge["VPN Bridge<br/>4G/5G Connection"]'
        
        # AI Processing (can be on-premise or cloud)
        if compact_mode and ai_modules:
            ai_modules_text = self._format_ai_modules_inline(ai_modules)
            ai_processing = f'AI_Processing["AI Processing<br/>{ai_modules_text}"]'
        else:
            ai_processing = 'AI_Processing["AI Processing"]'
        
        dashboard = 'Dashboard["Central Dashboard"]'
        alerts = self.info.get('alert_methods', ['Email', 'Mobile'])
        alert_list = ' & '.join(alerts) if alerts else 'Email & Mobile'
        alert_system = f'Alert["Alert/Notification<br/>({alert_list})"]'
        
        template = f"""graph TB
    subgraph "Remote Sites"
        {camera_group}
        {sim_cards}
    end
    
    subgraph "Central Infrastructure"
        {nvr_central}
        {vpn_bridge}
        {ai_processing}
        {dashboard}
        {alert_system}
    end
    
    Cameras -->|4G/5G RTSP| SIM_Cards
    SIM_Cards -->|Auto-Register| VPN_Bridge
    VPN_Bridge -->|VPN Tunnel| NVR_Central
    NVR_Central -->|RTSP Links| AI_Processing
    AI_Processing -->|Detection Results| Dashboard
    AI_Processing -->|Alerts| Alert
    
    style Cameras fill:#ffffff,stroke:#424242,stroke-width:2px,color:#000000
    style SIM_Cards fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    style VPN_Bridge fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px,color:#000000
    style NVR_Central fill:#fff4e1,stroke:#e65100,stroke-width:2px,color:#000000
    style AI_Processing fill:#81d4fa,stroke:#0277bd,stroke-width:2px,color:#000000
    style Dashboard fill:#fff4e1,stroke:#e65100,stroke-width:2px,color:#000000
    style Alert fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000000
"""
        return template
    
    def generate_vimov(self):
        """Generate viMov Architecture (Mobile/High Mobility)"""
        num_cameras = self.info.get('num_cameras', 3)
        ai_modules = self.info.get('ai_modules', [])
        compact_mode = self.info.get('compact_mode', True)
        
        # Mobile/portable cameras
        cameras = f'Cameras["Portable/Mobile Cameras<br/>{num_cameras} Units<br/>Battery/Solar Powered"]'
        
        # Mobile AI unit
        if compact_mode and ai_modules:
            ai_modules_text = self._format_ai_modules_inline(ai_modules)
            mobile_ai = f'Mobile_AI["Mobile AI Unit<br/>(viMov)<br/>{ai_modules_text}"]'
        else:
            mobile_ai = 'Mobile_AI["Mobile AI Unit<br/>(viMov)"]'
        
        # Optional cloud sync (when internet available)
        cloud_sync = 'Cloud_Sync["Cloud Sync<br/>(When Internet Available)"]'
        
        dashboard = 'Dashboard["Mobile Dashboard"]'
        alerts = self.info.get('alert_methods', ['Mobile', 'SMS'])
        alert_list = ' & '.join(alerts) if alerts else 'Mobile & SMS'
        alert_system = f'Alert["Alert/Notification<br/>({alert_list})"]'
        
        template = f"""graph TB
    subgraph "Mobile Site"
        {cameras}
        {mobile_ai}
    end
    
    subgraph "Cloud (Optional)"
        {cloud_sync}
        {dashboard}
        {alert_system}
    end
    
    Cameras -->|RTSP/WiFi| Mobile_AI
    Mobile_AI -->|Detection Results| Alert
    Mobile_AI -.->|Sync (When Online)| Cloud_Sync
    Cloud_Sync -->|Data| Dashboard
    
    style Cameras fill:#ffffff,stroke:#424242,stroke-width:2px,color:#000000
    style Mobile_AI fill:#81d4fa,stroke:#0277bd,stroke-width:3px,color:#000000
    style Cloud_Sync fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000000,stroke-dasharray: 5 5
    style Dashboard fill:#fff4e1,stroke:#e65100,stroke-width:2px,color:#000000
    style Alert fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000000
"""
        return template
    
    def generate(self):
        """Generate architecture based on deployment method"""
        method = self.info.get('deployment_method', 'on-prem').lower()
        
        if method == 'on-prem' or method == 'on-premise':
            return self.generate_on_prem()
        elif method == 'cloud':
            return self.generate_cloud()
        elif method == 'hybrid':
            # Check if training is local or cloud
            # Default: AI Inference at site, Training + Dashboard Cloud
            return self.generate_hybrid()
        elif method == 'hybrid-training-local' or method == 'hybrid-training-onprem':
            return self.generate_hybrid_training_local()
        elif method == '4g-vpn-bridge' or method == '4g_vpn_bridge':
            return self.generate_4g_vpn_bridge()
        elif method == 'vimov':
            return self.generate_vimov()
        else:
            raise ValueError(f"Unknown deployment method: {method}")


if __name__ == "__main__":
    # Example usage
    cloud_info = {
        'project_name': 'Cedo Vietnam',
        'deployment_method': 'cloud',
        'num_cameras': 17,
        'ai_modules': [
            'Safety Helmet Detection',
            'Safety Vest Detection',
            'Safety Boots Detection',
            'Safety Gloves Detection',
            'Anti-collision Detection'
        ],
        'alert_methods': ['Email', 'Dashboard'],
        'internet_type': '4G/5G/WiFi',
        'include_nvr': False,
        'compact_mode': True
    }
    
    generator = ArchitectureGenerator(cloud_info)
    mermaid_code = generator.generate()
    
    print("=" * 80)
    print("GENERATED MERMAID ARCHITECTURE DIAGRAM")
    print("=" * 80)
    print(mermaid_code)
    print("=" * 80)
