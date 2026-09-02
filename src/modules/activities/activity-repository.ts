export interface ActivityEntity {
  id: string;
  organizationId: string;
  leadId: string;
  actorUserId?: string | null;
  type:
    | "LEAD_CREATED"
    | "EMAIL_SENT"
    | "EMAIL_DELIVERED"
    | "EMAIL_OPENED"
    | "EMAIL_CLICKED"
    | "EMAIL_REPLIED"
    | "CALL_COMPLETED"
    | "NOTE_ADDED"
    | "PROPOSAL_SENT"
    | "PROPOSAL_VIEWED"
    | "FOLLOWUP_CREATED"
    | "FOLLOWUP_COMPLETED"
    | "STATUS_CHANGED";
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export class ActivityRepository {
  private static activitiesStore: ActivityEntity[] = [
    {
      id: "act_101",
      organizationId: "org_demo_1",
      leadId: "lead_101",
      actorUserId: "usr_owner_1",
      type: "LEAD_CREATED",
      metadata: { source: "CSV Import" },
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "act_102",
      organizationId: "org_demo_1",
      leadId: "lead_101",
      actorUserId: "usr_owner_1",
      type: "NOTE_ADDED",
      metadata: { note: "Interested in enterprise plan for 50 seats." },
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  async createActivity(
    orgId: string,
    data: {
      leadId: string;
      actorUserId?: string | null;
      type: ActivityEntity["type"];
      metadata?: Record<string, any>;
    }
  ): Promise<ActivityEntity> {
    const newActivity: ActivityEntity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      leadId: data.leadId,
      actorUserId: data.actorUserId || null,
      type: data.type,
      metadata: data.metadata || null,
      createdAt: new Date().toISOString(),
    };

    ActivityRepository.activitiesStore.push(newActivity);
    return newActivity;
  }

  async findActivitiesByLead(
    orgId: string,
    leadId: string,
    options?: { limit?: number }
  ): Promise<ActivityEntity[]> {
    const filtered = ActivityRepository.activitiesStore.filter(
      (a) => a.organizationId === orgId && a.leadId === leadId
    );

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (options?.limit && options.limit > 0) {
      return filtered.slice(0, Math.min(options.limit, 100));
    }

    return filtered;
  }

  async findActivitiesByOrg(
    orgId: string,
    options?: { limit?: number }
  ): Promise<ActivityEntity[]> {
    const filtered = ActivityRepository.activitiesStore.filter(
      (a) => a.organizationId === orgId
    );

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (options?.limit && options.limit > 0) {
      return filtered.slice(0, Math.min(options.limit, 100));
    }

    return filtered;
  }
}

export const activityRepository = new ActivityRepository();
