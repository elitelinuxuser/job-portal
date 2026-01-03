// Centralized contract terms configuration
// Update this file to change contract terms across the entire application
// The database stores contract terms as a JSONB array of term IDs

export interface ContractTerm {
  id: string;
  label: string;
  description: string;
}

// Contract terms in the desired order:
// 1. SD card provided
// 2. Payment post shoot
// 3. Transportation allowance
// 4. Content posting rights
// 5. Advance Payment
export const CONTRACT_TERMS: ContractTerm[] = [
  {
    id: "sdCard",
    label: "SD Card Provided",
    description: "SD card will be provided for the shoot",
  },
  {
    id: "paymentAfterShot",
    label: "Payment Post Shoot",
    description: "Payment will be made after the shoot is completed",
  },
  {
    id: "transportationAllowance",
    label: "Transportation Allowance",
    description: "Transportation costs will be covered",
  },
  {
    id: "contentPosting",
    label: "Content Posting Rights",
    description: "Rights to post content on social media",
  },
  {
    id: "advancePayment",
    label: "Advance Payment",
    description: "Advance payment will be provided before the shoot",
  },
];

// Type for contract term IDs
export type ContractTermId = (typeof CONTRACT_TERMS)[number]["id"];

// Helper to get contract term by id
export function getContractTermById(id: string): ContractTerm | undefined {
  return CONTRACT_TERMS.find((term) => term.id === id);
}

// Helper to get contract term label by id
export function getContractTermLabel(id: string): string {
  return getContractTermById(id)?.label || id;
}

// Helper to get contract term description by id
export function getContractTermDescription(id: string): string {
  return getContractTermById(id)?.description || "";
}

// Helper to check if a term is selected in the contract terms array
export function hasContractTerm(
  terms: string[] | null | undefined,
  termId: string
): boolean {
  return terms?.includes(termId) ?? false;
}

// Helper to get all selected terms as ContractTerm objects (in correct order)
export function getSelectedContractTerms(
  termIds: string[] | null | undefined
): ContractTerm[] {
  if (!termIds) return [];
  return CONTRACT_TERMS.filter((term) => termIds.includes(term.id));
}

// Legacy field mapping for migration from boolean columns to JSONB array
export const LEGACY_FIELD_MAPPING: Record<string, string> = {
  contractSdCard: "sdCard",
  contractPaymentAfterShot: "paymentAfterShot",
  contractTransportationAllowance: "transportationAllowance",
  contractContentPosting: "contentPosting",
  contractAdvancePayment: "advancePayment",
  // Legacy fields that no longer exist but might be in old data
  contractContentOwnership: "contentOwnership",
};
