import { OrganizationRepository } from "./repository";
import { requireAuth, requirePermission, Role } from "@/lib/permissions";
import { NotFoundError } from "@/lib/errors";

export class OrganizationService {
  constructor(private repo: OrganizationRepository = new OrganizationRepository()) {}

  async getOrganizationDetails(userId: string, targetOrgId: string, currentOrgId: string, role: Role) {
    requireAuth(userId);
    requirePermission(userId, currentOrgId, targetOrgId, role, "manage_settings");

    const org = await this.repo.findById(targetOrgId);
    if (!org) {
      throw new NotFoundError(`Organization '${targetOrgId}' not found`);
    }

    return org;
  }
}
