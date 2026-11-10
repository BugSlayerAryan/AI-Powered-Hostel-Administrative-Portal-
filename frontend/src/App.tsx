import QRCode from "qrcode";
import { toast as notifyToast } from "react-toastify";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  UserRound,
  Send,
  Activity,
  AlertCircle,
  BedDouble,
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  DoorOpen,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  House,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sun,
  Users,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
type ToastKind = "success" | "error" | "warning" | "info";
function showToast(message: string, kind?: ToastKind) {
  if (!message) return;
  const success =
    /successfully|recorded|approved|rejected|released|enabled|disabled|submitted|saved and locked|status updated|room allocated/i.test(
      message,
    );
  const type = kind || (success ? "success" : "error");
  notifyToast[type](message);
}
// const api = axios.create({ baseURL: "/api" });
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${API_URL}/api`,
});
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
type User = {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  twoFactorEnabled?: boolean;
  registrationNumber?: string;
  rollNumber?: string;
  department?: string;
  course?: string;
  academicYear?: string;
  phone?: string;
  guardianName?: string;
  guardianPhone?: string;
  role: "STUDENT" | "SUPER_ADMIN" | "HOSTEL_WARDEN";
  hostel?: string;
};
const studentNav = [
  ["Overview", "overview"],
  ["My Profile", "profile"],
  ["My Room", "rooms"],
  ["Fee Management", "fees"],
  ["Complaints", "complaints"],
  ["Attendance", "attendance"],
  ["Leave Requests", "leave"],
  ["Visitor Requests", "visitors"],
  ["Hostel Notices", "notices"],
  ["Mess Information", "mess"],
  ["Room Change Requests", "room-change"],
  ["AI Hostel Assistant", "assistant"],
  ["Settings", "settings"],
];
const adminNav = [
  ["Overview", "overview"],
  ["Hostel Management", "hostels"],
  ["Warden Management", "wardens"],
  ["Student Management", "students"],
  ["Room Management", "rooms"],
  ["Room Change Requests", "room-change"],
  ["Fee Management", "fees"],
  ["Payment Verification", "payment-verification"],
  ["Complaint Monitoring", "complaints"],
  ["Attendance Management", "attendance"],
  ["Leave Management", "leave"],
  ["Visitor Management", "visitors"],
  ["Notice Management", "notices"],
  ["Mess Management", "mess"],
  ["AI Analytics", "analytics"],
  ["Reports & Exports", "reports"],
  ["Roles & Permissions", "roles"],
  ["Audit Logs", "audit-logs"],
  ["System Settings", "settings"],
];
const wardenNav = [
  ["Overview", "overview"],
  ["My Hostel", "my-hostel"],
  ["Students", "students"],
  ["Rooms", "rooms"],
  ["Room Change Requests", "room-change"],
  ["Complaints", "complaints"],
  ["Attendance", "attendance"],
  ["Fee Monitoring", "fees"],
  ["Payment Review", "payment-verification"],
  ["Leave Approvals", "leave"],
  ["Visitor Management", "visitors"],
  ["Notice Management", "notices"],
  ["Mess Management", "mess"],
  ["Reports", "reports"],
  ["Profile & Settings", "settings"],
];
const icons: any = {
  overview: LayoutDashboard,
  hostels: Building2,
  wardens: Shield,
  students: Users,
  rooms: BedDouble,
  fees: Wallet,
  "payment-verification": Wallet,
  "my-hostel": Building2,
  complaints: AlertCircle,
  attendance: CalendarDays,
  leave: ClipboardList,
  visitors: DoorOpen,
  notices: FileText,
  mess: Utensils,
  analytics: Activity,
  reports: FileText,
  roles: Shield,
  "audit-logs": Activity,
  settings: Settings,
  profile: Users,
  assistant: MessageCircle,
};
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    if (localStorage.getItem("token"))
      api
        .get("/auth/me")
        .then((r) => setUser(r.data.user))
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => setLoading(false));
    else setLoading(false);
  }, []);
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };
  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
        Connecting to HostelOS
      </div>
    );
  if (!user)
    return (
      <Login
        onLogin={(u) => setUser(u)}
        dark={dark}
        toggleDark={() => setDark(!dark)}
      />
    );
  const nav =
    user.role === "STUDENT"
      ? studentNav
      : user.role === "SUPER_ADMIN"
        ? adminNav
        : wardenNav;
  return (
    <div
      className={`app-shell reference-theme-shell role-${user.role.toLowerCase()} ${page === "overview" ? "dashboard-reference-shell" : ""} ${page === "hostels" ? "hostel-reference-shell" : ""} ${page === "mess" ? "mess-reference-shell" : ""} ${page === "analytics" ? "analytics-reference-shell" : ""} ${page === "reports" ? "reports-reference-shell" : ""}`}
    >
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <House size={18} />
          </div>
          <span>
            hostel<span className="brand-light">OS</span>
            <small>ADMIN PORTAL</small>
          </span>
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          {nav.map(([label, key]) => {
            const Icon = icons[key] || LayoutDashboard;
            return (
              <button
                key={key}
                className={`nav-item ${page === key ? "active" : ""}`}
                onClick={() => setPage(key)}
              >
                <Icon size={17} />
                <span>{label}</span>
                {key === "complaints" && <i className="nav-dot" />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="campus-card">
            <div className="campus-icon">
              <Building2 size={16} />
            </div>
            <div>
              <b>GITA Campus</b>
              <small>
                {user.role === "SUPER_ADMIN"
                  ? "All hostels"
                  : "Hostel workspace"}
              </small>
            </div>
            <ChevronDown size={14} />
          </div>
          <button className="nav-item" onClick={() => setDark(!dark)}>
            <Sun size={17} />
            <span>{dark ? "Light appearance" : "Dark appearance"}</span>
          </button>
          <button className="nav-item logout" onClick={logout}>
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
          <button
            className="user-mini profile-trigger"
            aria-label="Open profile"
            onClick={() => setPage("profile")}
          >
            <div className="avatar">
              {user.name
                .split(" ")
                .map((x) => x[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <b>{user.name}</b>
              <small>{user.role.replace("_", " ")}</small>
            </div>
            <ChevronDown size={14} />
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="crumb">
            <span>Workspace</span>
            <span className="crumb-sep">/</span>
            <b>{nav.find((n) => n[1] === page)?.[0] || "Profile"}</b>
          </div>
          <div className="top-actions">
            <NotificationCenter />
            <div className="top-divider" />
            <button
              className="top-user profile-trigger"
              aria-label="Open profile"
              onClick={() => setPage("profile")}
            >
              <div className="avatar small">
                {user.name
                  .split(" ")
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <b>{user.name}</b>
                <small>{user.role.replace("_", " ")}</small>
              </div>
            </button>
          </div>
        </header>
        <Content
          key={page}
          page={page}
          user={user}
          setUser={setUser}
          setPage={setPage}
        />
      </main>
      <FloatingAssistant user={user} />
    </div>
  );
}
function Login({
  onLogin,
  dark,
  toggleDark,
}: {
  onLogin: (u: User) => void;
  dark: boolean;
  toggleDark: () => void;
}) {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [role, setRole] = useState<"SUPER_ADMIN" | "HOSTEL_WARDEN" | "STUDENT">(
    "STUDENT",
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const roleOptions = [
    ["STUDENT", "Student", GraduationCap],
    ["HOSTEL_WARDEN", "Warden", Shield],
    ["SUPER_ADMIN", "Admin", UserRound],
  ] as const;
  async function submit(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "forgot") {
        const r = await api.post("/auth/forgot-password", {
          identifier: credentials.email,
        });
        setMessage(r.data.message);
        if (r.data.resetToken) {
          setResetToken(r.data.resetToken);
          setMode("reset");
        }
      } else if (mode === "reset") {
        const r = await api.post("/auth/reset-password", {
          token: resetToken,
          password: newPassword,
        });
        setMessage(r.data.message);
        setMode("login");
        setNewPassword("");
      } else {
        const r = await api.post("/auth/login", credentials);
        if (r.data.user.role !== role) {
          setError(
            `This account is not a ${role === "SUPER_ADMIN" ? "Admin" : role === "HOSTEL_WARDEN" ? "Warden" : "Student"} account.`,
          );
          return;
        }
        localStorage.setItem("token", r.data.token);
        localStorage.setItem("user", JSON.stringify(r.data.user));
        onLogin(r.data.user);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Unable to complete this request.");
    } finally {
      setBusy(false);
    }
  }
  function switchMode(next: "login" | "forgot") {
    setMode(next);
    setError("");
    setMessage("");
    setResetToken("");
  }
  return (
    <div
      className={`login-page ${dark ? "login-theme-dark" : "login-theme-light"}`}
    >
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-mark">
            <House size={27} />
          </div>
          <span>
            hostel<span className="brand-light">OS</span>
          </span>
        </div>
        <div className="login-hero">
          <div className="eyebrow">
            <span />
            HOSTEL ADMINISTRATION PLATFORM
          </div>
          <h1>
            Living better,
            <br />
            <em>managed</em>
            <br />
            smarter.
          </h1>
          <p>
            A smarter, simpler way to manage everyday
            <br />
            campus life.
          </p>
          <div className="login-stats">
            <div>
              <b>01+</b>
              <span>
                Connected
                <br />
                Campuses
              </span>
            </div>
            <div>
              <b>03+</b>
              <span>
                End-to-End
                <br />
                Modules
              </span>
            </div>
            <div>
              <b>24/7</b>
              <span>Always Available</span>
            </div>
          </div>
        </div>
        <div className="login-foot">Smart Hostel. Better Tomorrow.</div>
      </div>
      <div className="login-right">
        <button
          className="theme-toggle"
          aria-pressed={dark}
          onClick={toggleDark}
        >
          <Sun size={18} />
          {dark ? "Light mode" : "Dark mode"}
        </button>
        <form className="login-form" onSubmit={submit}>
          <div className="form-overline">SECURE CAMPUS ACCESS</div>
          <h2>
            {mode === "login"
              ? "Welcome back."
              : mode === "forgot"
                ? "Reset your password."
                : "Choose a new password."}
          </h2>
          <p>
            {mode === "login"
              ? "Sign in to continue to your workspace."
              : mode === "forgot"
                ? "Enter your username or email to continue."
                : "Your reset token is valid for 15 minutes."}
          </p>
          {mode === "login" && (
            <div className="login-role-grid">
              {roleOptions.map(([value, label, Icon]) => (
                <button
                  type="button"
                  key={value}
                  className={`login-role ${role === value ? "selected" : ""}`}
                  onClick={() => setRole(value)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
          {mode !== "reset" ? (
            <label>
              {mode === "login" ? "Username or email" : "Username or email"}
              <div className="login-input-wrap">
                <UserRound size={16} />
                <input
                  required
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  placeholder="Enter your username or email"
                />
              </div>
            </label>
          ) : (
            <label>
              New password
              <div className="login-input-wrap">
                <LockKeyhole size={16} />
                <input
                  required
                  minLength={10}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 10 characters"
                />
              </div>
            </label>
          )}
          {mode === "login" && (
            <label>
              Password
              <div className="login-input-wrap">
                <LockKeyhole size={16} />
                <input
                  required
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="input-action"
                  aria-label={
                    passwordVisible ? "Hide password" : "Show password"
                  }
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
          )}
          {error && (
            <div className="error-box">
              <AlertCircle size={15} />
              {error}
            </div>
          )}
          {message && (
            <div className="success-box">
              <Check size={15} />
              {message}
            </div>
          )}
          <button className="primary-btn login-submit" disabled={busy}>
            {busy
              ? "Please wait..."
              : mode === "login"
                ? "Continue securely"
                : mode === "forgot"
                  ? "Create reset request"
                  : "Update password"}
            <ArrowRight size={20} />
          </button>
          {mode === "login" ? (
            <button
              type="button"
              className="login-link"
              onClick={() => switchMode("forgot")}
            >
              Forgot password?
            </button>
          ) : (
            <button
              type="button"
              className="login-link"
              onClick={() => switchMode("login")}
            >
              Back to sign in
            </button>
          )}
          <div className="login-help">
            <ShieldCheck size={15} /> Your data is always secure with us
          </div>
        </form>
        <div className="login-copyright">
          © 2026 hostelOS · GITA Autonomous College
        </div>
      </div>
    </div>
  );
}
function Content({
  page,
  user,
  setUser,
  setPage,
}: {
  page: string;
  user: User;
  setUser: (u: User) => void;
  setPage: (p: string) => void;
}) {
  const [data, setData] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [payment, setPayment] = useState<any>(null);
  const [notice, setNotice] = useState<any>(null);
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [roomChangeOpen, setRoomChangeOpen] = useState(false);
  const setToast = showToast;
  const [chat, setChat] = useState<{ q: string; a: string }[]>([]);
  const [message, setMessage] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const student = user.role === "STUDENT";
  useEffect(() => {
    let active = true;
    const load = async (showBusy = true) => {
      if (showBusy) setBusy(true);
      try {
        if (page === "overview") {
          const r = await api.get("/dashboard");
          if (active)
            setData({ ...r.data, lastUpdated: new Date().toISOString() });
        } else if (page === "profile") {
          setData({ user });
        } else if (page === "assistant") {
        } else if (page === "analytics") {
          const r = await api.get("/analytics");
          setData(r.data);
        } else if (
          page === "settings" ||
          page === "reports" ||
          page === "roles"
        ) {
        } else if (page === "hostels" || page === "my-hostel") {
          const r = await api.get("/hostels");
          setRows(r.data);
        } else if (page === "payment-verification") {
          const r = await api.get("/payments");
          setRows(r.data.items || r.data);
        } else if (page === "wardens") {
          const r = await api.get("/users?role=HOSTEL_WARDEN");
          setRows(r.data);
        } else if (page === "students") {
          const r = await api.get("/users?role=STUDENT");
          setRows(r.data);
        } else {
          const kind = page === "audit-logs" ? "audit-logs" : page;
          const r = await api.get(`/${kind}`);
          setRows(r.data.items || r.data);
        }
      } catch (e: any) {
        if (active)
          setToast(e.response?.data?.message || "Could not load information");
      } finally {
        if (active && showBusy) setBusy(false);
      }
    };
    load();
    if (page !== "overview")
      return () => {
        active = false;
      };
    const interval = window.setInterval(() => load(false), 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [page, user]);
  const title =
    page === "overview"
      ? "Good morning, " + user.name.split(" ")[0]
      : (
          {
            profile: "My Profile",
            assistant: "AI Hostel Assistant",
            "audit-logs": "Audit Logs",
            "payment-verification": "Payment Verification",
            "room-change": "Room Change Requests",
            "my-hostel": "My Hostel",
            hostels: "Hostel Management",
            wardens: "Warden Management",
            students: student ? "My Profile" : "Student Management",
            rooms: student ? "My Room" : "Room Management",
            fees: "Fee Management",
            complaints: student ? "Complaints" : "Complaint Monitoring",
            attendance: "Attendance Management",
            leave: student ? "Leave Requests" : "Leave Management",
            visitors: student ? "Visitor Requests" : "Visitor Management",
            notices: "Hostel Notices",
            mess: "Mess Information",
            analytics: "AI Analytics",
            reports: "Reports & Exports",
            roles: "Roles & Permissions",
            settings: "System Settings",
          } as any
        )[page] || page;
  const addable =
    (["hostels", "students", "wardens", "rooms", "fees"].includes(page) &&
      user.role === "SUPER_ADMIN") ||
    (page === "complaints" && student) ||
    (["attendance", "notices", "mess"].includes(page) &&
      user.role !== "STUDENT") ||
    ["leave", "visitors"].includes(page) ||
    (page === "room-change" && student);
  const actions: any = {
    hostels: "Add hostel",
    students: "Add student",
    wardens: "Add warden",
    rooms: "Add room",
    fees: "Record payment",
    complaints: "New complaint",
    attendance: "Record attendance",
    leave: "New leave request",
    visitors: "New visitor request",
    notices: "Publish notice",
    mess: "Update menu",
  };
  async function sendChat(e: any) {
    e.preventDefault();
    if (!message.trim()) return;
    const q = message;
    setChat([...chat, { q, a: "" }]);
    setMessage("");
    setChatBusy(true);
    try {
      const r = await api.post("/ai/chat", { message: q });
      setChat((c) =>
        c.map((x, i) => (i === c.length - 1 ? { ...x, a: r.data.answer } : x)),
      );
    } catch (e: any) {
      setChat((c) =>
        c.map((x, i) =>
          i === c.length - 1
            ? {
                ...x,
                a:
                  e.response?.data?.message ||
                  "Assistant is unavailable right now.",
              }
            : x,
        ),
      );
    } finally {
      setChatBusy(false);
    }
  }
  return (
    <div className="content-wrap">
      <div className="page-heading">
        <div>
          <div className="eyebrow muted-eyebrow">
            {page === "overview"
              ? new Date()
                  .toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "2-digit",
                    year: "numeric",
                  })
                  .toUpperCase()
              : "GITA AUTONOMOUS COLLEGE"}
          </div>
          <h1>{title}</h1>
          <p>
            {page === "overview" ? (
              <>
                Here is what is happening across your hostel today.{" "}
                <span className="live-status">
                  Live ·{" "}
                  {data?.lastUpdated
                    ? new Date(data.lastUpdated).toLocaleTimeString()
                    : "Connecting..."}
                </span>
              </>
            ) : page === "assistant" ? (
              "Ask questions about hostel information and policies."
            ) : (
              `Manage and review ${title.toLowerCase()} for your workspace.`
            )}
          </p>
        </div>
        {addable && (
          <button
            className="primary-btn"
            onClick={() =>
              page === "room-change" ? setRoomChangeOpen(true) : setModal(true)
            }
          >
            <Plus size={16} />
            {page === "room-change" ? "Request room change" : actions[page]}
          </button>
        )}
      </div>
      {busy ? (
        <div className="skeleton-grid">
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
      ) : page === "overview" ? (
        <Overview data={data || { stats: {} }} user={user} setPage={setPage} />
      ) : page === "assistant" ? (
        <div className="chat-layout">
          <div className="chat-card">
            <div className="chat-head">
              <div className="ai-badge">
                <MessageCircle size={19} />
              </div>
              <div>
                <b>Hostel Assistant</b>
                <small>
                  <i /> Groq AI · verified campus information
                </small>
              </div>
              <button className="icon-btn" onClick={() => setChat([])}>
                <X size={16} />
              </button>
            </div>
            <div className="chat-messages">
              {chat.length === 0 && (
                <div className="chat-welcome">
                  <div className="ai-badge large">
                    <MessageCircle size={24} />
                  </div>
                  <h2>How can I help?</h2>
                  <p>
                    Ask about your hostel, daily routines, or campus procedures.
                  </p>
                  <div className="suggestions">
                    {[
                      "What should I include in a complaint?",
                      "How do I request leave?",
                      "What is on the mess menu?",
                    ].map((q) => (
                      <button key={q} onClick={() => setMessage(q)}>
                        {q}
                        <ArrowUpRight size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} className="chat-pair">
                  <div className="chat-q">
                    <span className="chat-user-icon">
                      <UserRound size={15} />
                    </span>
                    {m.q}
                  </div>
                  <div className="chat-a">
                    <div className="ai-mini">
                      <MessageCircle size={14} />
                    </div>
                    {m.a || "Thinking..."}
                  </div>
                </div>
              ))}
            </div>
            <form className="chat-input" onSubmit={sendChat}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a hostel related question..."
              />
              <button className="primary-btn" disabled={chatBusy}>
                <Send size={14} /> Send
              </button>
            </form>
            <div className="chat-note">
              Assistant responses are based on verified hostel information.
            </div>
          </div>
          <div className="chat-side">
            <h3>What I can help with</h3>
            {[
              ["House rules", "Access verified campus guidance"],
              ["Mess information", "Daily menus and meal timings"],
              ["Student requests", "Complaint, leave and visitor steps"],
            ].map(([a, b]) => (
              <div className="help-row" key={a}>
                <Check size={16} />
                <div>
                  <b>{a}</b>
                  <small>{b}</small>
                </div>
              </div>
            ))}
            <div className="privacy-note">
              <Shield size={16} />
              <span>
                Your personal information stays private. The assistant will
                refer you to your warden when policy details are not available.
              </span>
            </div>
          </div>
        </div>
      ) : page === "profile" ? (
        <div className="profile-workspace">
          <ProfileEditor user={user} onSaved={setUser} setToast={setToast} />
          <TwoFactorPanel user={user} onSaved={setUser} setToast={setToast} />
        </div>
      ) : ["settings", "analytics", "reports", "roles"].includes(page) ? (
        <SpecialPage
          page={page}
          role={user.role}
          data={data}
          setToast={setToast}
        />
      ) : page === "attendance" && user.role !== "STUDENT" ? (
        <AttendanceManager user={user} setToast={setToast} />
      ) : (
        <Records
          page={
            page === "payment-verification"
              ? "payments"
              : page === "my-hostel"
                ? "hostels"
                : page
          }
          rows={rows.filter((x) =>
            JSON.stringify(x).toLowerCase().includes(search.toLowerCase()),
          )}
          search={search}
          setSearch={setSearch}
          user={user}
          setToast={setToast}
          onPay={setPayment}
          onAllocate={() => setAllocateOpen(true)}
          onRoomChange={() => setRoomChangeOpen(true)}
          onNotice={setNotice}
          onChanged={async () => {
            const kind =
              page === "payment-verification"
                ? "payments"
                : page === "my-hostel"
                  ? "hostels"
                  : page;
            const r = await api.get(
              kind === "hostels"
                ? "/hostels"
                : kind === "wardens"
                  ? "/users?role=HOSTEL_WARDEN"
                  : kind === "students"
                    ? "/users?role=STUDENT"
                    : `/${kind}`,
            );
            setRows(r.data.items || r.data);
          }}
        />
      )}
      {roomChangeOpen && (
        <RoomChangeModal
          onClose={() => setRoomChangeOpen(false)}
          onSaved={() => {
            setRoomChangeOpen(false);
            setToast("Room change request submitted");
            api
              .get("/room-change")
              .then((r) => setRows(r.data.items || r.data))
              .catch(() => {});
          }}
        />
      )}
      {allocateOpen && (
        <AllocationModal
          onClose={() => setAllocateOpen(false)}
          onSaved={() => {
            setAllocateOpen(false);
            setToast("Room allocated successfully");
            api
              .get("/rooms")
              .then((r) => setRows(r.data.items || r.data))
              .catch(() => {});
          }}
        />
      )}
      {payment && (
        <PaymentModal
          fee={payment}
          onClose={() => setPayment(null)}
          onDone={() => {
            setPayment(null);
            setToast("Demo payment submitted for review");
            api
              .get("/fees")
              .then((r) => setRows(r.data.items || r.data))
              .catch(() => {});
          }}
        />
      )}
      {notice && (
        <NoticeModal notice={notice} onClose={() => setNotice(null)} />
      )}{" "}
      {modal && (
        <CreateModal
          page={page}
          user={user}
          onClose={() => setModal(false)}
          onSaved={async () => {
            setModal(false);
            setToast("Record saved successfully");
            try {
              if (page === "hostels") {
                const r = await api.get("/hostels");
                setRows(r.data);
              } else {
                const r = await api.get(
                  page === "wardens"
                    ? "/users?role=HOSTEL_WARDEN"
                    : page === "students"
                      ? "/users?role=STUDENT"
                      : `/${page === "payment-verification" ? "payments" : page}`,
                );
                setRows(r.data.items || r.data);
              }
            } catch {}
          }}
        />
      )}
    </div>
  );
}
function TwoFactorPanel({
  user,
  onSaved,
  setToast,
}: {
  user: User;
  onSaved: (u: User) => void;
  setToast: (s: string) => void;
}) {
  const [setup, setSetup] = useState<{
    url: string;
    secret: string;
    qr: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  async function begin() {
    setBusy(true);
    try {
      const r = await api.post("/auth/2fa/setup");
      const qr = await QRCode.toDataURL(r.data.otpauthUrl, {
        width: 180,
        margin: 1,
      });
      setSetup({ url: r.data.otpauthUrl, secret: r.data.secret, qr });
    } catch (e: any) {
      setToast(
        e.response?.data?.message || "Could not start authenticator setup",
      );
    } finally {
      setBusy(false);
    }
  }
  async function enable() {
    setBusy(true);
    try {
      const r = await api.post("/auth/2fa/enable", { code });
      onSaved(r.data.user);
      setRecovery(r.data.recoveryCodes);
      setSetup(null);
      setCode("");
      setToast("Google Authenticator is enabled");
    } catch (e: any) {
      setToast(
        e.response?.data?.message || "Enter the current authenticator code",
      );
    } finally {
      setBusy(false);
    }
  }
  async function disable() {
    setBusy(true);
    try {
      const r = await api.post("/auth/2fa/disable", { code });
      onSaved(r.data.user);
      setCode("");
      setToast("Two-factor authentication disabled");
    } catch (e: any) {
      setToast(e.response?.data?.message || "Enter a valid authenticator code");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="security-panel">
      <div className="security-panel-head">
        <div className="security-icon">
          <ShieldCheck size={19} />
        </div>
        <div>
          <h3>Google Authenticator</h3>
          <p>Add an extra layer of protection to your HostelOS account.</p>
        </div>
        <span
          className={`security-status ${user.twoFactorEnabled ? "enabled" : ""}`}
        >
          {user.twoFactorEnabled ? "Enabled" : "Not enabled"}
        </span>
      </div>
      {recovery.length > 0 ? (
        <div className="recovery-codes">
          <b>Save your recovery codes</b>
          <p>
            Each code works once if you lose access to your authenticator app.
          </p>
          <div>
            {recovery.map((x) => (
              <code key={x}>{x}</code>
            ))}
          </div>
          <button className="secondary-btn" onClick={() => setRecovery([])}>
            I saved these codes
          </button>
        </div>
      ) : setup ? (
        <div className="authenticator-setup">
          <div>
            <b>1. Scan this QR code</b>
            <p>Open Google Authenticator and add a new account.</p>
            <img src={setup.qr} alt="Google Authenticator setup QR code" />
          </div>
          <div>
            <b>2. Enter the 6-digit code</b>
            <p>Use the current code from your authenticator app.</p>
            <input
              className="security-code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
            />
            <button
              className="primary-btn"
              disabled={busy || code.length !== 6}
              onClick={enable}
            >
              {busy ? "Verifying…" : "Verify and enable"}
            </button>
            <small>
              Can’t scan? Use key: <code>{setup.secret}</code>
            </small>
          </div>
        </div>
      ) : user.twoFactorEnabled ? (
        <div className="security-action">
          <span>
            Your account is protected with an authenticator app. Login remains
            available with your current password.
          </span>
          <div>
            <input
              className="security-code compact"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Code"
            />
            <button
              className="secondary-btn"
              disabled={busy || code.length !== 6}
              onClick={disable}
            >
              Disable 2FA
            </button>
          </div>
        </div>
      ) : (
        <div className="security-action">
          <span>
            Optional protection for students, wardens, and administrators.
          </span>
          <button className="primary-btn" disabled={busy} onClick={begin}>
            {busy ? "Starting…" : "Set up authenticator"}
          </button>
        </div>
      )}
    </section>
  );
}
function ProfileEditor({
  user,
  onSaved,
  setToast,
}: {
  user: User;
  onSaved: (u: User) => void;
  setToast: (s: string) => void;
}) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    department: user.department || "",
    course: user.course || "",
    academicYear: user.academicYear || "",
    guardianName: user.guardianName || "",
    guardianPhone: user.guardianPhone || "",
    profileImage: user.profileImage || "",
  });
  const [preview, setPreview] = useState(
    // user.profileImage ? `/api/uploads/${user.profileImage}` : "",
    user.profileImage
  ? `${API_URL}/api/uploads/${user.profileImage}`
  : ""
  );
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [assignedHostel, setAssignedHostel] = useState(
    user.hostel ? "Loading assignment…" : "Not assigned",
  );
  const initials = form.name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  useEffect(() => {
    if (!user.hostel) {
      setAssignedHostel("Not assigned");
      return;
    }
    let active = true;
    api
      .get("/hostels")
      .then((r) => {
        const assigned = r.data.find(
          (h: { _id: string; name: string; code?: string }) =>
            h._id.toLowerCase() === user.hostel?.toLowerCase(),
        );
        if (active)
          setAssignedHostel(
            assigned
              ? `${assigned.name}${assigned.code ? ` · ${assigned.code}` : ""}`
              : "Assignment not found",
          );
      })
      .catch((e) => {
        if (active) {
          setAssignedHostel("Could not load assignment");
          setToast(
            e.response?.data?.message || "Could not load hostel assignment",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [user.hostel, setToast]);
  async function save(e: any) {
    e.preventDefault();
    setBusy(true);
    try {
      let profileImage = form.profileImage;
      if (file) {
        const body = new FormData();
        body.append("file", file);
        const upload = await api.post("/uploads?type=profiles", body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        profileImage = upload.data.id;
      }
      const r = await api.put("/auth/me", { ...form, profileImage });
      onSaved(r.data.user);
      setForm((x) => ({ ...x, profileImage }));
      setFile(null);
      setToast("Profile updated successfully");
    } catch (e: any) {
      setToast(e.response?.data?.message || "Could not update your profile");
    } finally {
      setBusy(false);
    }
  }
  function changeFile(e: any) {
    const next = e.target.files?.[0];
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setToast("Choose a JPG, PNG, or WebP image");
      return;
    }
    if (next.size > 5 * 1024 * 1024) {
      setToast("Profile image must be smaller than 5 MB");
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }
  return (
    <form className="profile-editor" onSubmit={save}>
      <section className="profile-card profile-identity-card">
        <div className="profile-top">
          <div className="profile-avatar-wrap">
            {preview ? (
              <img
                className="avatar profile-avatar profile-image"
                src={preview}
                alt="Profile"
              />
            ) : (
              <div className="avatar profile-avatar">{initials}</div>
            )}
            <label className="profile-image-edit" title="Update profile image">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={changeFile}
              />
              <Eye size={14} />
            </label>
          </div>
          <div>
            <span className="profile-role">{user.role.replace("_", " ")}</span>
            <h2>{form.name}</h2>
            <p>{form.email}</p>
            <small className="profile-status">
              <i /> Active account
            </small>
          </div>
        </div>
        <div className="profile-form-grid">
          <label>
            Full name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            Mobile number
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Add mobile number"
            />
          </label>
          {user.role === "STUDENT" && (
            <>
              <label>
                Department
                <input
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                  placeholder="Add department"
                />
              </label>
              <label>
                Course
                <input
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  placeholder="Add course"
                />
              </label>
              <label>
                Academic year
                <input
                  value={form.academicYear}
                  onChange={(e) =>
                    setForm({ ...form, academicYear: e.target.value })
                  }
                  placeholder="e.g. 2025-26"
                />
              </label>
              <label>
                Guardian name
                <input
                  value={form.guardianName}
                  onChange={(e) =>
                    setForm({ ...form, guardianName: e.target.value })
                  }
                  placeholder="Optional"
                />
              </label>
              <label>
                Guardian mobile
                <input
                  value={form.guardianPhone}
                  onChange={(e) =>
                    setForm({ ...form, guardianPhone: e.target.value })
                  }
                  placeholder="Optional"
                />
              </label>
            </>
          )}
        </div>
        <div className="profile-footer">
          <span>Changes are saved securely to your account.</span>
          <button className="primary-btn" disabled={busy}>
            {busy ? "Saving changes…" : "Save profile"}
          </button>
        </div>
      </section>
      <aside className="profile-side-card">
        <div className="profile-side-icon">
          <ShieldCheck size={18} />
        </div>
        <h3>Account details</h3>
        <p>Your role and access are managed by the hostel administration.</p>
        <div>
          <small>Access level</small>
          <b>{user.role.replace("_", " ")}</b>
        </div>
        <div>
          <small>Hostel assignment</small>
          <b>{assignedHostel}</b>
        </div>
        <div>
          <small>Profile image</small>
          <b>{preview ? "Uploaded" : "Initials avatar"}</b>
        </div>
      </aside>
    </form>
  );
}
function NoticeModal({
  notice,
  onClose,
}: {
  notice: any;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="form-overline">HOSTEL NOTICE</div>
            <h2>{notice.title || "Notice"}</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="notice-detail">
          <span className="status approved">
            {notice.categoryType || "General"}
          </span>
          <p>{notice.description || "No additional details were provided."}</p>
          <small>
            Published{" "}
            {notice.createdAt
              ? new Date(notice.createdAt).toLocaleString()
              : "recently"}
          </small>
        </div>
        <div className="modal-actions">
          <button className="primary-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
function Overview({
  data,
  user,
  setPage,
}: {
  data: any;
  user: User;
  setPage: (p: string) => void;
}) {
  const s = data.stats || {};
  const delta = (value: number | undefined, period: string) => {
    const n = Number(value || 0);
    return `${n > 0 ? "↑ +" : n < 0 ? "↓ −" : "↑ +"}${Math.abs(n)} ${period}`;
  };
  const cards =
    user.role === "STUDENT"
      ? [
          [
            "Fee balance",
            `₹${Number(s.outstandingFees || 0).toLocaleString("en-IN")}`,
            "Fees currently due",
            "fees",
            Wallet,
          ],
          [
            "Open complaints",
            String(s.pendingComplaints || 0),
            "Your unresolved requests",
            "complaints",
            AlertCircle,
          ],
          [
            "Attendance",
            s.attendance == null ? "—" : `${s.attendance}%`,
            "Recent 31 days",
            "attendance",
            CalendarDays,
          ],
          [
            "Notices",
            String(data.notices?.length || 0),
            "Latest hostel updates",
            "notices",
            FileText,
          ],
        ]
      : user.role === "HOSTEL_WARDEN"
        ? [
            [
              "Total Students",
              s.students || 0,
              "Active students",
              "students",
              Users,
            ],
            [
              "Total Rooms",
              s.rooms == null ? "—" : s.rooms,
              `${s.occupied || 0} beds used · ${s.available || 0} available`,
              "rooms",
              BedDouble,
            ],
            [
              "Pending Requests",
              s.pendingRequests || 0,
              delta(s.trends?.pendingRequests, "this week"),
              "leave",
              ClipboardList,
            ],
            [
              "Open complaints",
              s.pendingComplaints || 0,
              "Needs staff attention",
              "complaints",
              AlertCircle,
            ],
          ]
        : [
            [
              "Total Hostels",
              s.hostels || 0,
              delta(s.trends?.hostels, "this month"),
              "hostels",
              Building2,
            ],
            [
              "Total Rooms",
              s.rooms == null ? "—" : s.rooms,
              delta(s.trends?.rooms, "this month"),
              "rooms",
              BedDouble,
            ],
            [
              "Total Students",
              s.students == null ? "—" : s.students,
              delta(s.trends?.students, "from last month"),
              "students",
              Users,
            ],
            [
              "Pending Requests",
              s.pendingRequests || 0,
              delta(s.trends?.pendingRequests, "this week"),
              "leave",
              ClipboardList,
            ],
          ];
  const chart = data.series || [];
  return (
    <>
      <div className="stats-grid">
        {cards.map(([name, val, sub, key, Icon]: any, i) => (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
            key={name}
            onClick={() => setPage(key)}
          >
            <div className="stat-top">
              <span>{name}</span>
              <span className="stat-icon">
                <Icon size={17} />
              </span>
            </div>
            <strong>{val}</strong>
            <small>{sub}</small>
          </motion.button>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-title">
            <div>
              <h3>
                {user.role === "STUDENT"
                  ? "Campus pulse"
                  : "Operational overview"}
              </h3>
              <p>Recent activity across your campus</p>
            </div>
            <button className="select-btn">
              This week <ChevronDown size={14} />
            </button>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-blue" />
              Complaints
            </span>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6076e9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6076e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 4"
                  vertical={false}
                  stroke="var(--line)"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--subtle)", fontSize: 11 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    color: "var(--text)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="complaints"
                  stroke="#6276e8"
                  strokeWidth={2}
                  fill="url(#g1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel quick-panel">
          <div className="panel-title">
            <div>
              <h3>Quick actions</h3>
              <p>Common tasks at a glance</p>
            </div>
          </div>
          <div className="quick-list">
            {(user.role === "STUDENT"
              ? [
                  ["Submit a complaint", "complaints", AlertCircle],
                  ["Request leave", "leave", CalendarDays],
                  ["View notices", "notices", FileText],
                ]
              : user.role === "SUPER_ADMIN"
                ? [
                    ["Add student", "students", Users],
                    ["Create a hostel", "hostels", Building2],
                    ["Review complaints", "complaints", AlertCircle],
                  ]
                : [
                    ["Review complaints", "complaints", AlertCircle],
                    ["Review leave requests", "leave", CalendarDays],
                    ["Publish notice", "notices", FileText],
                  ]
            ).map(([label, key, Icon]: any) => (
              <button key={key} onClick={() => setPage(key)}>
                <span>
                  <Icon size={16} />
                </span>
                {label}
                <span className="quick-arrow">↗</span>
              </button>
            ))}
          </div>
          <div className="system-note">
            <span className="status-dot" />
            <div>
              <b>System operational</b>
              <small>Services are running normally</small>
            </div>
          </div>
        </section>
      </div>
      {user.role === "STUDENT" && (
        <section className="panel student-room-strip">
          <div className="room-strip-icon">
            <BedDouble size={20} />
          </div>
          <div>
            <small>YOUR ROOM</small>
            <b>
              {data.room
                ? `Room ${data.room.number || "—"} · ${data.room.block || "Block not set"}`
                : "No active room allocation"}
            </b>
          </div>
          <span>
            {data.room
              ? `Floor ${data.room.floor ?? "—"}`
              : "Contact your warden to get assigned"}
          </span>
        </section>
      )}
      <div className="lower-grid">
        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h3>Recent complaints</h3>
              <p>Latest submissions requiring attention</p>
            </div>
            <button className="text-btn" onClick={() => setPage("complaints")}>
              View all <span>→</span>
            </button>
          </div>
          <div className="mini-table">
            <div className="mini-head">
              <span>COMPLAINT</span>
              <span>PRIORITY</span>
              <span>STATUS</span>
            </div>
            {(data.complaints || []).length ? (
              data.complaints.slice(0, 4).map((r: any) => (
                <div className="mini-row" key={r._id}>
                  <div>
                    <b>
                      {r.title ||
                        r.summary ||
                        r.description ||
                        "Maintenance request"}
                    </b>
                    <small>
                      {r.category || "Unclassified"} ·{" "}
                      {new Date(r.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <span
                    className={`priority ${String(r.priority || "Medium").toLowerCase()}`}
                  >
                    {r.priority || "Medium"}
                  </span>
                  <span
                    className={`status ${String(r.status || "Pending")
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {r.status || "Pending"}
                  </span>
                </div>
              ))
            ) : (
              <div className="empty-row">No complaint records yet</div>
            )}
          </div>
        </section>
        <section className="panel notices-panel">
          <div className="panel-title">
            <div>
              <h3>Latest notices</h3>
              <p>Campus announcements</p>
            </div>
            <button className="text-btn" onClick={() => setPage("notices")}>
              View all →
            </button>
          </div>
          {(data.notices || []).length ? (
            (data.notices || []).slice(0, 3).map((n: any) => (
              <div className="notice-row" key={n._id}>
                <div className="notice-mark">
                  <FileText size={15} />
                </div>
                <div>
                  <b>{n.title || "Campus notice"}</b>
                  <small>{n.description || ""}</small>
                </div>
                <span>
                  {new Date(n.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))
          ) : (
            <div className="empty-row">No notices published</div>
          )}
        </section>
      </div>
    </>
  );
}
function displayField(field: string, value: any): string {
  if (!value) return display(value);
  if (field === "meals" || field === "timings") {
    if (typeof value === "object")
      return Object.entries(value)
        .map(([key, item]) => `${key}: ${item}`)
        .join(" · ");
    try {
      const parsed = JSON.parse(String(value));
      if (parsed && typeof parsed === "object")
        return Object.entries(parsed)
          .map(([key, item]) => `${key}: ${item}`)
          .join(" · ");
    } catch {}
    return String(value);
  }
  return [
    "attendanceDate",
    "dueDate",
    "departure",
    "returnDate",
    "visitDate",
    "createdAt",
    "submittedAt",
  ].includes(field)
    ? new Date(value).toLocaleDateString()
    : display(value);
}
function RecordFilters({
  page,
  rows,
  filter,
  setFilter,
  hostelFilter,
  setHostelFilter,
}: {
  page: string;
  rows: any[];
  filter: string;
  setFilter: (value: string) => void;
  hostelFilter: string;
  setHostelFilter: (value: string) => void;
}) {
  const fixed: any = {
    hostels: ["All hostels", "Active", "Main", "Capacity 500", "Capacity 1000"],
    complaints: [
      "All statuses",
      "Pending",
      "In Progress",
      "Resolved",
      "High priority",
      "Medium priority",
      "Low priority",
    ],
    leave: ["All statuses", "Pending", "Approved", "Rejected"],
    visitors: ["All statuses", "Pending", "Inside", "Completed"],
    payments: ["All statuses", "UNDER_REVIEW", "APPROVED", "REJECTED"],
    fees: [
      "All statuses",
      "Pending",
      "UNDER_REVIEW",
      "PAID",
      "PARTIALLY_PAID",
      "UNPAID",
    ],
    attendance: ["All statuses", "Present", "Absent", "On Leave"],
    "room-change": ["All statuses", "Pending", "Approved", "Rejected"],
    notices: ["All notices", "Important", "General"],
    rooms: ["All statuses", "Available", "Full", "Maintenance"],
  }[page];
  const departments =
    page === "students"
      ? [
          "All departments",
          ...Array.from(new Set(rows.map((r) => r.department).filter(Boolean))),
        ]
      : [];
  const hostels =
    page === "students"
      ? [
          "All hostels",
          ...Array.from(
            new Set(
              rows.map((r) => r.hostel?.name || r.hostel).filter(Boolean),
            ),
          ),
        ]
      : [];
  const dynamic =
    page === "students"
      ? departments
      : page === "wardens"
        ? [
            "All hostels",
            ...Array.from(
              new Set(
                rows.map((r) => r.hostel?.name || r.hostel).filter(Boolean),
              ),
            ),
          ]
        : fixed || [];
  const labels: any = {
    complaints: "Filter complaints",
    leave: "Filter requests",
    visitors: "Filter visits",
    payments: "Filter payments",
    fees: "Filter fees",
    attendance: "Filter attendance",
    students: "Filter department",
    wardens: "Filter hostel",
    rooms: "Filter rooms",
    notices: "Filter notices",
    "room-change": "Filter requests",
  };
  if (page === "students")
    return (
      <>
        <select
          className="select-btn record-filter"
          aria-label="Filter by department"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {departments.map((x: string) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          className="select-btn record-filter"
          aria-label="Filter by hostel"
          value={hostelFilter}
          onChange={(e) => setHostelFilter(e.target.value)}
        >
          {hostels.map((x: string) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </>
    );
  return dynamic.length ? (
    <select
      className="select-btn record-filter"
      aria-label={labels[page] || "Filter records"}
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    >
      {dynamic.map((x: string) => (
        <option key={x}>{x}</option>
      ))}
    </select>
  ) : null;
}
function AttendanceManager({
  user,
  setToast,
}: {
  user: User;
  setToast: (s: string) => void;
}) {
  const [hosts, setHosts] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [hostel, setHostel] = useState(user.hostel || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([api.get("/hostels"), api.get("/users?role=STUDENT&limit=200")])
      .then(([h, s]) => {
        setHosts(h.data);
        setStudents(
          s.data.filter(
            (x: any) =>
              user.role === "SUPER_ADMIN" ||
              String(x.hostel?._id || x.hostel) === String(user.hostel),
          ),
        );
        if (!hostel && h.data[0])
          setHostel(
            user.role === "SUPER_ADMIN"
              ? h.data[0]._id
              : user.hostel || h.data[0]._id,
          );
      })
      .catch(() => setToast("Could not load attendance roster"));
  }, []);
  useEffect(() => {
    if (!hostel || !date) return;
    api
      .get(`/attendance?limit=200`)
      .then((r) => {
        const next: any = {};
        const matching = (r.data.items || []).filter(
          (x: any) =>
            String(x.hostel) === String(hostel) &&
            String(x.attendanceDate || "").slice(0, 10) === date,
        );
        matching.forEach((x: any) => {
          next[x.student?._id || x.student] = x.status;
        });
        setStatus(next);
        setLocked(matching.length > 0);
      })
      .catch(() => {});
  }, [hostel, date]);
  const roster = students.filter(
    (x: any) =>
      String(x.hostel?._id || x.hostel) === String(hostel) &&
      JSON.stringify(x).toLowerCase().includes(filter.toLowerCase()),
  );
  const mark = (id: string, value: string) =>
    setStatus((s) => ({ ...s, [id]: value }));
  async function save() {
    setBusy(true);
    try {
      await api.post("/attendance/bulk", {
        hostel,
        attendanceDate: date,
        records: roster.map((s) => ({
          student: s._id,
          status: status[s._id] || "Present",
        })),
      });
      setLocked(true);
      setToast(`Attendance saved and locked for ${date}`);
    } catch (e: any) {
      setToast(e.response?.data?.message || "Could not save attendance");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="panel records-panel">
      <div className="panel-title">
        <div>
          <h3>Daily attendance</h3>
          <p>
            {locked
              ? "This attendance register is locked and read-only."
              : "Mark the complete hostel roster once, then save."}
          </p>
        </div>
        {locked ? (
          <span className="status approved">Locked · Read only</span>
        ) : (
          <button
            className="primary-btn"
            onClick={save}
            disabled={busy || !roster.length}
          >
            {busy ? "Saving..." : "Save attendance"}
          </button>
        )}
      </div>
      <div className="record-toolbar">
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        {user.role === "SUPER_ADMIN" && (
          <label>
            Hostel
            <select value={hostel} onChange={(e) => setHostel(e.target.value)}>
              {hosts.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="searchbox">
          <Search size={16} />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter students..."
          />
        </div>
        <span className="record-count">{roster.length} students</span>
      </div>
      {!roster.length ? (
        <div className="records-empty">
          <h3>No students found</h3>
          <p>Select another hostel or clear the filter.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>REGISTRATION</th>
                <th>ATTENDANCE</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s) => (
                <tr key={s._id}>
                  <td>
                    <b>{s.name}</b>
                    <small>{s.email}</small>
                  </td>
                  <td>{s.registrationNumber || "—"}</td>
                  <td>
                    <select
                      value={status[s._id] || "Present"}
                      onChange={(e) => mark(s._id, e.target.value)}
                      disabled={locked}
                    >
                      <option>Present</option>
                      <option>Absent</option>
                      <option>On Leave</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
function Records({
  page,
  rows,
  search,
  setSearch,
  user,
  setToast,
  onPay,
  onAllocate,
  onRoomChange,
  onChanged,
  onNotice,
}: {
  page: string;
  rows: any[];
  search: string;
  setSearch: (s: string) => void;
  user: User;
  setToast: (s: string) => void;
  onPay: (fee: any) => void;
  onAllocate: () => void;
  onRoomChange: () => void;
  onChanged: () => Promise<void>;
  onNotice: (notice: any) => void;
}) {
  const [filter, setFilter] = useState("");
  const [hostelFilter, setHostelFilter] = useState("");
  const filteredRows = rows.filter((r: any) => {
    if (
      page === "students" &&
      hostelFilter &&
      hostelFilter !== "All hostels" &&
      String(r.hostel?.name || r.hostel) !== hostelFilter
    )
      return false;
    if (!filter) return true;
    const value = String(r.status || "");
    if (page === "hostels") {
      if (filter === "Active")
        return String(r.status || "Active").toLowerCase() === "active";
      if (filter === "Main")
        return String(r.code || r.name || "")
          .toLowerCase()
          .includes("main");
      if (filter === "Capacity 500") return Number(r.capacity) === 500;
      if (filter === "Capacity 1000") return Number(r.capacity) === 1000;
    }
    if (filter === "Important") return Boolean(r.important);
    if (filter === "General") return !r.important;
    if (filter.includes("priority"))
      return (
        String(r.priority || "").toLowerCase() ===
        filter.split(" ")[0].toLowerCase()
      );
    if (
      [
        "All statuses",
        "All departments",
        "All hostels",
        "All rooms",
        "All notices",
        "",
      ].includes(filter)
    )
      return true;
    if (page === "students" && filter !== "All departments")
      return String(r.department || "") === filter;
    if (page === "wardens")
      return String(r.hostel?.name || r.hostel || "")
        .toLowerCase()
        .includes(filter.toLowerCase());
    return value.toLowerCase() === filter.toLowerCase();
  });
  let columns: any = {
    hostels: ["name", "code", "address", "capacity"],
    students: ["name", "email", "registrationNumber", "department"],
    wardens: ["name", "email", "hostel"],
    rooms: ["number", "block", "floor", "capacity", "occupied", "status"],
    fees: [
      "title",
      "student",
      "amount",
      "paid",
      "dueDate",
      "status",
      "payment",
    ],
    complaints: ["title", "category", "priority", "status", "createdAt"],
    attendance: ["student", "attendanceDate", "status"],
    leave: ["reason", "destination", "departure", "returnDate", "status"],
    visitors: [
      "visitorName",
      "relationship",
      "visitDate",
      "arrivalTime",
      "status",
    ],
    notices: ["title", "categoryType", "important", "createdAt"],
    mess: ["title", "meals", "timings", "createdAt"],
    "audit-logs": ["action", "actor", "createdAt"],
    payments: [
      "student",
      "reference",
      "amount",
      "status",
      "submittedAt",
      "remarks",
    ],
    "room-change": ["title", "reason", "desiredRoom", "status", "createdAt"],
  }[page] || ["title", "status", "createdAt"];
  if (page === "fees" && user.role === "STUDENT")
    columns = ["title", "amount", "paid", "dueDate", "status"];
  const isManage =
    [
      "complaints",
      "leave",
      "visitors",
      "payments",
      "allocations",
      "room-change",
    ].includes(page) && user.role !== "STUDENT";
  const canReadNotice = user.role === "STUDENT" && page === "notices";
  async function update(row: any, status: string) {
    try {
      const remarks =
        status === "REJECTED"
          ? window.prompt("Reason for rejection (required):") || ""
          : "";
      if (status === "REJECTED" && !remarks) return;
      await api.patch(`/${page}/${row._id}`, { status, remarks });
      await onChanged();
      setToast("Status updated");
    } catch {
      setToast("Could not update record");
    }
  }
  return (
    <div
      className={`panel records-panel ${page === "hostels" ? "hostel-records-panel" : ""}`}
    >
      {page === "hostels" && (
        <div className="hostel-kpi-grid">
          <div>
            <span>Total Hostels</span>
            <b>{rows.length}</b>
            <small>↑ +0 this month</small>
          </div>
          <div>
            <span>Total Rooms</span>
            <b>
              {rows.reduce(
                (n, r) => n + Number(r.rooms || r.totalRooms || 0),
                0,
              ) || "—"}
            </b>
            <small>↑ +5 this month</small>
          </div>
          <div>
            <span>Total Students</span>
            <b>
              {rows.reduce((n, r) => n + Number(r.occupied || 0), 0) || "—"}
            </b>
            <small>↑ +8% from last month</small>
          </div>
          <div>
            <span>Pending Requests</span>
            <b>12</b>
            <small>↑ −2 this week</small>
          </div>
        </div>
      )}
      <div className="record-toolbar">
        <div className="searchbox">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${page}...`}
          />
        </div>
        <RecordFilters
          page={page}
          rows={rows}
          filter={filter}
          setFilter={setFilter}
          hostelFilter={hostelFilter}
          setHostelFilter={setHostelFilter}
        />
        {page === "rooms" && user.role !== "STUDENT" && (
          <button className="secondary-btn" onClick={onAllocate}>
            Allocate room
          </button>
        )}
        {page === "rooms" && user.role === "STUDENT" && (
          <button className="secondary-btn" onClick={onRoomChange}>
            Request room change
          </button>
        )}
        <span className="record-count">{filteredRows.length} records</span>
      </div>
      {filteredRows.length === 0 ? (
        <div className="records-empty">
          <div className="empty-icon">
            <FileText size={21} />
          </div>
          <h3>No records yet</h3>
          <p>New information will appear here when it is available.</p>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>
                  {page === "complaints" ? "COMPLAINT" : page.toUpperCase()}
                </th>
                {columns.slice(1).map((c: string) => (
                  <th key={c}>{c.replace(/([A-Z])/g, " $1").toUpperCase()}</th>
                ))}
                {(isManage ||
                  (user.role === "STUDENT" &&
                    ["fees", "notices"].includes(page))) && <th>ACTION</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r: any) => (
                <tr key={r._id}>
                  <td>
                    <b>{display(r[columns[0]])}</b>
                    <small>
                      {page === "payments"
                        ? r.student?.registrationNumber || "Student"
                        : r.email || r.description || r.summary || ""}
                    </small>
                  </td>
                  {columns.slice(1).map((c: string) => (
                    <td key={c}>
                      {c === "payment" ? (
                        <>
                          <b>{r.payment?.student?.name || "Not submitted"}</b>
                          {r.payment && (
                            <small>
                              {String(r.payment.status || "").replace("_", " ")}{" "}
                              · {display(r.payment.submittedAt)}
                            </small>
                          )}
                        </>
                      ) : c === "status" ? (
                        <span
                          className={`status ${String(r[c] || "Pending")
                            .toLowerCase()
                            .replace(/[_ ]/g, "-")}`}
                        >
                          {r[c] || "Pending"}
                        </span>
                      ) : c === "priority" ? (
                        <span
                          className={`priority ${String(r[c] || "Medium").toLowerCase()}`}
                        >
                          {r[c] || "Medium"}
                        </span>
                      ) : (
                        displayField(c, r[c])
                      )}
                    </td>
                  ))}
                  {(isManage ||
                    (user.role === "STUDENT" &&
                      ["fees", "notices"].includes(page))) && (
                    <td>
                      <div className="row-actions">
                        {canReadNotice ? (
                          <button
                            className="text-btn"
                            onClick={() => onNotice(r)}
                          >
                            Read notice
                          </button>
                        ) : user.role === "STUDENT" && page === "fees" ? (
                          ["PAID", "UNDER_REVIEW"].includes(
                            String(r.status).toUpperCase(),
                          ) ? (
                            <span
                              className={`status ${String(r.status).toLowerCase().replace("_", "-")}`}
                            >
                              {String(r.status).toUpperCase() === "UNDER_REVIEW"
                                ? "Under review"
                                : "Paid"}
                            </span>
                          ) : (
                            <button
                              className="action-success"
                              onClick={() => onPay(r)}
                            >
                              Submit payment
                            </button>
                          )
                        ) : page === "visitors" ? (
                          <>
                            <button
                              onClick={async () => {
                                try {
                                  await api.patch(`/visitors/${r._id}`, {
                                    entryAt: new Date().toISOString(),
                                    status: "Inside",
                                  });
                                  await onChanged();
                                  setToast("Visitor entry recorded");
                                } catch (e: any) {
                                  setToast(
                                    e.response?.data?.message ||
                                      "Could not record entry",
                                  );
                                }
                              }}
                            >
                              Record entry
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await api.patch(`/visitors/${r._id}`, {
                                    exitAt: new Date().toISOString(),
                                    status: "Completed",
                                  });
                                  await onChanged();
                                  setToast("Visitor exit recorded");
                                } catch (e: any) {
                                  setToast(
                                    e.response?.data?.message ||
                                      "Could not record exit",
                                  );
                                }
                              }}
                            >
                              Record exit
                            </button>
                          </>
                        ) : page === "room-change" ? (
                          <>
                            <button
                              onClick={async () => {
                                try {
                                  await api.post(
                                    `/room-change/${r._id}/process`,
                                    {
                                      status: "approved",
                                      roomId: r.desiredRoom,
                                      remarks: "Approved by hostel staff",
                                    },
                                  );
                                  await onChanged();
                                  setToast("Room change approved");
                                } catch (e: any) {
                                  setToast(
                                    e.response?.data?.message ||
                                      "Could not approve request",
                                  );
                                }
                              }}
                            >
                              Approve & transfer
                            </button>
                            <button
                              onClick={async () => {
                                const remarks = window.prompt(
                                  "Reason for rejecting this request:",
                                );
                                if (remarks === null) return;
                                try {
                                  await api.post(
                                    `/room-change/${r._id}/process`,
                                    { status: "rejected", remarks },
                                  );
                                  await onChanged();
                                  setToast("Room change rejected");
                                } catch (e: any) {
                                  setToast(
                                    e.response?.data?.message ||
                                      "Could not reject request",
                                  );
                                }
                              }}
                            >
                              Reject
                            </button>
                          </>
                        ) : page === "payments" ? (
                          <>
                            {String(r.status).toUpperCase() === "APPROVED" ? (
                              <button
                                onClick={async () => {
                                  const response = await api.get(
                                    `/payments/${r._id}/receipt`,
                                    { responseType: "blob" },
                                  );
                                  const url = URL.createObjectURL(
                                    response.data,
                                  );
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `demo-receipt-${r.reference}.pdf`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                }}
                              >
                                Receipt
                              </button>
                            ) : (
                              <>
                                <button onClick={() => update(r, "APPROVED")}>
                                  Approve
                                </button>
                                <button onClick={() => update(r, "REJECTED")}>
                                  Reject
                                </button>
                              </>
                            )}
                          </>
                        ) : page === "allocations" ? (
                          <button
                            onClick={async () => {
                              try {
                                await api.post(`/allocations/${r._id}/release`);
                                await onChanged();
                                setToast("Room released");
                              } catch (e: any) {
                                setToast(
                                  e.response?.data?.message ||
                                    "Could not release room",
                                );
                              }
                            }}
                          >
                            Release
                          </button>
                        ) : (
                          <>
                            <button onClick={() => update(r, "In Progress")}>
                              Start
                            </button>
                            <button onClick={() => update(r, "Approved")}>
                              Approve
                            </button>
                            <button onClick={() => update(r, "Resolved")}>
                              Resolve
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
function display(x: any): string {
  if (x == null) return "—";
  if (typeof x === "boolean") return x ? "Yes" : "No";
  if (typeof x === "object")
    return x instanceof Date
      ? x.toLocaleDateString()
      : Array.isArray(x)
        ? x.map(display).join(", ")
        : x.name || x.title || x._id || JSON.stringify(x).slice(0, 65);
  if (/date/i.test(String(x)) && !Number.isNaN(Date.parse(x)))
    return new Date(x).toLocaleDateString();
  return String(x);
}
function CreateModal({
  page,
  user,
  onClose,
  onSaved,
}: {
  page: string;
  user: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<any>({});
  const [hosts, setHosts] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/hostels")
      .then((r) => {
        setHosts(r.data);
        if (r.data[0])
          setForm((f: any) => ({ ...f, hostel: f.hostel || r.data[0]._id }));
      })
      .catch(() => {});
    if (page === "attendance")
      api
        .get("/users?role=STUDENT")
        .then((r) => setStudents(r.data))
        .catch(() => {});
  }, [page]);
  const specs: any =
    {
      hostels: [
        ["name", "Hostel name", "text", true],
        ["code", "Hostel code", "text", true],
        ["address", "Address", "text"],
        ["capacity", "Capacity", "number"],
      ],
      students: [
        ["name", "Full name", "text", true],
        ["email", "Email", "email", true],
        ["password", "Temporary password", "password", true],
        ["registrationNumber", "Registration number", "text"],
        ["rollNumber", "Roll number", "text"],
        ["department", "Department", "text"],
        ["course", "Course", "text"],
        ["academicYear", "Academic year", "text"],
        ["phone", "Phone", "tel"],
      ],
      wardens: [
        ["name", "Full name", "text", true],
        ["email", "Email", "email", true],
        ["password", "Temporary password", "password", true],
      ],
      rooms: [
        ["number", "Room number", "text", true],
        ["block", "Block", "text"],
        ["floor", "Floor", "number"],
        ["capacity", "Capacity", "number", true],
      ],
      fees: [
        ["title", "Fee description", "text", true],
        ["amount", "Amount (₹)", "number", true],
        ["dueDate", "Due date", "date"],
      ],
      complaints: [
        ["title", "Title", "text", true],
        ["description", "Describe the issue", "textarea", true],
      ],
      attendance: [
        ["attendanceDate", "Date", "date", true],
        [
          "status",
          "Attendance status",
          "select",
          true,
          ["Present", "Absent", "On Leave"],
        ],
      ],
      leave: [
        ["departure", "Departure date", "date", true],
        ["returnDate", "Return date", "date", true],
        ["destination", "Destination", "text", true],
        ["reason", "Reason", "textarea", true],
      ],
      visitors: [
        ["visitorName", "Visitor name", "text", true],
        ["relationship", "Relationship", "text"],
        ["visitDate", "Visit date", "date", true],
        ["arrivalTime", "Expected arrival time", "time"],
        ["contactNumber", "Contact number", "tel"],
      ],
      notices: [
        ["title", "Notice title", "text", true],
        ["description", "Announcement", "textarea", true],
        ["categoryType", "Category", "text"],
        ["important", "Mark as important", "checkbox"],
      ],
      mess: [
        ["title", "Menu title", "text", true],
        ["description", "Menu notes", "textarea"],
      ],
    }[page] || [];
  async function submit(e: any) {
    e.preventDefault();
    const hostelId = form.hostel || hosts[0]?._id;
    if (["students", "wardens"].includes(page) && !hostelId) {
      setError("Select a hostel before creating the account.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (page === "hostels") await api.post("/hostels", form);
      else if (["students", "wardens"].includes(page)) {
        const role = page === "students" ? "STUDENT" : "HOSTEL_WARDEN";
        await api.post("/users", { ...form, role, hostel: hostelId });
      } else
        await api.post(`/${page}`, {
          ...form,
          ...(page === "notices"
            ? { publishedAt: new Date().toISOString() }
            : {}),
          ...(page === "fees" ? { paid: 0, status: "Pending" } : {}),
        });
      onSaved();
    } catch (e: any) {
      const fields = e.response?.data?.errors?.fieldErrors;
      const details = fields
        ? Object.entries(fields).flatMap(
            ([field, messages]) =>
              `${field}: ${(messages as string[]).join(", ")}`,
          )
        : [];
      setError(
        details.join(" | ") ||
          e.response?.data?.message ||
          "Could not save this record. Check the form and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal-head">
          <div>
            <div className="form-overline">NEW RECORD</div>
            <h2>
              {
                (
                  {
                    hostels: "Add hostel",
                    students: "Add student",
                    wardens: "Add warden",
                    rooms: "Add room",
                    fees: "Record fee",
                    complaints: "Submit complaint",
                    attendance: "Record attendance",
                    leave: "Create leave request",
                    visitors: "Register visitor",
                    notices: "Publish notice",
                    mess: "Update mess menu",
                  } as any
                )[page]
              }
            </h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-fields">
          {specs.map(([key, label, type, required, options]: any) => (
            <label key={key}>
              {label}
              {type === "textarea" ? (
                <textarea
                  rows={3}
                  required={required}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              ) : type === "select" ? (
                <select
                  required={required}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                >
                  {options.map((x: string) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  minLength={key === "password" ? 10 : undefined}
                  required={required}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]:
                        type === "checkbox" ? e.target.checked : e.target.value,
                    })
                  }
                />
              )}
            </label>
          ))}
          {[
            "students",
            "wardens",
            "rooms",
            "fees",
            "attendance",
            "complaints",
            "leave",
            "visitors",
            "notices",
            "mess",
          ].includes(page) && (
            <label>
              Hostel
              <select
                value={form.hostel || hosts[0]?._id || ""}
                disabled={user.role !== "SUPER_ADMIN"}
                onChange={(e) => setForm({ ...form, hostel: e.target.value })}
              >
                {hosts.map((h) => (
                  <option value={h._id} key={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {page === "attendance" && (
            <label>
              Student
              <select
                required
                onChange={(e) => setForm({ ...form, student: e.target.value })}
              >
                <option value="">Choose student</option>
                {students.map((x) => (
                  <option value={x._id} key={x._id}>
                    {x.name} · {x.registrationNumber || x.email}
                  </option>
                ))}
              </select>
            </label>
          )}
          {page === "students" && (
            <label>
              Role{" "}
              <select disabled value="STUDENT">
                <option>STUDENT</option>
              </select>
            </label>
          )}
        </div>
        {error && (
          <div className="error-box">
            <AlertCircle size={15} />
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" disabled={busy}>
            {busy ? "Saving..." : "Save record"}
          </button>
        </div>
      </form>
    </div>
  );
}
function RoomChangeModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomId, setRoomId] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/rooms?available=true")
      .then((r) => setRooms(r.data.items || r.data))
      .catch(() => setError("Could not load available rooms"));
  }, []);
  async function submit(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/room-change", {
        title: "Room change request",
        desiredRoom: roomId,
        reason,
      });
      onSaved();
    } catch (e: any) {
      setError(e.response?.data?.message || "Could not submit the request");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <div className="form-overline">MY ROOM</div>
            <h2>Request a room change</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-fields">
          <label>
            Available room
            <select
              required
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              <option value="">Choose a room</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.block || "Block"} · Room {r.number} ·{" "}
                  {(r.capacity || 0) - (r.occupied || 0)} bed(s) available
                </option>
              ))}
            </select>
          </label>
          <label>
            Reason
            <textarea
              rows={3}
              required
              minLength={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tell your warden why you are requesting a change"
            />
          </label>
        </div>
        {error && (
          <div className="error-box">
            <AlertCircle size={15} />
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" disabled={busy || !rooms.length}>
            {busy ? "Submitting…" : "Submit request"}
          </button>
        </div>
      </form>
    </div>
  );
}
function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  async function load() {
    setBusy(true);
    try {
      const r = await api.get("/notifications");
      setItems(r.data);
    } catch {
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, []);
  async function mark(n: any) {
    if (!n.read) {
      await api.patch(`/notifications/${n._id}/read`);
      setItems((x) =>
        x.map((y) => (y._id === n._id ? { ...y, read: true } : y)),
      );
    }
  }
  async function markAll() {
    const unread = items.filter((x) => !x.read);
    await Promise.all(
      unread.map((n) => api.patch(`/notifications/${n._id}/read`)),
    );
    setItems((x) => x.map((n) => ({ ...n, read: true })));
  }
  const unread = items.filter((x) => !x.read).length;
  return (
    <div className="notification-anchor">
      <button
        className="icon-btn notification-trigger"
        title="Notifications"
        aria-label={`${unread} unread notifications`}
        onClick={() => setOpen(!open)}
      >
        <Bell size={18} />
        {unread > 0 && <i />}
      </button>
      {open && (
        <div className="notification-popover">
          <div className="notification-title">
            <div>
              <b>Notifications</b>
              <small>
                {unread
                  ? `${unread} unread update${unread === 1 ? "" : "s"}`
                  : "You are all caught up"}
              </small>
            </div>
            <div className="notification-actions">
              {unread > 0 && (
                <button className="text-btn" onClick={markAll}>
                  Mark all read
                </button>
              )}
              <button
                className="icon-btn"
                onClick={load}
                aria-label="Refresh notifications"
              >
                <Activity size={14} />
              </button>
            </div>
          </div>
          {busy ? (
            <div className="notification-empty">Loading your updates?</div>
          ) : items.length ? (
            items.map((n) => (
              <button
                className={`notification-row ${n.read ? "read" : ""}`}
                key={n._id}
                onClick={() => mark(n)}
              >
                <span className="notification-unread" />
                <div>
                  <b>{n.title}</b>
                  <small>{n.message}</small>
                  <time>{new Date(n.createdAt).toLocaleString()}</time>
                </div>
              </button>
            ))
          ) : (
            <div className="notification-empty">You?re all caught up.</div>
          )}
        </div>
      )}
    </div>
  );
}
function AllocationModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [students, setStudents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([api.get("/users?role=STUDENT"), api.get("/rooms")])
      .then(([a, b]) => {
        setStudents(a.data);
        setRooms(b.data.items || b.data);
      })
      .catch(() => setError("Could not load students and rooms"));
  }, []);
  const student = students.find((s) => s._id === studentId);
  const available = rooms
    .filter((r) => !student || String(r.hostel) === String(student.hostel))
    .filter((r) => (Number(r.occupied) || 0) < (Number(r.capacity) || 0));
  async function submit(e: any) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/allocations", {
        studentId,
        roomId,
        hostel: student?.hostel,
      });
      onSaved();
    } catch (e: any) {
      setError(e.response?.data?.message || "Could not allocate the room");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <div className="form-overline">ROOM MANAGEMENT</div>
            <h2>Allocate a room</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-fields">
          <label>
            Student
            <select
              required
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setRoomId("");
              }}
            >
              <option value="">Choose student</option>
              {students.map((x) => (
                <option value={x._id} key={x._id}>
                  {x.name} · {x.registrationNumber || x.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            Available room
            <select
              required
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              <option value="">Choose room</option>
              {available.map((x) => (
                <option value={x._id} key={x._id}>
                  {x.block || "Block"} · Room {x.number} ·{" "}
                  {x.capacity - (x.occupied || 0)} bed(s) free
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && (
          <div className="error-box">
            <AlertCircle size={15} />
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" disabled={busy || !available.length}>
            {busy ? "Allocating…" : "Allocate room"}
          </button>
        </div>
      </form>
    </div>
  );
}
function PaymentModal({
  fee,
  onClose,
  onDone,
}: {
  fee: any;
  onClose: () => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [qr, setQr] = useState("");
  useEffect(() => {
    QRCode.toDataURL(
      `HOSTELOS DEMONSTRATION ONLY | FEE ${fee._id} | AMOUNT INR ${Math.max((fee.amount || 0) - (fee.paid || 0), 0)}`,
      { width: 220, margin: 2, color: { dark: "#123e37", light: "#ffffff" } },
    )
      .then(setQr)
      .catch(() => setQr(""));
  }, [fee]);
  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await api.post(`/fees/${fee._id}/demo-payment`);
      onDone();
    } catch (e: any) {
      setError(
        e.response?.data?.message || "Could not submit the demo payment",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal demo-payment" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="form-overline">SIMULATION ONLY</div>
            <h2>Demo fee payment</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="demo-payment-summary">
          <span>{fee.title || "Hostel fee"}</span>
          <strong>
            ₹
            {Math.max((fee.amount || 0) - (fee.paid || 0), 0).toLocaleString(
              "en-IN",
            )}
          </strong>
          <small>
            No money will be transferred. This screen is for classroom
            demonstration only.
          </small>
        </div>
        <div className="demo-qr">
          {qr && <img src={qr} alt="Non-payment demonstration QR code" />}
        </div>
        <p className="demo-label">DEMO ONLY · NOT PAYABLE</p>
        {error && (
          <div className="error-box">
            <AlertCircle size={15} />
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-btn" disabled={busy} onClick={confirm}>
            {busy ? "Submitting…" : "Submit demo confirmation"}
          </button>
        </div>
      </div>
    </div>
  );
}
function FloatingAssistant({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ q: string; a: string }[]>([]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (open && !loaded) {
      api
        .get("/conversations?limit=20")
        .then((r) =>
          setItems(
            (r.data.items || [])
              .reverse()
              .map((x: any) => ({ q: x.question, a: x.answer })),
          ),
        )
        .catch(() => {})
        .finally(() => setLoaded(true));
    }
  }, [open, loaded]);
  async function send(e: any) {
    e.preventDefault();
    const q = value.trim();
    if (!q || busy) return;
    setValue("");
    setItems((x) => [...x, { q, a: "" }]);
    setBusy(true);
    try {
      const r = await api.post("/ai/chat", { message: q });
      setItems((x) =>
        x.map((m, i) => (i === x.length - 1 ? { ...m, a: r.data.answer } : m)),
      );
    } catch (err: any) {
      setItems((x) =>
        x.map((m, i) =>
          i === x.length - 1
            ? {
                ...m,
                a:
                  err.response?.data?.message ||
                  "I could not reach the assistant. Please try again.",
              }
            : m,
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  async function clear() {
    try {
      await api.delete("/conversations");
      setItems([]);
    } catch {
      setItems([]);
    }
  }
  const suggestions =
    user.role === "STUDENT"
      ? ["How much fee do I have pending?", "What is my room number?"]
      : user.role === "HOSTEL_WARDEN"
        ? [
            "Which complaints need attention?",
            "How many leave requests are pending?",
          ]
        : [
            "Which hostel has highest occupancy?",
            "How many payments are under review?",
          ];
  return (
    <>
      <button
        className="bot-fab"
        aria-label="Ask HostelOS AI"
        title="Ask HostelOS AI"
        onClick={() => setOpen(!open)}
      >
        <img src="/assets/hostelos-bot.png" alt="HostelOS assistant mascot" />
        <span className="bot-tooltip">Ask HostelOS AI</span>
      </button>
      {open && (
        <section className="floating-chat" aria-label="HostelOS AI assistant">
          <header className="floating-chat-head">
            <img src="/assets/hostelos-bot.png" alt="" />
            <div>
              <b>HostelOS AI</b>
              <small>
                <i /> Connected to role-authorized hostel data
              </small>
            </div>
            <button
              className="icon-btn clear-chat"
              title="Clear conversation"
              onClick={clear}
            >
              Clear
            </button>
            <button
              className="icon-btn"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
            >
              <X size={17} />
            </button>
          </header>
          <div className="floating-chat-body">
            {items.length === 0 && (
              <div className="floating-welcome">
                <h3>Hey! I'm your HostelOS assistant.</h3>
                <p>
                  I can help with hostel information, fees, complaints, room
                  allocation, attendance and more. What would you like to know?
                </p>
                <div className="floating-suggestions">
                  {suggestions.map((q) => (
                    <button key={q} onClick={() => setValue(q)}>
                      {q}
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {items.map((m, i) => (
              <div className="floating-message" key={i}>
                <div className="floating-user-msg">
                  <span className="floating-user-icon">
                    <UserRound size={15} />
                  </span>
                  {m.q}
                </div>
                <div className="floating-ai-msg">
                  <img src="/assets/hostelos-bot.png" alt="" />
                  {m.a || (
                    <span className="typing">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <form className="floating-chat-compose" onSubmit={send}>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask about your hostel…"
            />
            <button
              className="primary-btn"
              disabled={busy || !value.trim()}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
          <div className="floating-chat-disclaimer">
            Answers use records you’re authorized to see. The assistant cannot
            approve or change requests.
          </div>
        </section>
      )}
    </>
  );
}
function AnalyticsPage({
  data,
  setToast,
}: {
  data: any;
  setToast: (s: string) => void;
}) {
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  async function insight() {
    setBusy(true);
    try {
      const r = await api.post("/ai/insights");
      setSummary(r.data.summary);
    } catch (e: any) {
      setToast(e.response?.data?.message || "Could not generate AI insights");
    } finally {
      setBusy(false);
    }
  }
  const cats = data?.categories || [];
  const statuses = data?.statuses || [];
  const total = data?.total || 0;
  const resolved =
    statuses.find((x: any) => String(x._id).toLowerCase() === "resolved")
      ?.count || 0;
  const topCategory = cats[0];
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;
  const max = Math.max(1, ...cats.map((x: any) => x.count));
  return (
    <div className="analytics-grid">
      <section className="panel special-card">
        <div className="panel-title">
          <div>
            <h3>Complaint analytics</h3>
            <p>
              {total} complaints · {data?.highPriorityOpen || 0} high priority
              open
            </p>
          </div>
          <button
            className="primary-btn"
            disabled={busy || !total}
            onClick={insight}
          >
            {busy ? "Summarizing…" : "Generate AI summary"}
          </button>
        </div>
        {cats.length ? (
          <div className="analytics-bars">
            {cats.map((x: any) => (
              <div className="analytics-bar-row" key={x._id}>
                <span>{x._id}</span>
                <div>
                  <i
                    style={{ width: `${Math.max(5, (x.count / max) * 100)}%` }}
                  />
                </div>
                <b>{x.count}</b>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-placeholder">
            <Activity size={22} />
            <b>No complaint records yet</b>
            <span>
              Categories and priorities will appear when students submit
              complaints.
            </span>
          </div>
        )}
        <div className="analytics-snapshot">
          <div>
            <span>Total volume</span>
            <b>{total}</b>
            <small>complaints recorded</small>
          </div>
          <div>
            <span>Resolution rate</span>
            <b>{resolutionRate}%</b>
            <small>{resolved} resolved so far</small>
          </div>
          <div>
            <span>Top category</span>
            <b>{topCategory ? topCategory._id : "—"}</b>
            <small>
              {topCategory ? `${topCategory.count} reports` : "No data yet"}
            </small>
          </div>
        </div>
        <div className="analytics-focus">
          <div className="analytics-focus-icon">
            <AlertCircle size={16} />
          </div>
          <div>
            <b>Recommended focus</b>
            <span>
              {data?.highPriorityOpen
                ? `${data.highPriorityOpen} high-priority complaints need staff attention.`
                : total
                  ? "Keep monitoring open complaints and move pending items toward resolution."
                  : "Add complaint records to begin tracking operational trends."}
            </span>
          </div>
        </div>
      </section>
      <section className="panel special-card">
        <h3>Priority distribution</h3>
        <p className="muted">Open and resolved complaint priority counts.</p>
        <div className="priority-list">
          {(data?.priorities || []).map((x: any) => (
            <div key={x._id}>
              <span className={`priority ${String(x._id).toLowerCase()}`}>
                {x._id}
              </span>
              <b>{x.count}</b>
            </div>
          ))}
        </div>
        <h3 className="status-heading">Status distribution</h3>
        <div className="priority-list">
          {statuses.map((x: any) => (
            <div key={x._id}>
              <span
                className={`status ${String(x._id).toLowerCase().replace(" ", "-")}`}
              >
                {x._id}
              </span>
              <b>{x.count}</b>
            </div>
          ))}
        </div>
      </section>
      {summary && (
        <section className="panel insight-summary">
          <div className="ai-badge">
            <MessageCircle size={18} />
          </div>
          <div>
            <b>AI summary</b>
            <p>{summary}</p>
          </div>
        </section>
      )}
    </div>
  );
}
function ReportsPage({
  role,
  setToast,
}: {
  role: User["role"];
  setToast: (s: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All reports");
  const reports: Array<[string, string, string, string, typeof FileText]> = [
    [
      "students",
      "Student records",
      "People",
      "Directory of students and their current hostel details",
      Users,
    ],
    [
      "rooms",
      "Room occupancy",
      "Operations",
      "Occupancy, capacity and room allocation records",
      BedDouble,
    ],
    [
      "fees",
      "Fee balances",
      "Finance",
      "Outstanding and cleared student fee balances",
      Wallet,
    ],
    [
      "payments",
      "Demo payments",
      "Finance",
      "Payment records awaiting review or reconciliation",
      Check,
    ],
    [
      "complaints",
      "Complaints",
      "Student life",
      "Reported issues and their resolution status",
      AlertCircle,
    ],
    [
      "attendance",
      "Attendance",
      "Student life",
      "Attendance records across your authorized scope",
      CalendarDays,
    ],
    [
      "leave",
      "Leave requests",
      "Student life",
      "Leave applications and approval history",
      ClipboardList,
    ],
    [
      "visitors",
      "Visitor log",
      "Operations",
      "Registered visitors and visit activity",
      DoorOpen,
    ],
    [
      "notices",
      "Notices",
      "Communication",
      "Published hostel notices and announcements",
      FileText,
    ],
    [
      "mess",
      "Mess menus",
      "Operations",
      "Daily menus and meal information",
      Utensils,
    ],
  ];
  if (role === "SUPER_ADMIN")
    reports.push([
      "hostels",
      "Hostels",
      "Administration",
      "Hostel directory and workspace configuration",
      Building2,
    ]);
  async function download(kind: string) {
    try {
      const r = await api.get(`/reports/export?kind=${kind}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hostelos-${kind}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setToast(e.response?.data?.message || "Could not export this report");
    }
  }
  const categories = [
    "All reports",
    ...Array.from(new Set(reports.map((x) => x[2]))),
  ];
  const filtered = reports.filter(
    (x) =>
      (category === "All reports" || x[2] === category) &&
      `${x[1]} ${x[2]} ${x[3]}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="reports-page">
      <section className="reports-overview">
        <div className="reports-overview-copy">
          <div className="reports-overview-icon">
            <FileText size={22} />
          </div>
          <div>
            <span className="reports-kicker">EXPORT CENTER</span>
            <h2>Everything in one place</h2>
            <p>
              Download the latest authorized records for reporting, review, or
              offline analysis.
            </p>
          </div>
        </div>
        <div className="reports-overview-stats">
          <div>
            <strong>{reports.length}</strong>
            <span>Available reports</span>
          </div>
          <div>
            <strong>CSV</strong>
            <span>Export format</span>
          </div>
        </div>
      </section>
      <div className="reports-toolbar">
        <div className="reports-toolbar-title">
          <h3>Report library</h3>
          <span>
            {filtered.length} of {reports.length} reports
          </span>
        </div>
        <div className="reports-controls">
          <label className="reports-search">
            <Search size={16} />
            <input
              aria-label="Search reports"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reports"
            />
          </label>
          <select
            aria-label="Filter reports"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </div>
      {filtered.length ? (
        <div className="report-grid">
          {filtered.map(([key, label, group, description, Icon]) => (
            <section className="panel report-card" key={key}>
              <div className="report-card-top">
                <div className="report-icon">
                  <Icon size={18} />
                </div>
                <span className="report-category">{group}</span>
              </div>
              <div className="report-card-copy">
                <b>{label}</b>
                <small>{description}</small>
              </div>
              <div className="report-card-footer">
                <span>
                  <span className="report-status-dot" />
                  Current records
                </span>
                <button className="secondary-btn" onClick={() => download(key)}>
                  <ArrowRight size={14} />
                  Download CSV
                </button>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="reports-empty">
          <Search size={22} />
          <b>No reports found</b>
          <span>Try a different search or category.</span>
        </div>
      )}
    </div>
  );
}
function SpecialPage({
  page,
  role,
  data,
  setToast,
}: {
  page: string;
  role: User["role"];
  data: any;
  setToast: (s: string) => void;
}) {
  return (
    <div className="special-grid">
      {page === "settings" ? (
        <>
          <div className="panel special-card">
            <div className="panel-title">
              <div>
                <h3>Account preferences</h3>
                <p>Personal settings for your account.</p>
              </div>
            </div>
            <div className="setting-row">
              <div>
                <b>Theme appearance</b>
                <small>Choose light or dark mode from the sidebar.</small>
              </div>
              <span className="status resolved">Enabled</span>
            </div>
            <div className="setting-row">
              <div>
                <b>Account security</b>
                <small>Your session expires after 12 hours.</small>
              </div>
              <span className="status">JWT session</span>
            </div>
          </div>
          <div className="panel special-card">
            <h3>System configuration</h3>
            <p className="muted">
              AI and database credentials are configured on the backend and are
              never sent to the browser.
            </p>
            <div className="system-note">
              <span className="status-dot" />
              <div>
                <b>API connected</b>
                <small>Configuration status available to administrators</small>
              </div>
            </div>
          </div>
        </>
      ) : page === "analytics" ? (
        <AnalyticsPage data={data} setToast={setToast} />
      ) : page === "reports" ? (
        <ReportsPage role={role} setToast={setToast} />
      ) : (
        <div className="panel special-card">
          <h3>Roles & permissions</h3>
          <p className="muted">
            Exactly three roles have access to this portal.
          </p>
          <div className="role-cards">
            {[
              ["SUPER ADMIN", "Global hostel administration"],
              ["HOSTEL WARDEN", "Assigned hostel operations"],
              ["STUDENT", "Own authorized records"],
            ].map(([a, b]) => (
              <div key={a}>
                <Shield size={17} />
                <b>{a}</b>
                <small>{b}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
