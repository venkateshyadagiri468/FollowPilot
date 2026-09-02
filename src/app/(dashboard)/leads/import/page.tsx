"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/modules/store/app-context";
import {
  parseCsvFile,
  processCsvImport,
  ColumnMapping,
  CsvParseResult,
  CsvImportResult,
} from "@/modules/leads/csv-importer";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Check,
  X,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function CsvImportPage() {
  const router = useRouter();
  const { leads, bulkAddLeads, org, user } = useApp();

  const [step, setStep] = useState<"UPLOAD" | "MAP" | "RESULT">("UPLOAD");
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    jobTitle: "",
    status: "",
  });
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);

  // Sample CSV template loader
  const handleLoadSampleCsv = () => {
    const sample = `name,email,company,phone,title,status
John Smith,john@acme.com,Acme Technologies,+1 555-019-2834,VP Engineering,REPLIED
Sarah Connor,sarah@xyzsolutions.io,XYZ Solutions,+1 555-014-9921,Head of Product,PROPOSAL
Marcus Vance,marcus@nexusdynamics.com,Nexus Dynamics,+1 555-017-3320,Director Sales Ops,QUALIFIED
Elena Rostova,elena@starlight.co,Starlight Interactive,+1 555-012-4411,Founder & CEO,CONTACTED
Invalid Lead,invalid-email-address,Broken Inc,,Developer,NEW
John Smith,john@acme.com,Duplicate Acme,,VP Engineering,NEW`;

    setFileName("sample_sales_leads.csv");
    setFileContent(sample);
    const parsed = parseCsvFile(sample);
    setParseResult(parsed);
    setMapping(parsed.detectedMapping);
    setStep("MAP");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setFileContent(text);
      const parsed = parseCsvFile(text);
      setParseResult(parsed);
      setMapping(parsed.detectedMapping);
      setStep("MAP");
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!mapping.email) {
      toast.error("Please map the required Email column");
      return;
    }

    const result = processCsvImport(
      fileContent,
      mapping,
      leads,
      org.id,
      user.id,
      user.name
    );

    setImportResult(result);
    if (result.importedLeads.length > 0) {
      bulkAddLeads(result.importedLeads);
    }
    setStep("RESULT");
    toast.success(`Successfully imported ${result.importedCount} leads!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          CSV Lead Importer
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Import bulk prospects from CSV files with automatic column detection and deduplication.
        </p>
      </div>

      {/* Wizard Step Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-semibold">
        <div className={`flex items-center gap-2 ${step === "UPLOAD" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
          <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px]">1</span>
          <span>Upload File</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-2 ${step === "MAP" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
          <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px]">2</span>
          <span>Map Columns</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-2 ${step === "RESULT" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
          <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px]">3</span>
          <span>Import Summary</span>
        </div>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === "UPLOAD" && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-12 text-center bg-white dark:bg-slate-900 transition-colors">
            <UploadCloud className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Upload your CSV lead list
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Drag & drop your CSV file here, or click browse. Works with standard CRM exports.
            </p>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg cursor-pointer shadow-xs transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Browse CSV File</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Quick Demo Sample Action */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                  Don't have a CSV handy?
                </h4>
                <p className="text-[11px] text-slate-500">
                  Load a sample dataset with valid leads, invalid rows, and duplicate detection.
                </p>
              </div>
            </div>
            <button
              onClick={handleLoadSampleCsv}
              className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-semibold text-xs rounded-lg transition-colors shrink-0"
            >
              Load Sample CSV
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING & PREVIEW */}
      {step === "MAP" && parseResult && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Column Mapping ({fileName})
                </h3>
                <p className="text-xs text-slate-500">
                  Detected {parseResult.totalRows} rows. Match your CSV headers to FollowPilot fields.
                </p>
              </div>
              <button
                onClick={() => setStep("UPLOAD")}
                className="text-xs text-slate-500 hover:underline"
              >
                Change file
              </button>
            </div>

            {/* Column Dropdown Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <select
                  value={mapping.email}
                  onChange={(e) => setMapping({ ...mapping, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                >
                  <option value="">-- Select Column --</option>
                  {parseResult.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  First Name / Full Name
                </label>
                <select
                  value={mapping.firstName}
                  onChange={(e) => setMapping({ ...mapping, firstName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                >
                  <option value="">-- Select Column --</option>
                  {parseResult.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Last Name
                </label>
                <select
                  value={mapping.lastName}
                  onChange={(e) => setMapping({ ...mapping, lastName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                >
                  <option value="">-- Select Column --</option>
                  {parseResult.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company Name
                </label>
                <select
                  value={mapping.company}
                  onChange={(e) => setMapping({ ...mapping, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                >
                  <option value="">-- Select Column --</option>
                  {parseResult.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Title
                </label>
                <select
                  value={mapping.jobTitle}
                  onChange={(e) => setMapping({ ...mapping, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                >
                  <option value="">-- Select Column --</option>
                  {parseResult.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <select
                  value={mapping.phone}
                  onChange={(e) => setMapping({ ...mapping, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                >
                  <option value="">-- Select Column --</option>
                  {parseResult.headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview Data Grid */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                First 5 Sample Rows Preview
              </h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                    <tr>
                      {parseResult.headers.map((h) => (
                        <th key={h} className="py-2 px-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parseResult.previewRows.map((row, idx) => (
                      <tr key={idx}>
                        {parseResult.headers.map((h) => (
                          <td key={h} className="py-2 px-3 text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                            {row[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep("UPLOAD")}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium text-xs"
            >
              Back
            </button>

            <button
              onClick={handleConfirmImport}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Confirm & Import Leads</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: RESULT SUMMARY */}
      {step === "RESULT" && importResult && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6 shadow-2xs">
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Import Partial Execution Complete
              </h3>
              <p className="text-xs text-slate-500">
                Processed {importResult.totalProcessed} total rows from CSV.
              </p>
            </div>
          </div>

          {/* Breakdown Stat Cards */}
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center">
              <span className="block text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {importResult.importedCount}
              </span>
              <span className="text-emerald-800 dark:text-emerald-400 font-semibold uppercase text-[10px]">
                Valid & Imported
              </span>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
              <span className="block text-2xl font-bold text-amber-700 dark:text-amber-300">
                {importResult.duplicateCount}
              </span>
              <span className="text-amber-800 dark:text-amber-400 font-semibold uppercase text-[10px]">
                Duplicates Skipped
              </span>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg p-3 text-center">
              <span className="block text-2xl font-bold text-rose-700 dark:text-rose-300">
                {importResult.invalidCount}
              </span>
              <span className="text-rose-800 dark:text-rose-400 font-semibold uppercase text-[10px]">
                Invalid Rows
              </span>
            </div>
          </div>

          {/* Error Table if any */}
          {importResult.errors.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Skipped Row Log
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 max-h-40 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700 text-xs">
                {importResult.errors.map((err, idx) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Row {err.rowIndex}: {err.email || "No Email"}
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 text-[11px]">
                      {err.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={() => setStep("UPLOAD")}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-semibold text-xs"
            >
              Import Another File
            </button>
            <Link
              href="/leads"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors"
            >
              View Imported Leads →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
