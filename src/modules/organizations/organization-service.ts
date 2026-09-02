import { organizationRepository } from "./repository";
import { userService } from "../auth/user-service";
import { requireAuth, requireOrganizationMember, Role } from "@/lib/permissions";
import { NotFoundError, ValidationError } from "@/lib/errors";

export class OrganizationService {
  async createOrganization(userId: string, name: string) {
    requireAuth(userId);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      throw new ValidationError("Organization name must be at least 2 characters long");
    }

    const appUser = await userService.findById(userId);

    // Create organization and initial OWNER membership in an atomic transaction
    const { organization, membership } = await organizationRepository.createOrganizationWithOwner(
      trimmedName,
      userId,
      appUser?.email,
      appUser?.name
    );

    return { organization, membership };
  }

  async getUserOrganizations(userId: string) {
    requireAuth(userId);
    const memberships = await organizationRepository.getUserMemberships(userId);
    
    const orgs = await Promise.all(
      memberships.map(async (m) => {
        const org = await organizationRepository.findById(m.organizationId);
        return org ? { ...org, role: m.role } : null;
      })
    );

    return orgs.filter(Boolean);
  }

  async getOrganizationDetails(userId: string, orgId: string) {
    requireAuth(userId);
    const membership = await organizationRepository.findMembership(orgId, userId);
    if (!membership) {
      throw new NotFoundError(`Membership not found for organization ${orgId}`);
    }

    requireOrganizationMember(userId, orgId, membership.organizationId);

    const org = await organizationRepository.findById(orgId);
    if (!org) {
      throw new NotFoundError(`Organization ${orgId} not found`);
    }

    return { organization: org, membership };
  }
}

export const organizationService = new OrganizationService();
