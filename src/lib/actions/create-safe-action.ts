import { z } from "zod";
import { requireAuth, requirePermission, Role, Permission } from "../permissions";
import { logger } from "../logging";
import { formatAppError } from "../errors";

export interface ActionState<TOutput> {
  data?: TOutput;
  error?: string;
}

export function createSafeAction<TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: (parsedInput: TInput, context: { userId: string; orgId: string; role: Role }) => Promise<TOutput>,
  options?: {
    requiredPermission?: Permission;
  }
) {
  return async (
    input: TInput,
    context: { userId: string; orgId: string; role: Role }
  ): Promise<ActionState<TOutput>> => {
    try {
      // 1. Session Auth Check
      requireAuth(context.userId);

      // 2. RBAC Permission Check
      if (options?.requiredPermission) {
        requirePermission(
          context.userId,
          context.orgId,
          context.orgId,
          context.role,
          options.requiredPermission
        );
      }

      // 3. Zod Input Validation
      const parsedInput = schema.parse(input);

      // 4. Action Execution
      const result = await handler(parsedInput, context);
      return { data: result };
    } catch (error: any) {
      logger.error("Server Action Execution Error", {
        userId: context?.userId,
        orgId: context?.orgId,
        error: error.message,
      });

      const formatted = formatAppError(error);
      return { error: formatted.message };
    }
  };
}
