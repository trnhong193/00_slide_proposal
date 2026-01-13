#!/usr/bin/env python3
"""
Main script to generate architecture diagram from proposal template
Combines parse_proposal.py and generate_mermaid.py
"""

import sys
import json
from pathlib import Path

# Add parent directory to path to import modules
sys.path.insert(0, str(Path(__file__).parent))

from parse_proposal import ProposalParser
from generate_mermaid import ArchitectureGenerator


def generate_architecture_from_proposal(proposal_file, output_dir=None):
    """
    Main function to generate architecture from proposal template
    
    Args:
        proposal_file: Path to proposal markdown file
        output_dir: Output directory (default: same as proposal file)
    """
    proposal_file = Path(proposal_file)
    
    if not proposal_file.exists():
        print(f"Error: Proposal file not found: {proposal_file}")
        return None
    
    print(f"📄 Parsing proposal: {proposal_file.name}")
    
    # Parse proposal
    parser = ProposalParser(proposal_file)
    project_info = parser.parse()
    
    # Validate required fields
    if not project_info.get("num_cameras"):
        print("⚠️  Warning: Camera number not found. Please check the proposal.")
        return None
    
    if not project_info.get("ai_modules"):
        print("⚠️  Warning: AI modules not found. Please check the proposal.")
        return None
    
    # Print extracted information
    print("\n" + "="*80)
    print("EXTRACTED PROJECT INFORMATION")
    print("="*80)
    print(json.dumps(project_info, indent=2, ensure_ascii=False))
    print("="*80 + "\n")
    
    # Generate JSON file
    if output_dir is None:
        output_dir = proposal_file.parent
    else:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
    
    json_file = output_dir / f"{proposal_file.stem}_project_info.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump({"project_info": project_info}, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved project info to: {json_file}")
    
    # Generate Mermaid diagram
    print("\n🎨 Generating Mermaid architecture diagram...")
    generator = ArchitectureGenerator(project_info)
    mermaid_code = generator.generate()
    
    # Save Mermaid diagram
    mermaid_file = output_dir / f"{proposal_file.stem}_architecture_diagram.md"
    with open(mermaid_file, 'w', encoding='utf-8') as f:
        f.write(f"# System Architecture: {project_info['project_name']}\n\n")
        f.write(f"**Client:** {project_info.get('client_name', 'N/A')}\n\n")
        f.write(f"**Deployment Method:** {project_info['deployment_method'].upper()}\n\n")
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
    print(f"Deployment: {project_info['deployment_method'].upper()}")
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
        print("Usage: python3 generate_architecture.py <proposal_file.md> [output_dir]")
        print("\nExample:")
        print("  python3 generate_architecture.py Cedo_template.md")
        print("  python3 generate_architecture.py Medical_Lab_KSA_template.md ./output")
        sys.exit(1)
    
    proposal_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    generate_architecture_from_proposal(proposal_file, output_dir)

