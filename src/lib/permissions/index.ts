import { AuthenticationError, AuthorizationError } from "../errors";

export type Role = "OWNER" | "ADMIN" | "MEMBER";

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
  if (userOrgId && userOrgId !== targetOrgId) {
    throw new AuthorizationError("Access denied to target organization data");
  }
}

export function requireOrganizationRole(
  userId: string,
  currentRole: Role,
  allowedRoles: Role[]
): void {
  requireAuth(userId);
  if (!allowedRoles.includes(currentRole)) {
    throw new AuthorizationError(
      `Role '${currentRole}' does not have permission for this operation. Required: ${allowedRoles.join(", ")}`
    );
  }
}
