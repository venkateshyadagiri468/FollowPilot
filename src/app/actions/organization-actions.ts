"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/actions/create-safe-action";
import { organizationService } from "@/modules/organizations/organization-service";
import { invitationService } from "@/modules/organizations/invitation-service";
import { memberService } from "@/modules/organizations/member-service";
import { Role } from "@/lib/permissions";

const createOrgSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
});

export const createOrganizationAction = createSafeAction(
  createOrgSchema,
  async (input, context) => {
    return organizationService.createOrganization(context.userId, input.name);
  }
);

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address format"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]),
});

export const inviteMemberAction = createSafeAction(
  inviteMemberSchema,
  async (input, context) => {
    return invitationService.inviteMember({
      orgId: context.orgId,
      inviterUserId: context.userId,
      inviterRole: context.role,
      email: input.email,
      role: input.role as Role,
    });
  },
  { requiredPermission: "manage_members" }
);

const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
});

export const acceptInvitationAction = createSafeAction(
  acceptInvitationSchema,
  async (input, context) => {
    return invitationService.acceptInvitation(input.token, context.userId);
  }
);

const updateMemberRoleSchema = z.object({
  targetMembershipId: z.string().min(1, "Membership ID is required"),
  newRole: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]),
});

export const updateMemberRoleAction = createSafeAction(
  updateMemberRoleSchema,
  async (input, context) => {
    return memberService.updateRole({
      orgId: context.orgId,
      actorUserId: context.userId,
      actorRole: context.role,
      targetMembershipId: input.targetMembershipId,
      newRole: input.newRole as Role,
    });
  },
  { requiredPermission: "manage_members" }
);

const removeMemberSchema = z.object({
  targetMembershipId: z.string().min(1, "Membership ID is required"),
});

export const removeMemberAction = createSafeAction(
  removeMemberSchema,
  async (input, context) => {
    await memberService.removeMember({
      orgId: context.orgId,
      actorUserId: context.userId,
      actorRole: context.role,
      targetMembershipId: input.targetMembershipId,
    });
    return { success: true };
  },
  { requiredPermission: "manage_members" }
);
