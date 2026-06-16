import { cookies } from "next/headers";
import { logEvent } from "./logger";

const SESSION_COOKIE_NAME = "admin_session";

export interface UserSession {
  id: number;
  username: string;
  phone: string;
  role: string;
}

/**
 * Sets the session cookie containing the logged-in user data.
 */
export async function setSession(user: UserSession): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionData = Buffer.from(JSON.stringify(user)).toString("base64");
    
    // Set secure to false to allow testing on local HTTP connections
    cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day session
      path: "/",
    });
    
    logEvent("INFO", `Sesi cookie baru diatur untuk pengguna: ${user.username}`, { userId: user.id });
  } catch (error: any) {
    logEvent("ERROR", `Gagal mengatur sesi cookie untuk ${user.username}`, { error: error.message });
    throw error;
  }
}

/**
 * Retrieves and decodes the current session.
 */
export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    
    const rawData = Buffer.from(sessionCookie.value, "base64").toString("utf-8");
    const session = JSON.parse(rawData) as UserSession;
    return session;
  } catch (error: any) {
    // Next.js compiler uses a specific error to detect dynamic page rendering during builds.
    // We must re-throw this so Next.js marks the page as dynamic, rather than logging it as a system failure.
    if (error.message && error.message.includes("Dynamic server usage")) {
      throw error;
    }
    
    logEvent("ERROR", "Gagal membaca/mendekode sesi cookie", { error: error.message });
    return null;
  }
}

/**
 * Deletes the session cookie to log the user out.
 */
export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    logEvent("INFO", "Sesi cookie berhasil dihapus (logout)");
  } catch (error: any) {
    logEvent("ERROR", "Gagal menghapus sesi cookie", { error: error.message });
  }
}
