"""
CiliumNetworkPolicy YAML Generator
Generates Kubernetes CiliumNetworkPolicy YAML from grouped flow data
"""

import yaml


def generate_policy(grouped_flows, policy_name):
    """
    Generate CiliumNetworkPolicy YAML from grouped flows
    
    Args:
        grouped_flows: Dictionary of flows grouped by destination
        policy_name: Name for the policy
        
    Returns:
        YAML string of CiliumNetworkPolicy
    """
    # Take the first destination group (in real scenarios, might generate multiple policies)
    if not grouped_flows:
        raise ValueError("No flows provided for policy generation")
    
    # Get the first destination group
    dest_key = list(grouped_flows.keys())[0]
    flow_group = grouped_flows[dest_key]
    
    # Build policy dictionary
    policy = {
        'apiVersion': 'cilium.io/v2',
        'kind': 'CiliumNetworkPolicy',
        'metadata': {
            'name': policy_name,
            'namespace': flow_group['destination_namespace']
        },
        'spec': {
            'endpointSelector': create_endpoint_selector(flow_group['destination_labels']),
            'ingress': create_ingress_rules(flow_group['ingress_from'])
        }
    }
    
    # Convert to YAML
    return format_yaml(policy)


def create_endpoint_selector(labels):
    """
    Create endpointSelector from labels
    
    Args:
        labels: Dictionary of labels
        
    Returns:
        Dictionary with matchLabels
    """
    if not labels:
        return {'matchLabels': {}}
    
    return {
        'matchLabels': labels
    }


def create_ingress_rules(ingress_from):
    """
    Create ingress rules from grouped source connections
    
    Args:
        ingress_from: Dictionary of source connections
        
    Returns:
        List of ingress rule dictionaries
    """
    rules = []
    
    for source_key, source_data in ingress_from.items():
        rule = {
            'fromEndpoints': [
                {
                    'matchLabels': source_data['source_labels']
                }
            ]
        }
        
        # Add port rules if ports exist
        if source_data['ports']:
            rule['toPorts'] = create_port_rules(source_data['ports'], source_data['http_rules'])
        
        rules.append(rule)
    
    return rules


def create_port_rules(ports, http_rules):
    """
    Create toPorts rules from port set and HTTP rules
    
    Args:
        ports: Set of (port, protocol) tuples
        http_rules: List of HTTP rule dictionaries
        
    Returns:
        List of port rule dictionaries
    """
    port_rules = []
    
    for port, protocol in ports:
        port_rule = {
            'ports': [
                {
                    'port': str(port),
                    'protocol': protocol
                }
            ]
        }
        
        # Add HTTP rules if they exist and protocol is TCP
        if http_rules and protocol == 'TCP':
            port_rule['rules'] = {
                'http': [
                    {
                        'method': rule['method'],
                        'path': rule['path']
                    }
                    for rule in http_rules
                ]
            }
        
        port_rules.append(port_rule)
    
    return port_rules


def create_egress_rules(connections):
    """
    Create egress rules (placeholder for future implementation)
    
    Args:
        connections: Dictionary of egress connections
        
    Returns:
        List of egress rule dictionaries
    """
    # Future implementation for egress rules
    return []


def format_yaml(policy_dict):
    """
    Convert policy dictionary to YAML string
    
    Args:
        policy_dict: Policy dictionary
        
    Returns:
        Formatted YAML string
    """
    return yaml.dump(
        policy_dict,
        default_flow_style=False,
        sort_keys=False,
        allow_unicode=True
    )
