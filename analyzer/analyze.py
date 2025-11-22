#!/usr/bin/env python3
"""
Hubble Flow Log Analyzer
Reads Hubble flow logs from stdin and generates CiliumNetworkPolicy YAML
"""

import sys
import json
from collections import defaultdict
from generate_policy import generate_policy


def main():
    """Main entry point - reads JSON from stdin and orchestrates analysis"""
    try:
        # Read JSON input from stdin
        input_data = sys.stdin.read()
        flows = json.loads(input_data)
        
        if not flows or not isinstance(flows, list):
            print("Error: Input must be a non-empty array of flow objects", file=sys.stderr)
            sys.exit(1)
        
        # Parse flows and extract endpoints
        parsed_flows = parse_flows(flows)
        
        # Group flows by connection (source -> destination)
        grouped_flows = group_by_connection(parsed_flows)
        
        # Generate policy name from first flow
        policy_name = generate_policy_name(parsed_flows)
        
        # Generate CiliumNetworkPolicy YAML
        policy_yaml = generate_policy(grouped_flows, policy_name)
        
        # Output YAML to stdout
        print(policy_yaml)
        
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input - {str(e)}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


def parse_flows(flows):
    """
    Parse Hubble flow JSON and extract relevant information
    
    Args:
        flows: List of Hubble flow objects
        
    Returns:
        List of parsed flow dictionaries
    """
    parsed = []
    
    for flow in flows:
        try:
            parsed_flow = extract_endpoints(flow)
            if parsed_flow:
                parsed.append(parsed_flow)
        except Exception as e:
            print(f"Warning: Failed to parse flow {flow.get('flow_id', 'unknown')}: {str(e)}", file=sys.stderr)
            continue
    
    return parsed


def extract_endpoints(flow):
    """
    Extract source and destination endpoint information from a flow
    
    Args:
        flow: Single Hubble flow object
        
    Returns:
        Dictionary with extracted endpoint information
    """
    source = flow.get('source', {})
    destination = flow.get('destination', {})
    l4 = flow.get('l4', {})
    l7 = flow.get('l7', {})
    
    # Extract port and protocol
    port = None
    protocol = None
    
    if 'TCP' in l4:
        protocol = 'TCP'
        port = l4['TCP'].get('destination_port')
    elif 'UDP' in l4:
        protocol = 'UDP'
        port = l4['UDP'].get('destination_port')
    
    # Extract HTTP information if available
    http_method = None
    http_path = None
    if 'http' in l7:
        http_method = l7['http'].get('method')
        http_path = l7['http'].get('path')
    
    return {
        'flow_id': flow.get('flow_id'),
        'timestamp': flow.get('timestamp'),
        'source_namespace': source.get('namespace'),
        'source_pod': source.get('pod'),
        'source_labels': source.get('labels', {}),
        'destination_namespace': destination.get('namespace'),
        'destination_pod': destination.get('pod'),
        'destination_labels': destination.get('labels', {}),
        'port': port,
        'protocol': protocol,
        'http_method': http_method,
        'http_path': http_path
    }


def group_by_connection(flows):
    """
    Group flows by source -> destination connection
    
    Args:
        flows: List of parsed flow dictionaries
        
    Returns:
        Dictionary grouped by destination labels, containing source connections
    """
    # Group by destination labels (the endpoint being protected)
    grouped = defaultdict(lambda: {
        'destination_namespace': None,
        'destination_labels': {},
        'ingress_from': defaultdict(lambda: {
            'source_labels': {},
            'ports': set(),
            'http_rules': []
        })
    })
    
    for flow in flows:
        dest_labels_key = json.dumps(flow['destination_labels'], sort_keys=True)
        
        # Set destination info
        grouped[dest_labels_key]['destination_namespace'] = flow['destination_namespace']
        grouped[dest_labels_key]['destination_labels'] = flow['destination_labels']
        
        # Group ingress rules by source labels
        source_labels_key = json.dumps(flow['source_labels'], sort_keys=True)
        ingress = grouped[dest_labels_key]['ingress_from'][source_labels_key]
        
        ingress['source_labels'] = flow['source_labels']
        
        # Add port if available
        if flow['port'] and flow['protocol']:
            ingress['ports'].add((flow['port'], flow['protocol']))
        
        # Add HTTP rule if available
        if flow['http_method'] and flow['http_path']:
            http_rule = {
                'method': flow['http_method'],
                'path': flow['http_path']
            }
            if http_rule not in ingress['http_rules']:
                ingress['http_rules'].append(http_rule)
    
    return grouped


def generate_policy_name(flows):
    """
    Generate a policy name based on the destination service
    
    Args:
        flows: List of parsed flows
        
    Returns:
        String policy name
    """
    if not flows:
        return 'generated-policy'
    
    # Use the most common destination app label
    dest_apps = [f['destination_labels'].get('app') for f in flows if f['destination_labels'].get('app')]
    
    if dest_apps:
        most_common = max(set(dest_apps), key=dest_apps.count)
        return f"{most_common}-policy"
    
    return 'generated-policy'


if __name__ == '__main__':
    main()
