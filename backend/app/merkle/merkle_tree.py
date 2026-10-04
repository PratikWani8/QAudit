import math
from typing import List, Dict, Any, Optional, Tuple
from app.crypto.canonical import sha3_256_hex

class MerkleTreeNode:
    def __init__(self, hash_val: str, left: Optional['MerkleTreeNode'] = None, right: Optional['MerkleTreeNode'] = None):
        self.hash_val = hash_val
        self.left = left
        self.right = right

class MerkleTree:
    """
    Standard binary Merkle Tree implementation using SHA3-256:
    - Leaves are SHA3-256 hashes of canonical evidence records.
    - Non-leaves are SHA3-256(left_child + right_child).
    - If odd number of nodes at any level, duplicate the last node (RFC 6962 / Bitcoin style).
    - Generates auditable inclusion proofs with explicit sibling directions.
    """
    def __init__(self, leaf_hashes: List[str]):
        if not leaf_hashes:
            # Handle empty tree
            self.leaves = [sha3_256_hex("EMPTY_TREE")]
        else:
            self.leaves = list(leaf_hashes)
        
        self.root_node: Optional[MerkleTreeNode] = None
        self.levels: List[List[str]] = []
        self._build_tree()

    def _hash_pair(self, left: str, right: str) -> str:
        # Canonical leaf / internal node domain separation or ordered pair
        combined = (left + right).encode('utf-8')
        return sha3_256_hex(combined)

    def _build_tree(self):
        current_level = self.leaves[:]
        self.levels = [current_level]

        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                if i + 1 < len(current_level):
                    right = current_level[i + 1]
                else:
                    # Duplicate last node if odd
                    right = left
                parent = self._hash_pair(left, right)
                next_level.append(parent)
            current_level = next_level
            self.levels.append(current_level)

        self.root_hash = self.levels[-1][0]

    def get_root(self) -> str:
        return self.root_hash

    def get_proof(self, leaf_hash: str) -> Optional[List[Dict[str, str]]]:
        """
        Generates inclusion proof path for a leaf hash:
        Returns list of { 'sibling_hash': ..., 'direction': 'left' | 'right' }
        """
        try:
            index = self.leaves.index(leaf_hash)
        except ValueError:
            return None

        proof = []
        for level in self.levels[:-1]: # All except root
            is_right_sibling = (index % 2 == 0)
            if is_right_sibling:
                # Sibling is on the right
                sibling_index = index + 1 if index + 1 < len(level) else index
                direction = "right"
            else:
                # Sibling is on the left
                sibling_index = index - 1
                direction = "left"

            proof.append({
                "sibling_hash": level[sibling_index],
                "direction": direction
            })
            index = index // 2

        return proof

    @staticmethod
    def verify_proof(leaf_hash: str, proof: List[Dict[str, str]], expected_root: str) -> bool:
        """
        Independently verifies a Merkle proof against an expected root.
        Can run on backend or be mirrored in TypeScript in frontend.
        """
        current = leaf_hash
        for step in proof:
            sibling = step["sibling_hash"]
            direction = step["direction"]
            if direction == "right":
                current = sha3_256_hex((current + sibling).encode('utf-8'))
            else:
                current = sha3_256_hex((sibling + current).encode('utf-8'))
        return current.lower() == expected_root.lower()
