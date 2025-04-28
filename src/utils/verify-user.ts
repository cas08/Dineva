import db from "@/lib/prisma-client";

export async function verifyUserExists(
  userId: string | undefined,
): Promise<boolean> {
  if (!userId) return false;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    return !!user;
  } catch (error) {
    console.error("Error verifying user:", error);
    return false;
  }
}

export async function getUserCurrentRole(
  userId: string | undefined,
): Promise<string | null> {
  if (!userId) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { userRole: true },
    });

    return user?.userRole || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}
