import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Shield,
  Check,
  AlertTriangle,
  Clock,
  Wifi,
  Lock,
  Eye,
  RefreshCw,
  Smartphone,
  Laptop,
  Monitor,
  LogOut,
  Trash2,
  CircleAlert,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Signal,
  Smartphone as Mobile,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { PageShell, PageHeader } from "@/components/jarvis/PageShell";

interface DeviceSession {
  id: string;
  name: string;
  type: "desktop" | "laptop" | "mobile" | "tablet";
  location: string;
  time: string;
  status: "current" | "trusted" | "unknown" | "suspicious";
  ip: string;
}


interface SecurityToggle {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
}

export default function SecurityCenter() {
  const navigate = useNavigate();
  const [securityScore] = useState(98);
  const [lastScan] = useState("2 minutes ago");
  const [networkStatus] = useState("Encrypted");
  const [encryptionType] = useState("AES-256");
  const [toggles, setToggles] = useState<SecurityToggle[]>([
    { id: "1", name: "Privacy Mode", icon: "🔒", description: "Protect your data", enabled: true },
    { id: "2", name: "VPN", icon: "🌐", description: "Secure connection", enabled: true },
    { id: "3", name: "Encrypt All Files", icon: "📁", description: "AES-256 encryption", enabled: false },
    { id: "4", name: "Ad Blocker", icon: "🚫", description: "System-wide", enabled: true },
    { id: "5", name: "AI Firewall", icon: "🛡️", description: "Threat detection", enabled: true },
  ]);
  const [sessions, setSessions] = useState<DeviceSession[]>([
    { id: "1", name: "Chrome - Mumbai, India", type: "desktop", location: "Mumbai, India", time: "Current", status: "current", ip: "192.168.1.1" },
    { id: "2", name: "iPhone 15 - Delhi, India", type: "mobile", location: "Delhi, India", time: "2 hours ago", status: "unknown", ip: "192.168.1.2" },
    { id: "3", name: "MacBook - New York, USA", type: "laptop", location: "New York, USA", time: "Yesterday", status: "suspicious", ip: "192.168.1.3" },
  ]);
  const [privacySettings, setPrivacySettings] = useState({ allowAILearning: false, autoDeleteLogs: true, shareAnalytics: false });

  const handleToggle = (id: string) => {
    setToggles((current) => current.map((toggle) => (toggle.id === id ? { ...toggle, enabled: !toggle.enabled } : toggle)));
  };

  const getStatusLabel = (status: DeviceSession["status"]) => {
    switch (status) {
      case "current":
        return <Badge className="border-0 bg-green-500/20 text-green-400">Current</Badge>;
      case "trusted":
        return <Badge className="border-0 bg-green-500/20 text-green-400">Trusted</Badge>;
      case "unknown":
        return <Badge className="border-0 bg-yellow-500/20 text-yellow-400">Unknown</Badge>;
      case "suspicious":
        return <Badge className="border-0 bg-red-500/20 text-red-400">Suspicious</Badge>;
    }
  };



  const handleLogoutAll = () => {
    setSessions((current) => current.filter((session) => session.status === "current"));
  };

  const handleDeleteAllData = () => {
    if (window.confirm("This will delete all local data. Continue?")) {
      window.alert("All data deleted successfully.");
    }
  };

  const handleFactoryReset = () => {
    if (window.confirm("This will reset JARVIS to factory settings. Continue?")) {
      window.alert("Factory reset complete.");
    }
  };

  return (
    <PageShell>
      <PageHeader title="Security Center" subtitle="Protect your workspace, sessions, and private data." icon={<ShieldCheck className="h-5 w-5" />} />

      <div className="mt-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" className="w-fit gap-2 text-gray-400 hover:text-white" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
          <Badge variant="outline" className="border-green-400/30 bg-green-500/10 text-green-400">System Secure</Badge>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-6 backdrop-blur-sm">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-cyan-400">
                <span className="text-2xl font-bold text-white">{securityScore}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Security Score</p>
                <p className="text-xs text-gray-400">{securityScore}/100</p>
                <Badge className="mt-1 border-0 bg-green-500/20 text-green-400">Excellent</Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" /> All systems secure</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /> Last scan: {lastScan}</div>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2"><Wifi className="h-4 w-4 text-cyan-400" /> Network: {networkStatus}</div>
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-cyan-400" /> Encryption: {encryptionType}</div>
            </div>
            <div className="flex items-center">
              <Button variant="outline" className="gap-2 border-white/10 text-gray-400 hover:text-white">
                <RefreshCw className="h-4 w-4" /> Run Scan
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Quick Security Toggles</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {toggles.map((toggle) => (
              <Card key={toggle.id} className={`rounded-xl border ${toggle.enabled ? "border-cyan-400/30 bg-cyan-400/10" : "border-white/10 bg-white/5"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-2xl">{toggle.icon}</div>
                      <h3 className="mt-1 text-sm font-medium text-white">{toggle.name}</h3>
                      <p className="mt-1 text-xs text-gray-400">{toggle.description}</p>
                    </div>
                    <Switch checked={toggle.enabled} onCheckedChange={() => handleToggle(toggle.id)} className="data-[state=checked]:bg-cyan-400" />
                  </div>
                  <div className="mt-3">
                    <Badge variant="outline" className={toggle.enabled ? "border-green-400/30 text-green-400" : "border-white/10 text-gray-400"}>{toggle.enabled ? "Active" : "Off"}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white"><Smartphone className="h-5 w-5" /> Active Devices ({sessions.length})</CardTitle>
              <Button variant="outline" className="gap-2 border-red-400/30 text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={handleLogoutAll}>
                <LogOut className="h-4 w-4" /> Logout All Others
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className={`flex items-center justify-between rounded-lg border p-3 ${session.status === "suspicious" ? "border-red-500/30 bg-red-500/5" : session.status === "unknown" ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/10 bg-black/20"}`}>
                <div className="flex items-center gap-3">
                  {session.type === "desktop" && <Monitor className="h-5 w-5 text-gray-400" />}
                  {session.type === "laptop" && <Laptop className="h-5 w-5 text-gray-400" />}
                  {(session.type === "mobile" || session.type === "tablet") && <Mobile className="h-5 w-5 text-gray-400" />}
                  <div>
                    <p className="text-sm font-medium text-white">{session.name}</p>
                    <p className="text-xs text-gray-400">{session.ip} · {session.time}</p>
                  </div>
                </div>
                {getStatusLabel(session.status)}
              </div>
            ))}
          </CardContent>
        </Card>


        <Card className="rounded-xl border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white"><Lock className="h-5 w-5" /> Data Privacy & Emergency Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400">Data Privacy Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3">
                  <span className="text-sm text-white">Allow JARVIS to store chat history for learning</span>
                  <Checkbox checked={privacySettings.allowAILearning} onCheckedChange={(checked) => setPrivacySettings((current) => ({ ...current, allowAILearning: !!checked }))} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3">
                  <span className="text-sm text-white">Automatically delete old logs after 30 days</span>
                  <Checkbox checked={privacySettings.autoDeleteLogs} onCheckedChange={(checked) => setPrivacySettings((current) => ({ ...current, autoDeleteLogs: !!checked }))} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3">
                  <span className="text-sm text-white">Share anonymous usage data (improves AI)</span>
                  <Checkbox checked={privacySettings.shareAnalytics} onCheckedChange={(checked) => setPrivacySettings((current) => ({ ...current, shareAnalytics: !!checked }))} />
                </div>
              </div>
            </div>

            <div className="border-t border-red-500/20 pt-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h4 className="text-sm font-medium text-red-400">Danger Zone</h4>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2 border-red-400/30 text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={handleDeleteAllData}>
                  <Trash2 className="h-4 w-4" /> Delete All My Data
                </Button>
                <Button variant="outline" className="gap-2 border-red-400/30 text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={handleLogoutAll}>
                  <LogOut className="h-4 w-4" /> Emergency Logout All
                </Button>
                <Button variant="outline" className="gap-2 border-red-400/30 text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={handleFactoryReset}>
                  <RefreshCw className="h-4 w-4" /> Factory Reset JARVIS
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
