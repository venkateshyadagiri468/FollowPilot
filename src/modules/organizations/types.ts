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
  userEmail?: string;
  userName?: string;
}

export interface OrganizationInvitationEntity {
  id: string;
  organizationId: string;
  email: string;
  role: Role;
  token: string;
  invitedByUserId: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  expiresAt: string;
  createdAt: string;
}
