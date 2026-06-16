"use server";

import { getDb } from "@/lib/db";
import { logEvent } from "@/lib/logger";

export interface Activity {
  id: number;
  user_id: number | null;
  username: string;
  activity: string;
  status: string; // 'Success', 'Pending', 'Failed'
  created_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  successRate: number;
  totalOtpRequests: number;
  recentActivities: Activity[];
}

/**
 * Computes aggregation statistics from users and activities tables
 * and retrieves the 10 most recent system events.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const db = getDb();
    
    // Total users count
    const totalUsersRow = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
    const totalUsers = totalUsersRow?.count || 0;

    // Active users count
    const activeUsersRow = db.prepare("SELECT count(*) as count FROM users WHERE status = 'Active'").get() as { count: number };
    const activeUsers = activeUsersRow?.count || 0;

    // Fetch last 10 actions
    const recentActivities = db.prepare("SELECT * FROM activities ORDER BY id DESC LIMIT 10").all() as Activity[];

    // Calculate OTP requests success rate
    const totalOtpRow = db.prepare("SELECT count(*) as count FROM activities WHERE activity LIKE '%OTP%' OR activity LIKE '%Login%'").get() as { count: number };
    const totalOtpRequests = totalOtpRow?.count || 0;

    const successOtpRow = db.prepare("SELECT count(*) as count FROM activities WHERE (activity LIKE '%OTP%' OR activity LIKE '%Login%') AND status = 'Success'").get() as { count: number };
    const successOtp = successOtpRow?.count || 0;

    // Calculate success percentage
    const successRate = totalOtpRequests > 0 
      ? Math.round((successOtp / totalOtpRequests) * 100) 
      : 100; // default to 100 if clean database

    return {
      totalUsers,
      activeUsers,
      successRate,
      totalOtpRequests,
      recentActivities,
    };
  } catch (error: any) {
    logEvent("ERROR", "Gagal memuat ringkasan statistik dashboard dari SQLite", { error: error.message });
    return {
      totalUsers: 0,
      activeUsers: 0,
      successRate: 0,
      totalOtpRequests: 0,
      recentActivities: [],
    };
  }
}
