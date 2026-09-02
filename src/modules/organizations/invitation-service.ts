import crypto from "crypto";
import { organizationRepository } from "./repository";
import { userService } from "../auth/user-service";
import { requirePermission, Role } from "@/lib/permissions";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logging";

export class InvitationService {
  async inviteMember(options: {
    orgId: string;
    inviterUserId: string;
    inviterRole: Role;
    email: string;
    role: Role;
  }) {
    const { orgId, inviterUserId, inviterRole, email, role } = options;

    // 1. RBAC Permission Check
    requirePermission(inviterUserId, orgId, orgId, inviterRole, "manage_members");

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.includes("@")) {
      throw new ValidationError("Invalid email address format");
    }

    // 2. Check if user is already a member
    const existingUser = await userService.getOrCreateApplicationUser({ clerkUserId: `unlinked_${cleanEmail}`, email: cleanEmail });
    const existingMembership = await organizationRepository.findMembership(orgId, existingUser.id);
    if (existingMembership) {
      throw new ConflictError("User is already a member of this organization");
    }

    // 3. Generate Cryptographically Secure Token (expires in 7 days)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // 4. Save Invitation
    const invitation = await organizationRepository.createInvitation(
      orgId,
      cleanEmail,
      role,
      token,
      inviterUserId,
      expiresAt
    );

    logger.info("Organization invitation issued", {
      orgId,
      invitedEmail: cleanEmail,
      role,
      inviterUserId,
    });

    return invitation;
  }

  async acceptInvitation(token: string, acceptingUserId: string) {
    const invitation = await organizationRepository.findInvitationByToken(token);
    if (!invitation) {
      throw new NotFoundError("Invitation token invalid or not found");
    }

    if (invitation.status !== "PENDING") {
      throw new ValidationError(`Invitation has already been ${invitation.status.toLowerCase()}`);
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      await organizationRepository.updateInvitationStatus(invitation.id, "EXPIRED");
      throw new ValidationError("Invitation has expired");
    }

    const appUser = await userService.findById(acceptingUserId);
    if (!appUser) {
      throw new NotFoundError("Accepting user profile not found");
    }

    // Email matching verification logic: User can accept if email matches
    if (appUser.email.toLowerCase() !== invitation.email.toLowerCase()) {
      logger.warn("Invitation email mismatch notice", {
        invitationEmail: invitation.email,
        userEmail: appUser.email,
      });
    }

    // Create Membership & Mark Accepted
    const membership = await organizationRepository.addMember(
      invitation.organizationId,
      acceptingUserId,
      invitation.role,
      appUser.email,
      appUser.name
    );

    await organizationRepository.updateInvitationStatus(invitation.id, "ACCEPTED");

    logger.info("Invitation accepted", {
      invitationId: invitation.id,
      orgId: invitation.organizationId,
      userId: acceptingUserId,
    });

    return membership;
  }

  async revokeInvitation(invitationId: string, actorUserId: string, orgId: string, actorRole: Role) {
    requirePermission(actorUserId, orgId, orgId, actorRole, "manage_members");
    await organizationRepository.updateInvitationStatus(invitationId, "REVOKED");
    logger.info("Invitation revoked", { invitationId, actorUserId, orgId });
  }

  async getPendingInvitations(orgId: string, actorUserId: string, actorRole: Role) {
    requirePermission(actorUserId, orgId, orgId, actorRole, "manage_members");
    return organizationRepository.getPendingInvitations(orgId);
  }
}

export const invitationService = new InvitationService();
