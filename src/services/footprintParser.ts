import * as StellarSdk from "@stellar/stellar-sdk";

/**
 * Types of ledger keys that can appear in a footprint
 */
export type LedgerKeyType =
  | "ContractData"
  | "ContractCode"
  | "Account"
  | "TrustLine"
  | "Unknown";

/**
 * A footprint entry with its type and extracted data
 */
export interface FootprintEntry {
  /** The raw base64 XDR of the entry */
  xdr: string;
  /** The classified type of the ledger key */
  type: LedgerKeyType;
  /** The contract ID if this is a ContractData or ContractCode entry */
  contractId?: string;
}

/**
 * Get the switch name for a ledger key
 */
function getLedgerKeySwitchName(key: StellarSdk.xdr.LedgerKey): string {
  return key.switch().name;
}

/**
 * Parse a single footprint entry XDR and extract its contract ID
 * @param xdrBase64 - The base64 encoded XDR string
 * @returns The decoded contract ID if this is a ContractData or ContractCode entry
 */
function extractContractId(xdrBase64: string): string | undefined {
  try {
    const ledgerKey = StellarSdk.xdr.LedgerKey.fromXDR(xdrBase64, "base64");
    const switchName = getLedgerKeySwitchName(ledgerKey);

    // Check if this is a ContractData or ContractCode entry
    if (switchName === "ledgerKeyContractData") {
      const contractData = ledgerKey.contractData();
      return contractData.contract().value().toString("hex");
    }

    if (switchName === "ledgerKeyContractCode") {
      const contractCode = ledgerKey.contractCode();
      return contractCode.hash().toString("hex");
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Classify a ledger key XDR into its type
 * @param xdrBase64 - The base64 encoded XDR string
 * @returns The type of the ledger key
 */
function classifyEntryType(xdrBase64: string): LedgerKeyType {
  try {
    const ledgerKey = StellarSdk.xdr.LedgerKey.fromXDR(xdrBase64, "base64");
    const switchName = getLedgerKeySwitchName(ledgerKey);

    switch (switchName) {
      case "ledgerKeyContractData":
        return "ContractData";
      case "ledgerKeyContractCode":
        return "ContractCode";
      case "ledgerKeyAccount":
        return "Account";
      case "ledgerKeyTrustLine":
        return "TrustLine";
      default:
        return "Unknown";
    }
  } catch {
    return "Unknown";
  }
}

/**
 * Parse footprint entries and extract contract IDs
 * @param footprintEntries - Array of base64 XDR strings
 * @returns Array of footprint entries with type and contract ID
 */
export function parseFootprintEntries(entries: string[]): FootprintEntry[] {
  return entries.map((xdr) => {
    const type = classifyEntryType(xdr);
    const contractId = extractContractId(xdr);

    return {
      xdr,
      type,
      contractId,
    };
  });
}

/**
 * Extract all unique contract IDs from footprint entries
 * @param footprintEntries - Array of base64 XDR strings
 * @returns Array of unique contract IDs
 */
export function extractContracts(footprintEntries: string[]): string[] {
  const parsed = parseFootprintEntries(footprintEntries);
  const contractIds = new Set<string>();

  for (const entry of parsed) {
    if (entry.contractId) {
      contractIds.add(entry.contractId);
    }
  }

  return Array.from(contractIds);
}

/**
 * Parse both readOnly and readWrite footprint arrays
 * @param footprint - Object with readOnly and readWrite arrays
 * @returns Object with parsed entries and contracts array
 */
export function parseFootprint(footprint: {
  readOnly: string[];
  readWrite: string[];
}): {
  readOnly: FootprintEntry[];
  readWrite: FootprintEntry[];
  contracts: string[];
} {
  const allEntries = [...footprint.readOnly, ...footprint.readWrite];
  const contracts = extractContracts(allEntries);

  return {
    readOnly: parseFootprintEntries(footprint.readOnly),
    readWrite: parseFootprintEntries(footprint.readWrite),
    contracts,
  };
}
