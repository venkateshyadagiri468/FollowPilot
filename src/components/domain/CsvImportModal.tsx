"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertTriangle, X, Loader2, ArrowRight } from "lucide-react";
import { parseCsvFile, ColumnMapping, CsvParseResult, CsvImportResult } from "@/modules/leads/csv-importer";
import { importLeadsCsvAction } from "@/app/actions/lead-actions";
import { useApp } from "@/modules/store/app-context";
import { toast } from "sonner";

interface CsvImportModalProps {
  onClose: () => void;
}

export function CsvImportModal({ onClose }: CsvImportModalProps) {
  const { bulkAddLeads } = useApp();
  const [step, setStep] = useState<"UPLOAD" | "MAP" | "REPORT">("UPLOAD");
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
  const [dedupStrategy, setDedupStrategy] = useState<"SKIP_DUPLICATE" | "UPDATE_EXISTING" | "ALLOW_DUPLICATE">("SKIP_DUPLICATE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setFileContent(content);
        const result = parseCsvFile(content);
        setParseResult(result);
        setMapping(result.detectedMapping);
        setStep("MAP");
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCsv = () => {
    const sample = `First Name,Last Name,Email,Company,Job Title,Phone,Status
Marcus,Vance,marcus@acme.com,Acme Corp,VP of Engineering,+1 555-0192,NEW
Sophia,Chen,sophia@technova.io,TechNova,Chief Product Officer,+1 555-0143,CONTACTED
David,Miller,david@apexsolutions.com,Apex Solutions,Head of Sales,+1 555-0188,QUALIFIED`;
    setFileName("sample_enterprise_leads.csv");
    setFileContent(sample);
    const result = parseCsvFile(sample);
    setParseResult(result);
    setMapping(result.detectedMapping);
    setStep("MAP");
  };

  const handleExecuteImport = async () => {
    if (!fileContent || !mapping.email) {
      toast.error("Email column mapping is required");
      return;
    }

    setIsSubmitting(true);
    const result = await importLeadsCsvAction(
      { csvContent: fileContent, mapping, dedupStrategy },
      { userId: "usr_demo_1", orgId: "org_demo_1", role: "OWNER" }
    );
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.data) {
      setImportResult(result.data as CsvImportResult);
      if (result.data.importedLeads && result.data.importedLeads.length > 0) {
        bulkAddLeads(result.data.importedLeads as any);
      }
      setStep("REPORT");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12151E] border border-[#1E2332] rounded-2xl p-6 max-w-2xl w-full space-y-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2332] pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">CSV Lead Ingestion Engine</h3>
              <p className="text-xs text-slate-400">Import, validate & deduplicate sales leads into workspace</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Upload */}
        {step === "UPLOAD" && (
          <div className="space-y-6 py-4">
            <div className="border-2 border-dashed border-[#2A3144] hover:border-indigo-500 rounded-2xl p-8 text-center space-y-4 transition-colors cursor-pointer relative bg-[#0B0C10]/50">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Drop your CSV file here or <span className="text-indigo-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-400">Supports standard UTF-8 encoded CSV files up to 5,000 rows</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleLoadSampleCsv}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Load Sample Enterprise Leads CSV
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Mapping & Strategy */}
        {step === "MAP" && parseResult && (
          <div className="space-y-6">
            <div className="bg-[#0B0C10] p-3 rounded-lg border border-[#2A3144] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-200">{fileName}</span>
              </div>
              <span className="text-slate-400">{parseResult.totalRows} rows detected</span>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Column Mapping
              </h4>

              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                {(["firstName", "lastName", "email", "company", "phone", "jobTitle", "status"] as const).map((field) => (
                  <div key={field} className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300 capitalize">
                      {field} {field === "email" && <span className="text-red-400">*</span>}
                    </label>
                    <select
                      value={mapping[field] || ""}
                      onChange={(e) => setMapping((prev) => ({ ...prev, [field]: e.target.value }))}
                      className="w-full bg-[#0B0C10] border border-[#2A3144] rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Ignore Field --</option>
                      {parseResult.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#1E2332]">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Deduplication Strategy
              </label>
              <select
                value={dedupStrategy}
                onChange={(e) => setDedupStrategy(e.target.value as any)}
                className="w-full bg-[#0B0C10] border border-[#2A3144] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="SKIP_DUPLICATE">SKIP DUPLICATES — Ignore existing emails</option>
                <option value="UPDATE_EXISTING">UPDATE EXISTING — Refresh details if email exists</option>
                <option value="ALLOW_DUPLICATE">ALLOW DUPLICATES — Insert all rows regardless</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("UPLOAD")}
                className="px-4 py-2 text-xs border border-[#2A3144] rounded-lg text-slate-300 hover:bg-[#1E2332]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isSubmitting || !mapping.email}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 shadow-lg shadow-indigo-600/20"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Process Import</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Report */}
        {step === "REPORT" && importResult && (
          <div className="space-y-6 py-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold">Import Processing Complete</h4>
                <p className="text-xs text-slate-400">Batched ingestion summary report</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-[#0B0C10] p-3 rounded-lg border border-[#2A3144]">
                <div className="text-xl font-bold text-slate-100">{importResult.totalProcessed}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Rows</div>
              </div>
              <div className="bg-[#0B0C10] p-3 rounded-lg border border-emerald-500/20">
                <div className="text-xl font-bold text-emerald-400">{importResult.importedCount}</div>
                <div className="text-[10px] text-emerald-500 uppercase font-semibold">Imported</div>
              </div>
              <div className="bg-[#0B0C10] p-3 rounded-lg border border-amber-500/20">
                <div className="text-xl font-bold text-amber-400">{importResult.duplicateCount}</div>
                <div className="text-[10px] text-amber-500 uppercase font-semibold">Duplicates</div>
              </div>
              <div className="bg-[#0B0C10] p-3 rounded-lg border border-red-500/20">
                <div className="text-xl font-bold text-red-400">{importResult.invalidCount}</div>
                <div className="text-[10px] text-red-500 uppercase font-semibold">Invalid</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Skipped Row Logs ({importResult.errors.length})</span>
                </h5>
                <div className="max-h-32 overflow-y-auto bg-[#0B0C10] border border-[#2A3144] rounded-lg p-2 space-y-1 text-[11px]">
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="flex justify-between text-slate-400">
                      <span>Row {err.rowIndex}: {err.email || "N/A"}</span>
                      <span className="text-amber-400">{err.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
