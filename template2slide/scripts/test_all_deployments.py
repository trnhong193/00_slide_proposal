#!/usr/bin/env python3
"""
Test script to generate architecture diagrams for all deployment methods
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from generate_from_deal_transfer import generate_architecture_from_file


def test_all_deployments():
    """Generate architecture diagrams for all deployment methods"""
    
    test_files = [
        ("test_cloud_deployment.txt", "Cloud"),
        ("test_hybrid_inference_local.txt", "Hybrid (AI Inference at Site)"),
        ("test_hybrid_training_local.txt", "Hybrid (Training at Site)"),
        ("test_onpremise_deployment.txt", "On-Premise"),
        ("test_4g_vpn_bridge.txt", "4G VPN Bridge"),
        ("test_vimov_deployment.txt", "viMov"),
    ]
    
    test_dir = Path(__file__).parent.parent / "test_inputs"
    output_dir = Path(__file__).parent.parent / "test_outputs"
    output_dir.mkdir(exist_ok=True)
    
    print("=" * 80)
    print("TESTING ALL DEPLOYMENT METHODS")
    print("=" * 80)
    print()
    
    results = []
    
    for test_file, method_name in test_files:
        test_path = test_dir / test_file
        
        if not test_path.exists():
            print(f"⚠️  Skipping {test_file} - file not found")
            continue
        
        print(f"\n{'='*80}")
        print(f"Testing: {method_name}")
        print(f"File: {test_file}")
        print(f"{'='*80}\n")
        
        try:
            result = generate_architecture_from_file(test_path, output_dir)
            if result:
                results.append((method_name, test_file, "✅ SUCCESS", result['mermaid_file']))
            else:
                results.append((method_name, test_file, "❌ FAILED", None))
        except Exception as e:
            print(f"❌ Error: {e}")
            results.append((method_name, test_file, f"❌ ERROR: {e}", None))
    
    # Print summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print()
    
    for method_name, test_file, status, mermaid_file in results:
        print(f"{status} {method_name:30s} - {test_file}")
        if mermaid_file:
            print(f"   Output: {mermaid_file}")
    
    print("\n" + "=" * 80)
    print(f"Total: {len(results)} tests")
    print(f"Success: {sum(1 for r in results if 'SUCCESS' in r[2])}")
    print(f"Failed: {sum(1 for r in results if 'FAILED' in r[2] or 'ERROR' in r[2])}")
    print("=" * 80)
    
    return results


if __name__ == "__main__":
    test_all_deployments()

