import { TenantContext } from "../auth/tenant-context";
import { activityRepository, ActivityEntity } from "./activity-repository";
import { requirePermission } from "@/lib/permissions";
import { logger } from "@/lib/logging";

export class ActivityService {
  async logActivity(
    context: TenantContext,
    input: {
      leadId: string;
      type: ActivityEntity["type"];
      metadata?: Record<string, any>;
    }
  ): Promise<ActivityEntity> {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "edit_leads"
    );

    const activity = await activityRepository.createActivity(context.activeOrgId, {
      leadId: input.leadId,
      actorUserId: context.userId,
      type: input.type,
      metadata: input.metadata,
    });

    logger.info("activity.logged", {
      event: "activity.logged",
      orgId: context.activeOrgId,
      leadId: input.leadId,
      type: input.type,
      actorUserId: context.userId,
    });

    return activity;
  }

  async getLeadActivities(
    context: TenantContext,
    leadId: string,
    limit?: number
  ): Promise<ActivityEntity[]> {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "view_leads"
    );

    return activityRepository.findActivitiesByLead(context.activeOrgId, leadId, { limit });
  }

  async getOrgActivities(
    context: TenantContext,
    limit?: number
  ): Promise<ActivityEntity[]> {
    requirePermission(
      context.userId,
      context.activeOrgId,
      context.activeOrgId,
      context.role,
      "view_leads"
    );

    return activityRepository.findActivitiesByOrg(context.activeOrgId, { limit });
  }
}

export const activityService = new ActivityService();
