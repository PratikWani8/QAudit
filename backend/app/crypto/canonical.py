import json
import hashlib
from typing import Any, Dict

def canonicalize_json(data: Any) -> str:
    """
    Produce RFC 8785 / deterministic canonical JSON representation:
    - Keys sorted recursively
    - Compact separators (no trailing spaces)
    - Deterministic UTF-8 representation
    """
    return json.dumps(
        data,
        sort_keys=True,
        separators=(',', ':'),
        ensure_ascii=False
    )

def sha3_256_hex(data: bytes | str) -> str:
    """
    Compute SHA3-256 cryptographic digest using Python's standard hashlib.
    Returns hex string.
    """
    if isinstance(data, str):
        data = data.encode('utf-8')
    return hashlib.sha3_256(data).hexdigest()

def sha3_512_hex(data: bytes | str) -> str:
    """
    Compute SHA3-512 cryptographic digest.
    Returns hex string.
    """
    if isinstance(data, str):
        data = data.encode('utf-8')
    return hashlib.sha3_512(data).hexdigest()
