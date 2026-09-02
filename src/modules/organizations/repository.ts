import { OrganizationEntity, MembershipEntity } from "./types";
import { Role } from "@/lib/permissions";

// Organization Repository Abstraction
export class OrganizationRepository {
  private static mockOrgs: OrganizationEntity[] = [
    {
      id: "org_demo_1",
      name: "Acme Corp (Demo)",
      slug: "acme-corp",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private static mockMemberships: MembershipEntity[] = [
    {
      id: "mem_demo_1",
      organizationId: "org_demo_1",
      userId: "usr_demo_1",
      role: "OWNER",
      joinedAt: new Date().toISOString(),
    },
  ];

  async findById(id: string): Promise<OrganizationEntity | null> {
    return OrganizationRepository.mockOrgs.find((o) => o.id === id) || null;
  }

  async findMembership(orgId: string, userId: string): Promise<MembershipEntity | null> {
    return (
      OrganizationRepository.mockMemberships.find(
        (m) => m.organizationId === orgId && m.userId === userId
      ) || null
    );
  }

  async createOrganization(name: string, slug: string, ownerUserId: string): Promise<OrganizationEntity> {
    const newOrg: OrganizationEntity = {
      id: `org_${Date.now()}`,
      name,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    OrganizationRepository.mockOrgs.push(newOrg);

    const newMembership: MembershipEntity = {
      id: `mem_${Date.now()}`,
      organizationId: newOrg.id,
      userId: ownerUserId,
      role: "OWNER",
      joinedAt: new Date().toISOString(),
    };
    OrganizationRepository.mockMemberships.push(newMembership);

    return newOrg;
  }
}
