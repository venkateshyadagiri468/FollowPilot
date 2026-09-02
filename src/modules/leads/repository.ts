import { LeadStatus, validateStatusTransition } from "./lead-state-machine";

export interface LeadEntity {
  id: string;
  organizationId: string;
  assignedToUserId?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  status: LeadStatus;
  score: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  lastActivityAt: string;
  nextFollowupAt?: string | null;
  customFields?: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ActivityEntity {
  id: string;
  organizationId: string;
  leadId: string;
  actorUserId?: string | null;
  actorName?: string | null;
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

export interface LeadQueryFilter {
  status?: LeadStatus;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "score" | "lastActivityAt" | "createdAt";
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
}

// In-Memory Persistence Repository
export class LeadRepository {
  private static leadsStore: LeadEntity[] = [
    {
      id: "lead_demo_1",
      organizationId: "org_demo_1",
      firstName: "Alexander",
      lastName: "Wright",
      email: "alexander@nexuscorp.com",
      company: "Nexus Corp",
      jobTitle: "VP of Enterprise Infrastructure",
      phone: "+1 (555) 234-5678",
      status: "NEW",
      score: 85,
      priority: "HIGH",
      lastActivityAt: new Date().toISOString(),
      nextFollowupAt: new Date(Date.now() + 86400 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "lead_demo_2",
      organizationId: "org_demo_1",
      firstName: "Elena",
      lastName: "Rostova",
      email: "elena@vanguardlabs.io",
      company: "Vanguard Labs",
      jobTitle: "Director of Product Engineering",
      phone: "+1 (555) 876-5432",
      status: "CONTACTED",
      score: 62,
      priority: "MEDIUM",
      lastActivityAt: new Date(Date.now() - 86400 * 1000).toISOString(),
      nextFollowupAt: new Date(Date.now() + 2 * 86400 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private static activitiesStore: ActivityEntity[] = [];

  async findLeadsByOrg(orgId: string, filter?: LeadQueryFilter) {
    let result = LeadRepository.leadsStore.filter(
      (l) => l.organizationId === orgId && (filter?.includeDeleted ? true : !l.deletedAt)
    );

    if (filter?.status) {
      result = result.filter((l) => l.status === filter.status);
    }
    if (filter?.priority) {
      result = result.filter((l) => l.priority === filter.priority);
    }
    if (filter?.searchQuery) {
      const q = filter.searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.firstName.toLowerCase().includes(q) ||
          l.lastName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          (l.company && l.company.toLowerCase().includes(q))
      );
    }

    const sortBy = filter?.sortBy || "createdAt";
    const sortOrder = filter?.sortOrder || "desc";

    // Deterministic tie-breaker sorting (sortBy -> createdAt -> id)
    result.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      if (valA !== valB) {
        if (sortOrder === "desc") {
          return valA < valB ? 1 : -1;
        }
        return valA > valB ? 1 : -1;
      }

      // Tie-breaker 1: createdAt
      if (a.createdAt !== b.createdAt) {
        return a.createdAt < b.createdAt ? 1 : -1;
      }

      // Tie-breaker 2: id
      return a.id < b.id ? 1 : -1;
    });

    const page = Math.max(1, filter?.page || 1);
    const pageSize = Math.min(Math.max(1, filter?.pageSize || 20), 100);
    const totalCount = result.length;
    const paginated = result.slice((page - 1) * pageSize, page * pageSize);

    return {
      leads: paginated,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async findLeadById(orgId: string, leadId: string, includeDeleted = false): Promise<LeadEntity | null> {
    return (
      LeadRepository.leadsStore.find(
        (l) => l.organizationId === orgId && l.id === leadId && (includeDeleted ? true : !l.deletedAt)
      ) || null
    );
  }

  async findLeadByEmail(orgId: string, email: string, includeDeleted = false): Promise<LeadEntity | null> {
    const cleanEmail = email.toLowerCase().trim();
    return (
      LeadRepository.leadsStore.find(
        (l) => l.organizationId === orgId && l.email.toLowerCase() === cleanEmail && (includeDeleted ? true : !l.deletedAt)
      ) || null
    );
  }

  async createLead(
    orgId: string,
    data: Omit<LeadEntity, "id" | "organizationId" | "createdAt" | "updatedAt">
  ): Promise<LeadEntity> {
    const newLead: LeadEntity = {
      ...data,
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    LeadRepository.leadsStore.unshift(newLead);
    return newLead;
  }

  async updateLead(
    orgId: string,
    leadId: string,
    data: Partial<LeadEntity>
  ): Promise<LeadEntity> {
    const idx = LeadRepository.leadsStore.findIndex(
      (l) => l.organizationId === orgId && l.id === leadId && !l.deletedAt
    );
    if (idx === -1) {
      throw new Error(`Lead ${leadId} not found in organization ${orgId}`);
    }

    const updated = {
      ...LeadRepository.leadsStore[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    LeadRepository.leadsStore[idx] = updated;
    return updated;
  }

  async bulkUpdateStatus(orgId: string, leadIds: string[], newStatus: LeadStatus): Promise<number> {
    let count = 0;
    LeadRepository.leadsStore.forEach((lead) => {
      if (lead.organizationId === orgId && leadIds.includes(lead.id) && !lead.deletedAt) {
        validateStatusTransition(lead.status, newStatus);
        lead.status = newStatus;
        lead.updatedAt = new Date().toISOString();
        lead.lastActivityAt = new Date().toISOString();
        count++;
      }
    });
    return count;
  }

  async deleteLead(orgId: string, leadId: string): Promise<void> {
    const idx = LeadRepository.leadsStore.findIndex(
      (l) => l.organizationId === orgId && l.id === leadId
    );
    if (idx !== -1) {
      LeadRepository.leadsStore[idx].deletedAt = new Date().toISOString();
      LeadRepository.leadsStore[idx].updatedAt = new Date().toISOString();
    }
  }

  async bulkDeleteLeads(orgId: string, leadIds: string[]): Promise<number> {
    let count = 0;
    LeadRepository.leadsStore.forEach((lead) => {
      if (lead.organizationId === orgId && leadIds.includes(lead.id) && !lead.deletedAt) {
        lead.deletedAt = new Date().toISOString();
        lead.updatedAt = new Date().toISOString();
        count++;
      }
    });
    return count;
  }

  async getActivitiesForLead(orgId: string, leadId: string): Promise<ActivityEntity[]> {
    return LeadRepository.activitiesStore.filter(
      (a) => a.organizationId === orgId && a.leadId === leadId
    );
  }

  async unassignLeadsForMember(orgId: string, userId: string): Promise<number> {
    let unassignedCount = 0;
    LeadRepository.leadsStore.forEach((lead) => {
      if (lead.organizationId === orgId && lead.assignedToUserId === userId) {
        lead.assignedToUserId = null;
        lead.updatedAt = new Date().toISOString();
        unassignedCount++;
      }
    });
    return unassignedCount;
  }

  async getActivities(orgId: string, leadId: string): Promise<ActivityEntity[]> {
    return LeadRepository.activitiesStore.filter(
      (a) => a.organizationId === orgId && a.leadId === leadId
    );
  }

  async createActivity(
    orgId: string,
    data: Omit<ActivityEntity, "id" | "organizationId" | "createdAt">
  ): Promise<ActivityEntity> {
    const act: ActivityEntity = {
      ...data,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      createdAt: new Date().toISOString(),
    };

    LeadRepository.activitiesStore.unshift(act);
    return act;
  }
}

export const leadRepository = new LeadRepository();
