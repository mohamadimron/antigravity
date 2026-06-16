import fs from "fs";
import path from "path";

const LOG_DIR = path.resolve(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "system.log");

/**
 * Appends a log line to a separate log file and echoes it to the console.
 */
export function logEvent(level: "INFO" | "WARN" | "ERROR", message: string, meta?: any): void {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : "";
    const logLine = `[${timestamp}] [${level}] ${message}${metaString}\n`;

    // 1. Append to log file
    fs.appendFileSync(LOG_FILE, logLine, "utf-8");

    // 2. Output to console with color/format
    const consoleMsg = logLine.trim();
    if (level === "ERROR") {
      console.error(`🔴 ${consoleMsg}`);
    } else if (level === "WARN") {
      console.warn(`🟡 ${consoleMsg}`);
    } else {
      console.log(`🟢 ${consoleMsg}`);
    }
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
}
