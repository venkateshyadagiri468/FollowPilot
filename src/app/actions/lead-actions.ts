"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/actions/create-safe-action";
import { leadService } from "@/modules/leads/lead-service";
import { processCsvImport } from "@/modules/leads/csv-importer";
import { LeadStatus } from "@/modules/leads/lead-state-machine";
import { TenantContext } from "@/modules/auth/tenant-context";

function buildTenantContext(context: { userId: string; orgId: string; role: any }): TenantContext {
  return {
    userId: context.userId,
    activeOrgId: context.orgId,
    role: context.role,
    user: {
      id: context.userId,
      clerkUserId: `clerk_${context.userId}`,
      email: "user@organization.com",
      name: "Workspace Member",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    activeOrg: {
      id: context.orgId,
      name: "Workspace",
      slug: "workspace",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    membership: {
      id: `mem_${context.userId}`,
      organizationId: context.orgId,
      userId: context.userId,
      role: context.role,
      joinedAt: new Date().toISOString(),
    },
  };
}

const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address format"),
  company: z.string().optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
});

export const createLeadAction = createSafeAction(
  createLeadSchema,
  async (input, context) => {
    const tenantCtx = buildTenantContext(context);
    return leadService.createLead(tenantCtx, input);
  },
  { requiredPermission: "create_leads" }
);

const updateLeadStatusSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  newStatus: z.enum([
    "NEW",
    "CONTACTED",
    "REPLIED",
    "QUALIFIED",
    "PROPOSAL",
    "WON",
    "LOST",
    "DORMANT",
  ]),
});

export const updateLeadStatusAction = createSafeAction(
  updateLeadStatusSchema,
  async (input, context) => {
    const tenantCtx = buildTenantContext(context);
    return leadService.updateLeadStatus(
      tenantCtx,
      input.leadId,
      input.newStatus as LeadStatus
    );
  },
  { requiredPermission: "edit_leads" }
);

const deleteLeadSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
});

export const deleteLeadAction = createSafeAction(
  deleteLeadSchema,
  async (input, context) => {
    const tenantCtx = buildTenantContext(context);
    await leadService.deleteLead(tenantCtx, input.leadId);
    return { success: true };
  },
  { requiredPermission: "edit_leads" }
);

const importCsvSchema = z.object({
  csvContent: z.string().min(1, "CSV content cannot be empty"),
  mapping: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    company: z.string(),
    phone: z.string(),
    jobTitle: z.string(),
    status: z.string(),
  }),
  dedupStrategy: z.enum(["SKIP_DUPLICATE", "UPDATE_EXISTING", "ALLOW_DUPLICATE"]).optional(),
});

export const importLeadsCsvAction = createSafeAction(
  importCsvSchema,
  async (input, context) => {
    const tenantCtx = buildTenantContext(context);
    const existingLeadsResult = await leadService.getLeads(tenantCtx, { pageSize: 1000 });
    const result = processCsvImport(
      input.csvContent,
      input.mapping,
      existingLeadsResult.leads as any,
      tenantCtx.activeOrgId,
      tenantCtx.userId,
      tenantCtx.user.name,
      input.dedupStrategy || "SKIP_DUPLICATE"
    );

    return result;
  },
  { requiredPermission: "create_leads" }
);

const bulkUpdateStatusSchema = z.object({
  leadIds: z.array(z.string()).min(1, "At least one lead ID is required"),
  newStatus: z.enum([
    "NEW",
    "CONTACTED",
    "REPLIED",
    "QUALIFIED",
    "PROPOSAL",
    "WON",
    "LOST",
    "DORMANT",
  ]),
});

export const bulkUpdateLeadStatusAction = createSafeAction(
  bulkUpdateStatusSchema,
  async (input, context) => {
    const tenantCtx = buildTenantContext(context);
    return leadService.bulkUpdateStatus(
      tenantCtx,
      input.leadIds,
      input.newStatus as LeadStatus
    );
  },
  { requiredPermission: "edit_leads" }
);

const bulkDeleteLeadsSchema = z.object({
  leadIds: z.array(z.string()).min(1, "At least one lead ID is required"),
});

export const bulkDeleteLeadsAction = createSafeAction(
  bulkDeleteLeadsSchema,
  async (input, context) => {
    const tenantCtx = buildTenantContext(context);
    return leadService.bulkDeleteLeads(tenantCtx, input.leadIds);
  },
  { requiredPermission: "edit_leads" }
);
