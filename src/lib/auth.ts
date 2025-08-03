import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function ensureUserExists(
  clerkId: string,
  email: string,
  name?: string
) {
  try {
    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { email, name },
      create: {
        clerkId,
        email,
        name,
        role: "GUEST", // Default role
      },
    });

    return user;
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    return null;
  }
}

export async function isAdmin(userId?: string) {
  if (!userId) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return false;
    userId = clerkUserId;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    return user?.role === "ADMIN";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
