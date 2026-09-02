export interface BackgroundJobPayload {
  jobId: string;
  type: "CSV_IMPORT" | "AI_LEAD_ANALYSIS" | "SCHEDULED_FOLLOWUP_DISPATCH" | "EMAIL_DELIVERY";
  organizationId: string;
  payload: Record<string, any>;
  createdAt: string;
}

export class JobManager {
  async dispatchJob(job: Omit<BackgroundJobPayload, "jobId" | "createdAt">): Promise<{ jobId: string }> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    if (process.env.NODE_ENV === "development") {
      console.log(`[Trigger.dev Job Stub Dispatched] Type: ${job.type}, ID: ${jobId}`, job.payload);
    }
    return { jobId };
  }
}

export const jobManager = new JobManager();
