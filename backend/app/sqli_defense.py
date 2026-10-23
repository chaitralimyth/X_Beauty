import re
import urllib.parse
from typing import Any, Optional

SQLI_SIGNATURES = [
    (r"(?i)(?:'|\"|\b)\s*(?:or|and)\s+['\"]?[a-zA-Z0-9_]+['\"]?\s*=\s*['\"]?[a-zA-Z0-9_]+", "SQL boolean tautology"),
    (r"(?i)(?:'|\"|\b)\s*(?:or|and)\s+(?:true|false|\d+)\s*(?:--|#|/\*)", "SQL boolean tautology with trailing comment"),
    (r"(?i)(?:'|\")\s*(?:or|and)\s*['\"]['\"]\s*=\s*['\"]", "SQL empty string tautology"),
    (r"(?i)admin['\"]\s*(?:--|#|/\*)", "SQL authentication comment bypass"),
    (r"(?i)\bunion\s+(?:all\s+)?select\b", "SQL UNION SELECT injection"),
    (r"(?i);\s*(?:drop\s+table|delete\s+from|insert\s+into|update\s+\w+\s+set|truncate\s+table|alter\s+table)\b", "SQL stacked destructive query"),
    (r"(?i);\s*(?:exec|execute)\s*\(", "SQL stacked command execution"),
    (r"(?i)['\"](?:\s*;\s*|\s+)(?:--|#|/\*)", "SQL quote termination with comment delimiter"),
    (r"(?i)\b(?:select|union|having|where)\b.*(?:--|#)", "SQL keyword sequence with comment"),
    (r"(?i)\b(?:sleep|benchmark|waitfor\s+delay|pg_sleep)\s*\(", "Time-based blind SQL injection"),
    (r"(?i)\b(?:information_schema|sqlite_master|sys\.tables)\b", "Database schema metadata enumeration probe"),
]

def check_sqli_attack(text_val: Any) -> Optional[str]:
    """Inspect string or nested structures for confirmed SQL injection patterns."""
    if not text_val:
        return None
    if isinstance(text_val, str):
        decoded = urllib.parse.unquote(text_val)
        for pattern, name in SQLI_SIGNATURES:
            if re.search(pattern, decoded):
                return name
        return None
    elif isinstance(text_val, dict):
        for k, v in text_val.items():
            res = check_sqli_attack(k) or check_sqli_attack(v)
            if res:
                return res
    elif isinstance(text_val, (list, tuple, set)):
        for item in text_val:
            res = check_sqli_attack(item)
            if res:
                return res
    return None
