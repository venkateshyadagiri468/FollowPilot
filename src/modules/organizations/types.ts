import { Role } from "@/lib/permissions";

export interface OrganizationEntity {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipEntity {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  joinedAt: string;
}
