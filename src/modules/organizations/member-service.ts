import { organizationRepository } from "./repository";
import { requirePermission, requireOrganizationMember, Role } from "@/lib/permissions";
import { AuthorizationError, ConflictError, NotFoundError } from "@/lib/errors";
import { logger } from "@/lib/logging";

export class MemberService {
  async getMembers(orgId: string, actorUserId: string, actorOrgId: string) {
    requireOrganizationMember(actorUserId, orgId, actorOrgId);
    return organizationRepository.getOrganizationMembers(orgId);
  }

  async updateRole(options: {
    orgId: string;
    actorUserId: string;
    actorRole: Role;
    targetMembershipId: string;
    newRole: Role;
  }) {
    const { orgId, actorUserId, actorRole, targetMembershipId, newRole } = options;

    // 1. RBAC Permission Check
    requirePermission(actorUserId, orgId, orgId, actorRole, "manage_members");

    const members = await organizationRepository.getOrganizationMembers(orgId);
    const targetMember = members.find((m) => m.id === targetMembershipId);

    if (!targetMember) {
      throw new NotFoundError("Target member not found in organization");
    }

    // 2. Business Constraint: Non-OWNER cannot grant or revoke OWNER role
    if ((newRole === "OWNER" || targetMember.role === "OWNER") && actorRole !== "OWNER") {
      throw new AuthorizationError("Only an organization OWNER can assign or revoke OWNER privileges");
    }

    // 3. Business Constraint: Cannot demote the last OWNER
    if (targetMember.role === "OWNER" && newRole !== "OWNER") {
      const ownerCount = members.filter((m) => m.role === "OWNER").length;
      if (ownerCount <= 1) {
        throw new ConflictError("Cannot demote the sole OWNER of an organization. Transfer ownership first.");
      }
    }

    const updated = await organizationRepository.updateMemberRole(targetMembershipId, newRole);
    logger.info("Member role updated", {
      orgId,
      actorUserId,
      targetUserId: targetMember.userId,
      oldRole: targetMember.role,
      newRole,
    });

    return updated;
  }

  async removeMember(options: {
    orgId: string;
    actorUserId: string;
    actorRole: Role;
    targetMembershipId: string;
  }) {
    const { orgId, actorUserId, actorRole, targetMembershipId } = options;

    requirePermission(actorUserId, orgId, orgId, actorRole, "manage_members");

    const members = await organizationRepository.getOrganizationMembers(orgId);
    const targetMember = members.find((m) => m.id === targetMembershipId);

    if (!targetMember) {
      throw new NotFoundError("Target member not found in organization");
    }

    // Business Constraint: Cannot remove sole OWNER
    if (targetMember.role === "OWNER") {
      const ownerCount = members.filter((m) => m.role === "OWNER").length;
      if (ownerCount <= 1) {
        throw new ConflictError("Cannot remove the sole OWNER of an organization.");
      }
    }

    await organizationRepository.removeMember(targetMembershipId);
    
    // Unassign any leads assigned to the removed member to prevent orphaned ownership
    const { leadRepository } = await import("../leads/repository");
    await leadRepository.unassignLeadsForMember(orgId, targetMember.userId);

    logger.info("Member removed from organization", {
      orgId,
      actorUserId,
      targetUserId: targetMember.userId,
    });
  }
}

export const memberService = new MemberService();
