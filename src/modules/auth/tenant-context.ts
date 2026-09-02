import { requireAuth, requireOrganizationMember, Role } from "@/lib/permissions";
import { userService, ApplicationUser } from "./user-service";
import { organizationRepository } from "../organizations/repository";
import { OrganizationEntity, MembershipEntity } from "../organizations/types";
import { NotFoundError } from "@/lib/errors";

export interface TenantContext {
  user: ApplicationUser;
  userId: string;
  activeOrg: OrganizationEntity;
  activeOrgId: string;
  membership: MembershipEntity;
  role: Role;
}

export async function resolveTenantContext(
  clerkUserId: string | null | undefined,
  requestedOrgId?: string
): Promise<TenantContext> {
  // 1. Authenticate Clerk identity
  const authClerkId = requireAuth(clerkUserId);

  // 2. Resolve or provision FollowPilot application user
  const user = await userService.findByClerkUserId(authClerkId);
  if (!user) {
    throw new NotFoundError("Application user not provisioned");
  }

  // 3. Retrieve all user memberships
  const memberships = await organizationRepository.getUserMemberships(user.id);
  if (memberships.length === 0) {
    throw new NotFoundError("User does not belong to any organization");
  }

  // 4. Resolve active organization ID
  let activeOrgId = requestedOrgId;
  if (!activeOrgId || !memberships.some((m) => m.organizationId === activeOrgId)) {
    // Default to the first joined organization
    activeOrgId = memberships[0].organizationId;
  }

  // 5. Verify membership strictly
  const membership = memberships.find((m) => m.organizationId === activeOrgId);
  if (!membership) {
    throw new NotFoundError(`Membership not found for organization '${activeOrgId}'`);
  }

  requireOrganizationMember(user.id, activeOrgId, membership.organizationId);

  // 6. Fetch Organization Entity
  const activeOrg = await organizationRepository.findById(activeOrgId);
  if (!activeOrg) {
    throw new NotFoundError(`Organization '${activeOrgId}' not found`);
  }

  return {
    user,
    userId: user.id,
    activeOrg,
    activeOrgId: activeOrg.id,
    membership,
    role: membership.role,
  };
}
