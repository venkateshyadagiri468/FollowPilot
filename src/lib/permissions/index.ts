import { AuthenticationError, AuthorizationError } from "../errors";

export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export type Permission =
  | "manage_billing"
  | "manage_members"
  | "manage_settings"
  | "create_leads"
  | "edit_leads"
  | "view_leads"
  | "send_emails";

const PERMISSION_MATRIX: Record<Role, Permission[]> = {
  OWNER: [
    "manage_billing",
    "manage_members",
    "manage_settings",
    "create_leads",
    "edit_leads",
    "view_leads",
    "send_emails",
  ],
  ADMIN: [
    "manage_members",
    "manage_settings",
    "create_leads",
    "edit_leads",
    "view_leads",
    "send_emails",
  ],
  MEMBER: ["create_leads", "edit_leads", "view_leads", "send_emails"],
  VIEWER: ["view_leads"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSION_MATRIX[role]?.includes(permission) ?? false;
}

export function requireAuth(userId?: string | null): string {
  if (!userId) {
    throw new AuthenticationError("User session required to perform this action");
  }
  return userId;
}

export function requireOrganizationMember(
  userId: string,
  targetOrgId: string,
  userOrgId?: string
): void {
  requireAuth(userId);
  if (!userOrgId || userOrgId !== targetOrgId) {
    throw new AuthorizationError("Access denied: Multi-tenant boundary violation");
  }
}

export function requirePermission(
  userId: string,
  userOrgId: string,
  targetOrgId: string,
  role: Role,
  permission: Permission
): void {
  requireOrganizationMember(userId, targetOrgId, userOrgId);
  if (!hasPermission(role, permission)) {
    throw new AuthorizationError(
      `Role '${role}' lacks mandatory permission '${permission}' for organization operations`
    );
  }
}
