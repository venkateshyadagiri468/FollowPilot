import { OrganizationEntity, MembershipEntity, OrganizationInvitationEntity } from "./types";
import { Role } from "@/lib/permissions";

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
      userEmail: "demo@followpilot.com",
      userName: "Venkatesh (Demo)",
    },
  ];

  private static mockInvitations: OrganizationInvitationEntity[] = [];

  async findById(id: string): Promise<OrganizationEntity | null> {
    return OrganizationRepository.mockOrgs.find((o) => o.id === id) || null;
  }

  async findBySlug(slug: string): Promise<OrganizationEntity | null> {
    return OrganizationRepository.mockOrgs.find((o) => o.slug === slug) || null;
  }

  async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let candidateSlug = baseSlug || "org";
    let counter = 1;

    while (await this.findBySlug(candidateSlug)) {
      counter++;
      candidateSlug = `${baseSlug}-${counter}`;
    }

    return candidateSlug;
  }

  async findMembership(orgId: string, userId: string): Promise<MembershipEntity | null> {
    return (
      OrganizationRepository.mockMemberships.find(
        (m) => m.organizationId === orgId && m.userId === userId
      ) || null
    );
  }

  async getUserMemberships(userId: string): Promise<MembershipEntity[]> {
    return OrganizationRepository.mockMemberships.filter((m) => m.userId === userId);
  }

  async getOrganizationMembers(orgId: string): Promise<MembershipEntity[]> {
    return OrganizationRepository.mockMemberships.filter((m) => m.organizationId === orgId);
  }

  async createOrganizationWithOwner(
    name: string,
    ownerUserId: string,
    ownerEmail?: string,
    ownerName?: string
  ): Promise<{ organization: OrganizationEntity; membership: MembershipEntity }> {
    const slug = await this.generateUniqueSlug(name);

    const newOrg: OrganizationEntity = {
      id: `org_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newMembership: MembershipEntity = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: newOrg.id,
      userId: ownerUserId,
      role: "OWNER",
      joinedAt: new Date().toISOString(),
      userEmail: ownerEmail,
      userName: ownerName,
    };

    // Atomic insert transaction semantics
    OrganizationRepository.mockOrgs.push(newOrg);
    OrganizationRepository.mockMemberships.push(newMembership);

    return { organization: newOrg, membership: newMembership };
  }

  async addMember(
    orgId: string,
    userId: string,
    role: Role,
    userEmail?: string,
    userName?: string
  ): Promise<MembershipEntity> {
    const existing = await this.findMembership(orgId, userId);
    if (existing) {
      throw new Error(`User is already a member of organization ${orgId}`);
    }

    const membership: MembershipEntity = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: orgId,
      userId,
      role,
      joinedAt: new Date().toISOString(),
      userEmail,
      userName,
    };

    OrganizationRepository.mockMemberships.push(membership);
    return membership;
  }

  async updateMemberRole(membershipId: string, newRole: Role): Promise<MembershipEntity> {
    const idx = OrganizationRepository.mockMemberships.findIndex((m) => m.id === membershipId);
    if (idx === -1) {
      throw new Error("Membership not found");
    }
    OrganizationRepository.mockMemberships[idx].role = newRole;
    return OrganizationRepository.mockMemberships[idx];
  }

  async removeMember(membershipId: string): Promise<void> {
    OrganizationRepository.mockMemberships = OrganizationRepository.mockMemberships.filter(
      (m) => m.id !== membershipId
    );
  }

  // Invitation Methods
  async createInvitation(
    organizationId: string,
    email: string,
    role: Role,
    token: string,
    invitedByUserId: string,
    expiresAt: string
  ): Promise<OrganizationInvitationEntity> {
    const invitation: OrganizationInvitationEntity = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId,
      email: email.toLowerCase().trim(),
      role,
      token,
      invitedByUserId,
      status: "PENDING",
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    OrganizationRepository.mockInvitations.push(invitation);
    return invitation;
  }

  async findInvitationByToken(token: string): Promise<OrganizationInvitationEntity | null> {
    return OrganizationRepository.mockInvitations.find((i) => i.token === token) || null;
  }

  async getPendingInvitations(orgId: string): Promise<OrganizationInvitationEntity[]> {
    return OrganizationRepository.mockInvitations.filter(
      (i) => i.organizationId === orgId && i.status === "PENDING"
    );
  }

  async updateInvitationStatus(
    invitationId: string,
    status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED"
  ): Promise<void> {
    const idx = OrganizationRepository.mockInvitations.findIndex((i) => i.id === invitationId);
    if (idx !== -1) {
      OrganizationRepository.mockInvitations[idx].status = status;
    }
  }
}

export const organizationRepository = new OrganizationRepository();
