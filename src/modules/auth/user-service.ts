import { logger } from "@/lib/logging";

export interface ApplicationUser {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

// In-Memory & Persistence Application User Provisioning Store
const userStoreByClerkId = new Map<string, ApplicationUser>();
const userStoreByEmail = new Map<string, ApplicationUser>();

// Pre-provision demo user for testing
const demoUser: ApplicationUser = {
  id: "usr_demo_1",
  clerkUserId: "user_clerk_demo_1",
  email: "demo@followpilot.com",
  name: "Venkatesh (Demo)",
  image: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
userStoreByClerkId.set(demoUser.clerkUserId, demoUser);
userStoreByEmail.set(demoUser.email, demoUser);

export class UserService {
  async getOrCreateApplicationUser(input: {
    clerkUserId: string;
    email: string;
    name?: string;
    image?: string;
  }): Promise<ApplicationUser> {
    const existingByClerk = userStoreByClerkId.get(input.clerkUserId);
    if (existingByClerk) {
      return existingByClerk;
    }

    const existingByEmail = userStoreByEmail.get(input.email);
    if (existingByEmail) {
      // Bind clerkUserId to existing email user
      const updated = { ...existingByEmail, clerkUserId: input.clerkUserId, updatedAt: new Date().toISOString() };
      userStoreByClerkId.set(input.clerkUserId, updated);
      userStoreByEmail.set(input.email, updated);
      logger.info("Application user linked to Clerk identity", { userId: updated.id, clerkUserId: input.clerkUserId });
      return updated;
    }

    // Provision new application user
    const newUser: ApplicationUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      clerkUserId: input.clerkUserId,
      email: input.email,
      name: input.name || input.email.split("@")[0],
      image: input.image || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    userStoreByClerkId.set(input.clerkUserId, newUser);
    userStoreByEmail.set(input.email, newUser);

    logger.info("New application user provisioned", { userId: newUser.id, email: newUser.email });
    return newUser;
  }

  async findByClerkUserId(clerkUserId: string): Promise<ApplicationUser | null> {
    return userStoreByClerkId.get(clerkUserId) || null;
  }

  async findById(id: string): Promise<ApplicationUser | null> {
    for (const u of userStoreByClerkId.values()) {
      if (u.id === id) return u;
    }
    return null;
  }
}

export const userService = new UserService();
