import json

try:
    with open('results.json', 'r') as f:
        data = json.load(f)
        for entry in data:
            if entry['errorCount'] > 0 or entry['warningCount'] > 0:
                print(f"File: {entry['filePath']}")
                for msg in entry['messages']:
                    print(f"  Line {msg.get('line', '?')}: {msg.get('message', 'no message')} ({msg.get('ruleId', 'no rule')})")
except Exception as e:
    print(f"Error: {e}")
