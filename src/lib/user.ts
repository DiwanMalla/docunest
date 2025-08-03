import { prisma } from "@/lib/prisma";

export async function ensureUserExists(clerkId: string, email: string, name?: string) {
  try {
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { email, name },
      create: {
        clerkId,
        email,
        name,
        role: "ADMIN", // Users who can access the app are admins
      },
    });
    return user;
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    return null;
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    return await prisma.user.findUnique({
      where: { clerkId },
    });
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
}
