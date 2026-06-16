import type { NextConfig } from "next";
import os from "os";

// Dynamically detect local network IP addresses to prevent Server Action CSRF block
// when accessing from local network IP addresses (e.g. 192.168.x.x, 10.x.x.x)
function getLocalIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

const localIps = getLocalIPs();
const devPorts = ["3000", "3001", "3002", "8080", "8000"];

const allowedOrigins = [
  ...localIps,
  ...localIps.flatMap((ip) => devPorts.map((port) => `${ip}:${port}`)),
  
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: allowedOrigins,
      
    },
  },
};
module.exports = {
  allowedDevOrigins: ['192.168.0.125'],
}

export default nextConfig;
