import { db } from "./index";
import { users, organizations, memberships, leads, leadActivities } from "./schema";

async function main() {
  console.log("🌱 Starting FollowPilot Database Seeding...");

  if (!db) {
    console.warn("⚠️ Database instance is null (DATABASE_URL not connected). Skipping direct DB seed.");
    return;
  }

  try {
    // 1. Create Default Owner User
    const [owner] = await db
      .insert(users)
      .values({
        name: "Venkatesh",
        email: "venky@followpilot.com",
      })
      .onConflictDoNothing()
      .returning();

    console.log("✓ User created/verified:", owner?.email || "venky@followpilot.com");

    // 2. Create Primary Organization
    const [org] = await db
      .insert(organizations)
      .values({
        name: "Acme Digital",
        slug: "acme-digital",
      })
      .onConflictDoNothing()
      .returning();

    console.log("✓ Organization created/verified:", org?.name || "Acme Digital");

    if (owner && org) {
      // 3. Create Membership
      await db
        .insert(memberships)
        .values({
          organizationId: org.id,
          userId: owner.id,
          role: "OWNER",
        })
        .onConflictDoNothing();

      console.log("✓ Organization Membership created");

      // 4. Seed Demo Leads
      const [lead1] = await db
        .insert(leads)
        .values({
          organizationId: org.id,
          firstName: "John",
          lastName: "Smith",
          email: "john@acme.com",
          company: "Acme Technologies",
          phone: "+1 (555) 234-5678",
          jobTitle: "VP of Engineering",
          status: "CONTACTED",
          score: 87,
          priority: "HIGH",
        })
        .onConflictDoNothing()
        .returning();

      if (lead1) {
        // Seed Lead Activity
        await db.insert(leadActivities).values({
          organizationId: org.id,
          leadId: lead1.id,
          type: "PROPOSAL_VIEWED",
          metadata: { document: "Q3_Enterprise_Proposal.pdf" },
        });
        console.log("✓ Demo Lead & Activity inserted:", lead1.email);
      }
    }

    console.log("✅ FollowPilot Database Seeding Completed Successfully.");
  } catch (error) {
    console.warn("⚠️ Database direct seed skipped (PostgreSQL DB offline or using mock engine).");
  }
}

main().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
