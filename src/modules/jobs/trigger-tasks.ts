export interface TaskDefinition<TParams = any, TResult = any> {
  id: string;
  run: (params: TParams) => Promise<TResult>;
}

export const processCsvImportJob: TaskDefinition<{ csvContent: string; orgId: string }> = {
  id: "process-csv-import",
  async run({ csvContent, orgId }) {
    console.log(`[Trigger.dev Job: processCsvImport] Processing CSV import for org ${orgId}...`);
    // Simulated background task execution
    return { status: "COMPLETED", processedRows: 982 };
  },
};

export const analyzeLeadJob: TaskDefinition<{ leadId: string; orgId: string }> = {
  id: "analyze-lead-job",
  async run({ leadId, orgId }) {
    console.log(`[Trigger.dev Job: analyzeLeadJob] Analyzing context for lead ${leadId}...`);
    return { status: "COMPLETED", leadId };
  },
};

export const sendEmailJob: TaskDefinition<{ emailId: string; idempotencyKey: string }> = {
  id: "send-email-job",
  async run({ emailId, idempotencyKey }) {
    console.log(`[Trigger.dev Job: sendEmailJob] Sending email ${emailId} via Resend...`);
    return { status: "SENT", idempotencyKey };
  },
};

export const recalculateLeadScoresJob: TaskDefinition<{ orgId: string }> = {
  id: "recalculate-lead-scores-cron",
  async run({ orgId }) {
    console.log(`[Trigger.dev Cron] Recalculating lead inactivity decay for org ${orgId}...`);
    return { status: "COMPLETED" };
  },
};
