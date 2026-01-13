#!/usr/bin/env python3
"""
Extract data from Deal Transfer Excel file.

Usage:
    python extract_deal_transfer.py <excel_file>

Output:
    JSON with S1 and S2 data
"""

import pandas as pd
import json
import sys
from pathlib import Path

def extract_deal_transfer(excel_path):
    """Extract S1 and S2 sheets from Deal Transfer."""
    try:
        xls = pd.ExcelFile(excel_path)
        
        # Read S1 and S2 sheets
        s1 = pd.read_excel(excel_path, sheet_name='Commercial')
        s2 = pd.read_excel(excel_path, sheet_name='Technical')
        
        # Convert to dict for easier access
        result = {
            'sheets': xls.sheet_names,
            'S1': {
                'columns': s1.columns.tolist(),
                'data': s1.to_dict('records')
            },
            'S2': {
                'columns': s2.columns.tolist(),
                'data': s2.to_dict('records')
            }
        }
        
        return result
    except FileNotFoundError:
        return {'error': f'File not found: {excel_path}'}
    except ValueError as e:
        return {'error': f'Sheet not found: {str(e)}'}
    except Exception as e:
        return {'error': f'Error reading file: {str(e)}'}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: extract_deal_transfer.py <excel_file>")
        sys.exit(1)
    
    excel_file = sys.argv[1]
    result = extract_deal_transfer(excel_file)
    
    if 'error' in result:
        print(f"Error: {result['error']}", file=sys.stderr)
        sys.exit(1)
    
    print(json.dumps(result, indent=2, default=str))

