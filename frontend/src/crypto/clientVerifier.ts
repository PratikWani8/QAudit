import { sha3_256 } from "js-sha3";
import { MerkleProofStep } from "../types";

/**
 * Independent Client-Side Verification:
 * Allows any voter, citizen, or external auditor to verify Merkle Proofs
 * and SHA-3 hashes completely client-side in their own web browser.
 */
export class ClientVerifier {
  /**
   * Computes SHA3-256 of string or canonical JSON.
   */
  public static sha3Hex(input: string): string {
    return sha3_256(input);
  }

  /**
   * Independently traverses the Merkle proof path to reconstruct the root hash.
   */
  public static verifyMerkleProof(
    leafHash: string,
    proofPath: MerkleProofStep[],
    expectedRoot: string
  ): {
    isValid: boolean;
    reconstructedRoot: string;
    steps: Array<{ step: number; direction: string; sibling: string; result: string }>;
  } {
    let current = leafHash.toLowerCase();
    const stepsLog = [];

    for (let i = 0; i < proofPath.length; i++) {
      const step = proofPath[i];
      const sibling = step.sibling_hash.toLowerCase();
      let combined: string;

      if (step.direction === "right") {
        combined = current + sibling;
      } else {
        combined = sibling + current;
      }

      current = sha3_256(combined).toLowerCase();
      stepsLog.push({
        step: i + 1,
        direction: step.direction,
        sibling,
        result: current,
      });
    }

    const isValid = current.toLowerCase() === expectedRoot.toLowerCase();
    return {
      isValid,
      reconstructedRoot: current,
      steps: stepsLog,
    };
  }

  /**
   * Verifies canonical payload hash match.
   */
  public static verifyPayloadHash(payload: Record<string, any>, expectedHash: string): boolean {
    const canonical = JSON.stringify(payload, Object.keys(payload).sort());
    const computed = sha3_256(canonical);
    return computed.toLowerCase() === expectedHash.toLowerCase();
  }
}
