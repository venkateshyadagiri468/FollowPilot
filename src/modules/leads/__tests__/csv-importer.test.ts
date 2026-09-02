import { parseCsvFile, processCsvImport } from "../csv-importer";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("=== Running CSV Importer & Deduplication Unit Tests ===");

const sampleCsv = `First Name,Last Name,Email,Company,Job Title
Alex,Mercer,alex@acme.com,Acme Corp,CTO
John,Doe,invalid-email,Broken Inc,Developer
Alex,Mercer,alex@acme.com,Acme Corp,CTO`;

// Test 1: Header detection & mapping
const parsed = parseCsvFile(sampleCsv);
assert(parsed.headers.includes("Email"), "Headers should include Email");
assert(parsed.detectedMapping.email === "Email", "Mapping should auto-detect Email");
assert(parsed.detectedMapping.firstName === "First Name", "Mapping should auto-detect First Name");

// Test 2: Import execution with deduplication and validation
const importResult = processCsvImport(
  sampleCsv,
  parsed.detectedMapping,
  [], // no existing leads
  "org_1",
  "user_1",
  "Demo User"
);

console.log("Import Result Summary:", {
  totalProcessed: importResult.totalProcessed,
  importedCount: importResult.importedCount,
  duplicateCount: importResult.duplicateCount,
  invalidCount: importResult.invalidCount,
});

assert(importResult.importedCount === 1, "Expected 1 valid imported lead");
assert(importResult.invalidCount === 1, "Expected 1 invalid email error");
assert(importResult.duplicateCount === 1, "Expected 1 duplicate email skipped");

console.log("✅ All CSV Importer unit tests passed!");
