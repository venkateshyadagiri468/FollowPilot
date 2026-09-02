import Papa from "papaparse";
import { MockLead } from "../store/mock-store";
import { calculateLeadScore } from "../scoring/score-engine";
import { ValidationError } from "@/lib/errors";

export interface ColumnMapping {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  jobTitle: string;
  status: string;
}

export interface CsvRowError {
  rowIndex: number;
  email?: string;
  reason: string;
}

export interface CsvParseResult {
  headers: string[];
  detectedMapping: ColumnMapping;
  totalRows: number;
  previewRows: Record<string, string>[];
}

export interface CsvImportResult {
  totalProcessed: number;
  importedCount: number;
  duplicateCount: number;
  invalidCount: number;
  importedLeads: MockLead[];
  errors: CsvRowError[];
}

export const CSV_LIMITS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  MAX_ROW_COUNT: 5000,
  MAX_FIELD_LENGTH: 500,
};

export function sanitizeFormulaInjection(val: string): string {
  if (!val) return val;
  const trimmed = val.trim();
  if (/^[=+@\-\t\r]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}

export function parseCsvFile(csvContent: string): CsvParseResult {
  if (csvContent.length > CSV_LIMITS.MAX_FILE_SIZE_BYTES) {
    throw new ValidationError(
      `CSV file exceeds maximum size limit of ${CSV_LIMITS.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`
    );
  }

  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const headers = parsed.meta.fields || [];

  if (parsed.data.length > CSV_LIMITS.MAX_ROW_COUNT) {
    throw new ValidationError(
      `CSV row count (${parsed.data.length}) exceeds maximum limit of ${CSV_LIMITS.MAX_ROW_COUNT} rows`
    );
  }

  // Intelligent column detection
  const detectedMapping: ColumnMapping = {
    firstName: detectColumn(headers, ["first_name", "firstname", "first name", "given_name", "name"]),
    lastName: detectColumn(headers, ["last_name", "lastname", "last name", "surname"]),
    email: detectColumn(headers, ["email", "e-mail", "email_address", "work_email"]),
    company: detectColumn(headers, ["company", "company_name", "organization", "account"]),
    phone: detectColumn(headers, ["phone", "phone_number", "mobile", "cell"]),
    jobTitle: detectColumn(headers, ["title", "job_title", "role", "position"]),
    status: detectColumn(headers, ["status", "lead_status", "stage"]),
  };

  return {
    headers,
    detectedMapping,
    totalRows: parsed.data.length,
    previewRows: parsed.data.slice(0, 5),
  };
}

function detectColumn(headers: string[], candidates: string[]): string {
  const normalizedHeaders = headers.map((h) => ({ original: h, lower: h.toLowerCase() }));
  for (const candidate of candidates) {
    const match = normalizedHeaders.find((h) => h.lower === candidate || h.lower.includes(candidate));
    if (match) return match.original;
  }
  return "";
}

export function processCsvImport(
  csvContent: string,
  mapping: ColumnMapping,
  existingLeads: MockLead[],
  orgId: string,
  assignedUserId: string,
  assignedUserName: string,
  dedupStrategy: "SKIP_DUPLICATE" | "UPDATE_EXISTING" | "ALLOW_DUPLICATE" = "SKIP_DUPLICATE"
): CsvImportResult {
  if (csvContent.length > CSV_LIMITS.MAX_FILE_SIZE_BYTES) {
    throw new ValidationError(
      `CSV file exceeds maximum size limit of ${CSV_LIMITS.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`
    );
  }

  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data;

  if (rows.length > CSV_LIMITS.MAX_ROW_COUNT) {
    throw new ValidationError(
      `CSV row count (${rows.length}) exceeds maximum limit of ${CSV_LIMITS.MAX_ROW_COUNT} rows`
    );
  }

  const existingEmails = new Set(existingLeads.map((l) => l.email.toLowerCase().trim()));
  const importedLeads: MockLead[] = [];
  const errors: CsvRowError[] = [];
  let duplicateCount = 0;
  let invalidCount = 0;

  rows.forEach((row, index) => {
    const rowIndex = index + 1;

    // Extract mapped values & sanitize formula injection
    const rawEmail = (row[mapping.email] || "").trim().toLowerCase();
    let rawFirstName = sanitizeFormulaInjection((row[mapping.firstName] || "").trim());
    let rawLastName = sanitizeFormulaInjection((row[mapping.lastName] || "").trim());

    // Split name if single "name" column was mapped to firstName
    if (!rawLastName && rawFirstName.includes(" ")) {
      const parts = rawFirstName.split(" ");
      rawFirstName = parts[0];
      rawLastName = parts.slice(1).join(" ");
    }

    const company = sanitizeFormulaInjection((row[mapping.company] || "").trim()) || "Unknown Company";
    const phone = sanitizeFormulaInjection((row[mapping.phone] || "").trim());
    const jobTitle = sanitizeFormulaInjection((row[mapping.jobTitle] || "").trim()) || "Lead";
    const rawStatus = (row[mapping.status] || "NEW").trim().toUpperCase();

    // Field length check
    if (
      rawFirstName.length > CSV_LIMITS.MAX_FIELD_LENGTH ||
      rawLastName.length > CSV_LIMITS.MAX_FIELD_LENGTH ||
      company.length > CSV_LIMITS.MAX_FIELD_LENGTH
    ) {
      invalidCount++;
      errors.push({
        rowIndex,
        email: rawEmail || undefined,
        reason: `Field length exceeds maximum limit of ${CSV_LIMITS.MAX_FIELD_LENGTH} characters`,
      });
      return;
    }

    // Email validation
    if (!rawEmail || !rawEmail.includes("@")) {
      invalidCount++;
      errors.push({
        rowIndex,
        email: rawEmail || undefined,
        reason: "Invalid or missing email address",
      });
      return;
    }

    const lowerEmail = rawEmail;

    // Duplicate detection
    if (existingEmails.has(lowerEmail)) {
      if (dedupStrategy === "SKIP_DUPLICATE") {
        duplicateCount++;
        errors.push({
          rowIndex,
          email: rawEmail,
          reason: "Duplicate lead email already exists in organization",
        });
        return;
      }
    } else {
      existingEmails.add(lowerEmail);
    }

    const validStatus = [
      "NEW",
      "CONTACTED",
      "REPLIED",
      "QUALIFIED",
      "PROPOSAL",
      "WON",
      "LOST",
      "DORMANT",
    ].includes(rawStatus)
      ? (rawStatus as MockLead["status"])
      : "NEW";

    const newLeadPartial: Partial<MockLead> = {
      firstName: rawFirstName || "Valued",
      lastName: rawLastName || "Lead",
      email: rawEmail,
      company,
      phone,
      jobTitle,
      status: validStatus,
      lastActivityAt: new Date().toISOString(),
    };

    const scoreBreakdown = calculateLeadScore(newLeadPartial, [], "UNKNOWN");

    const newLead: MockLead = {
      id: `lead_csv_${Date.now()}_${index}`,
      organizationId: orgId,
      assignedToUserId: assignedUserId,
      assignedToName: assignedUserName,
      firstName: newLeadPartial.firstName!,
      lastName: newLeadPartial.lastName!,
      email: rawEmail,
      company,
      phone,
      jobTitle,
      status: validStatus,
      score: scoreBreakdown.score,
      priority: scoreBreakdown.priority,
      lastActivityAt: new Date().toISOString(),
      nextFollowupAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    importedLeads.push(newLead);
  });

  return {
    totalProcessed: rows.length,
    importedCount: importedLeads.length,
    duplicateCount,
    invalidCount,
    importedLeads,
    errors,
  };
}
