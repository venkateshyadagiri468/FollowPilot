import { TenantContext } from "../auth/tenant-context";
import { leadRepository, LeadQueryFilter, LeadEntity } from "./repository";
import { validateStatusTransition, LeadStatus } from "./lead-state-machine";
import { calculateLeadScore } from "../scoring/score-engine";
import { requirePermission } from "@/lib/permissions";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logging";

export class LeadService {
  async getLeads(context: TenantContext, filter?: LeadQueryFilter) {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "view_leads"
    );

    return leadRepository.findLeadsByOrg(context.activeOrgId, filter);
  }

  async getLeadDetails(context: TenantContext, leadId: string) {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "view_leads"
    );

    const lead = await leadRepository.findLeadById(context.activeOrgId, leadId);
    if (!lead) {
      throw new NotFoundError(`Lead ${leadId} not found in organization`);
    }

    const activities = await leadRepository.getActivities(context.activeOrgId, leadId);
    return { lead, activities };
  }

  async createLead(
    context: TenantContext,
    input: {
      firstName: string;
      lastName: string;
      email: string;
      company?: string;
      phone?: string;
      jobTitle?: string;
    }
  ): Promise<LeadEntity> {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "create_leads"
    );

    const cleanEmail = input.email.toLowerCase().trim();
    if (!cleanEmail.includes("@")) {
      throw new ValidationError("Invalid email address format");
    }

    const partialLead: Partial<LeadEntity> = {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: cleanEmail,
      company: input.company?.trim(),
      phone: input.phone?.trim(),
      jobTitle: input.jobTitle?.trim(),
      status: "NEW",
      lastActivityAt: new Date().toISOString(),
    };

    const scoreBreakdown = calculateLeadScore(partialLead as any, [], "UNKNOWN");

    const createdLead = await leadRepository.createLead(context.activeOrgId, {
      ...partialLead,
      firstName: partialLead.firstName!,
      lastName: partialLead.lastName!,
      email: partialLead.email!,
      status: "NEW",
      score: scoreBreakdown.score,
      priority: scoreBreakdown.priority,
      lastActivityAt: new Date().toISOString(),
    });

    // Record Activity Timeline Entry
    await leadRepository.createActivity(context.activeOrgId, {
      leadId: createdLead.id,
      actorUserId: context.userId,
      actorName: context.user.name,
      type: "LEAD_CREATED",
      metadata: { source: "Manual Input" },
    });

    logger.info("Lead created", {
      orgId: context.activeOrgId,
      leadId: createdLead.id,
      email: createdLead.email,
    });

    return createdLead;
  }

  async updateLeadStatus(
    context: TenantContext,
    leadId: string,
    newStatus: LeadStatus
  ): Promise<LeadEntity> {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "edit_leads"
    );

    const existingLead = await leadRepository.findLeadById(context.activeOrgId, leadId);
    if (!existingLead) {
      throw new NotFoundError(`Lead ${leadId} not found`);
    }

    validateStatusTransition(existingLead.status, newStatus);

    const activities = await leadRepository.getActivities(context.activeOrgId, leadId);
    const leadForScore = { ...existingLead, status: newStatus, assignedToUserId: existingLead.assignedToUserId || undefined };
    const scoreBreakdown = calculateLeadScore(leadForScore as any, activities as any, "UNKNOWN");

    const updated = await leadRepository.updateLead(context.activeOrgId, leadId, {
      status: newStatus,
      score: scoreBreakdown.score,
      priority: scoreBreakdown.priority,
      lastActivityAt: new Date().toISOString(),
    });

    // Record Status Changed Activity Timeline Entry
    await leadRepository.createActivity(context.activeOrgId, {
      leadId,
      actorUserId: context.userId,
      actorName: context.user.name,
      type: "STATUS_CHANGED",
      metadata: { from: existingLead.status, to: newStatus },
    });

    logger.info("Lead status updated", {
      orgId: context.activeOrgId,
      leadId,
      fromStatus: existingLead.status,
      toStatus: newStatus,
    });

    return updated;
  }

  async assignLead(
    context: TenantContext,
    leadId: string,
    targetUserId: string | null
  ): Promise<LeadEntity> {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "edit_leads"
    );

    const existing = await leadRepository.findLeadById(context.activeOrgId, leadId);
    if (!existing) {
      throw new NotFoundError(`Lead ${leadId} not found`);
    }

    if (targetUserId) {
      const { organizationRepository } = await import("../organizations/repository");
      const targetMemberships = await organizationRepository.getUserMemberships(targetUserId);
      const belongsToOrg = targetMemberships.some((m) => m.organizationId === context.activeOrgId);
      if (!belongsToOrg) {
        throw new ValidationError(`Target user '${targetUserId}' does not belong to organization '${context.activeOrgId}'`);
      }
    }

    const updated = await leadRepository.updateLead(context.activeOrgId, leadId, {
      assignedToUserId: targetUserId,
      lastActivityAt: new Date().toISOString(),
    });

    logger.info("lead.owner_changed", {
      event: "lead.owner_changed",
      orgId: context.activeOrgId,
      leadId,
      actorUserId: context.userId,
      targetUserId,
    });

    return updated;
  }

  async deleteLead(context: TenantContext, leadId: string): Promise<void> {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "edit_leads"
    );

    const existing = await leadRepository.findLeadById(context.activeOrgId, leadId);
    if (!existing) {
      throw new NotFoundError(`Lead ${leadId} not found`);
    }

    await leadRepository.deleteLead(context.activeOrgId, leadId);
    logger.info("lead.deleted", {
      event: "lead.deleted",
      orgId: context.activeOrgId,
      leadId,
      actorUserId: context.userId,
    });
  }
}

export const leadService = new LeadService();
