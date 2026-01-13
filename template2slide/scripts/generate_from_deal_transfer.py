#!/usr/bin/env python3
"""
Main script to generate architecture diagram from Deal Transfer file
Supports both Deal Transfer files and Proposal Templates
"""

import sys
import json
from pathlib import Path

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent))

from parse_deal_transfer import DealTransferParser
from parse_proposal import ProposalParser
from generate_mermaid import ArchitectureGenerator


def generate_architecture_from_file(input_file, output_dir=None):
    """
    Main function to generate architecture from Deal Transfer or Proposal Template
    
    Args:
        input_file: Path to Deal Transfer or Proposal Template file
        output_dir: Output directory (default: same as input file)
    """
    input_file = Path(input_file)
    
    if not input_file.exists():
        print(f"Error: Input file not found: {input_file}")
        return None
    
    print(f"📄 Processing file: {input_file.name}")
    
    # Determine file type and parse accordingly
    file_ext = input_file.suffix.lower()
    # Check file name first
    file_name_lower = input_file.name.lower()
    is_deal_transfer = (
        'deal' in file_name_lower or 
        'transfer' in file_name_lower or
        file_ext in ['.xlsx', '.xls']
    )
    
    # Also check content for Deal Transfer patterns
    if not is_deal_transfer:
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                content_preview = f.read(500)
                if any(keyword in content_preview for keyword in [
                    'Does client have stable internet connection',
                    'Any GDPR or data privacy requirements',
                    'Any specific HW/SW requirements such as deployment method',
                    'List of VA use cases'
                ]):
                    is_deal_transfer = True
        except:
            pass
    
    if is_deal_transfer:
        print("📋 Detected: Deal Transfer file")
        parser = DealTransferParser(input_file)
    else:
        print("📋 Detected: Proposal Template file")
        parser = ProposalParser(input_file)
    
    project_info = parser.parse()
    
    # Validate required fields - NO DEFAULT VALUES, raise errors instead
    errors = []
    if not project_info.get("num_cameras"):
        errors.append("Camera number (num_cameras)")
    
    if not project_info.get("ai_modules") or len(project_info.get("ai_modules", [])) == 0:
        errors.append("AI modules list")
    
    if not project_info.get("deployment_method") or project_info.get("deployment_method", "").startswith("[MISSING"):
        errors.append("Deployment method")
    
    if not project_info.get("client_name") or project_info.get("client_name", "").startswith("[MISSING"):
        errors.append("Client name")
    
    if errors:
        print("\n" + "="*80)
        print("❌ ERROR: Required fields not found in template")
        print("="*80)
        for error in errors:
            print(f"   - {error}")
        print("\n⚠️  Cannot generate architecture without these required fields.")
        print("   Please check the template and ensure all required fields are present.")
        print("   Do NOT use default values - all values must be extracted from the template.")
        print("="*80 + "\n")
        return None
    
    # Print extracted information
    print("\n" + "="*80)
    print("EXTRACTED PROJECT INFORMATION")
    print("="*80)
    print(json.dumps(project_info, indent=2, ensure_ascii=False))
    print("="*80 + "\n")
    
    # Generate JSON file
    if output_dir is None:
        output_dir = input_file.parent
    else:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
    
    json_file = output_dir / f"{input_file.stem}_project_info.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump({"project_info": project_info}, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved project info to: {json_file}")
    
    # Generate Mermaid diagram
    print("\n🎨 Generating Mermaid architecture diagram...")
    generator = ArchitectureGenerator(project_info)
    mermaid_code = generator.generate()
    
    # Save Mermaid diagram
    mermaid_file = output_dir / f"{input_file.stem}_architecture_diagram.md"
    with open(mermaid_file, 'w', encoding='utf-8') as f:
        f.write(f"# System Architecture: {project_info['project_name']}\n\n")
        f.write(f"**Client:** {project_info.get('client_name', 'N/A')}\n\n")
        f.write(f"**Deployment Method:** {project_info['deployment_method'].upper().replace('-', ' ')}\n\n")
        f.write(f"**Cameras:** {project_info['num_cameras']}\n\n")
        f.write(f"**AI Modules:** {len(project_info['ai_modules'])}\n\n")
        f.write("---\n\n")
        f.write("## Architecture Diagram\n\n")
        f.write("```mermaid\n")
        f.write(mermaid_code)
        f.write("\n```\n")
    
    print(f"✅ Saved architecture diagram to: {mermaid_file}")
    
    # Print summary
    print("\n" + "="*80)
    print("GENERATION SUMMARY")
    print("="*80)
    print(f"Project: {project_info['project_name']}")
    print(f"Deployment: {project_info['deployment_method'].upper().replace('-', ' ')}")
    print(f"Cameras: {project_info['num_cameras']}")
    print(f"AI Modules: {len(project_info['ai_modules'])}")
    print(f"Alert Methods: {', '.join(project_info['alert_methods'])}")
    print("="*80)
    print(f"\n📁 Output files:")
    print(f"   - JSON: {json_file}")
    print(f"   - Diagram: {mermaid_file}")
    print(f"\n💡 View diagram at: https://mermaid.live")
    print("   Or open the .md file in VS Code with Mermaid extension")
    print("="*80 + "\n")
    
    return {
        "json_file": json_file,
        "mermaid_file": mermaid_file,
        "project_info": project_info
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 generate_from_deal_transfer.py <input_file> [output_dir]")
        print("\nSupports:")
        print("  - Deal Transfer files (.txt, .md, .xlsx)")
        print("  - Proposal Template files (.md)")
        print("\nExample:")
        print("  python3 generate_from_deal_transfer.py Deal_Transfer_Shell.txt")
        print("  python3 generate_from_deal_transfer.py proposal_template.md ./output")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    generate_architecture_from_file(input_file, output_dir)

