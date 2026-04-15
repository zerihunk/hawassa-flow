import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users as UsersIcon, 
  Settings as SettingsIcon, 
  UserCircle, 
  LogOut,
  GraduationCap,
  History,
  ArrowLeft,
  Calendar,
  Send,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Building2,
  Lock,
  Unlock,
  Building,
  User as UserIcon,
  CircleDot
} from 'lucide-react';

// --- TYPES ---
interface User {
  name: string;
  login: string;
  pass: string;
  email: string;
  roles: string[];
  office: string;
  status: string;
}

interface RequestItem {
  id: number;
  name: string;
  dept: string;
  gradDate: string;
  prog: string;
  level: string;
  service: string;
  stage: string;
  room: string;
  history: string;
  niroNumber: string;
}

interface OfficeRoom {
  role: string;
  name: string;
}

interface Config {
  services: string[];
  roles: string[];
  rooms: OfficeRoom[];
}

// --- CONSTANTS ---
const DB_URL = "https://registrar-system-d2956-default-rtdb.firebaseio.com/";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [config, setConfig] = useState<Config>({ services: [], roles: [], rooms: [] });
  const [loading, setLoading] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  
  // State for pending moves - holds both role and room
  const [pendingMoves, setPendingMoves] = useState<Record<number, { role: string; room: string }>>({});

  // Form States
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [recoveryEmail, setRecoveryEmail] = useState('');
  
  // Registration Form
  const [regForm, setRegForm] = useState({
    name: '',
    dept: '',
    gradDate: '',
    prog: 'Regular',
    level: 'Degree',
    service: ''
  });

  // User Management Form
  const [nuForm, setNuForm] = useState({
    name: '',
    login: '',
    email: '',
    pass: '',
    office: '',
    roles: [] as string[]
  });

  // Password Change
  const [passForm, setPassForm] = useState({ curr: '', next: '' });

  // Settings inputs
  const [newServiceName, setNewServiceName] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomRole, setNewRoomRole] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${DB_URL}/.json`);
      const data = await response.json();
      
      if (!data || !data.users) {
        const init = {
          users: [{ name: "Admin Manager", login: "admin", pass: "Reg@123", email: "admin@hu.edu.et", roles: ["Admin"], office: "Reg-01", status: "Active" }],
          requests: [],
          config: {
            services: ["Original Degree", "Official Transcript", "Student Copy"],
            roles: ["Front Desk", "Archive", "Finance", "Dept Chair", "Admin"],
            rooms: [
              { role: "Front Desk", name: "Counter A" },
              { role: "Front Desk", name: "Counter B" },
              { role: "Archive", name: "Archive Room 1" },
              { role: "Finance", name: "Cashier Office" }
            ]
          }
        };
        await fetch(`${DB_URL}/.json`, { method: 'PUT', body: JSON.stringify(init) });
        setUsers(init.users);
        setRequests(init.requests || []);
        setConfig(init.config);
      } else {
        setUsers(Object.values(data.users || {}));
        const reqArray = Object.values(data.requests || {}) as RequestItem[];
        setRequests(reqArray);
        
        let configData = data.config || { services: [], roles: [], rooms: [] };
        if (configData.rooms && configData.rooms.length > 0 && typeof configData.rooms[0] === 'string') {
          configData.rooms = configData.rooms.map((r: string, idx: number) => ({
            role: configData.roles[idx] || 'Processing',
            name: r
          }));
        }
        setConfig(configData);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Database connection failed. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveData = async (newData: any) => {
    try {
      await fetch(`${DB_URL}/.json`, { method: 'PUT', body: JSON.stringify(newData) });
      await fetchData();
    } catch (error) {
      toast.error("Failed to save data. Please try again.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.login === loginForm.user && u.pass === loginForm.pass);
    if (user) {
      if (user.status === 'Suspended') return toast.error("Account suspended. Please contact the administrator.");
      setCurrentUser(user);
      toast.success(`Welcome back, ${user.name}!`);
    } else {
      toast.error("Invalid username or password.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveSection('dashboard');
    toast.info("Logged out successfully.");
  };

  const recoverAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.email.toLowerCase() === recoveryEmail.toLowerCase());
    if (found) {
      toast.success("Account recovery instructions sent to " + found.email);
      setIsForgotMode(false);
    } else {
      toast.error("This email is not registered in our system.");
    }
  };

  const registerCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: RequestItem = {
      ...regForm,
      id: Date.now(),
      stage: config.roles[0] || "New",
      room: "Initial Setup",
      history: `[${new Date().toLocaleString()}] Registered by ${currentUser?.name}`,
      niroNumber: 'N/A'
    };
    const updatedRequests = [...requests, newReq];
    await saveData({ users, requests: updatedRequests, config });
    setRegForm({ name: '', dept: '', gradDate: '', prog: 'Regular', level: 'Degree', service: config.services[0] || '' });
    toast.success("Customer registered successfully!");
    setActiveSection('dashboard');
  };

  const updateRequestStage = async (id: number, nextRole: string, nextRoom: string) => {
    const updatedRequests = requests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          stage: nextRole,
          room: nextRoom,
          history: (typeof r.history === 'string' ? r.history : '') + ` | [${new Date().toLocaleString()}] Moved to ${nextRole} (${nextRoom}) by ${currentUser?.name}`
        };
      }
      return r;
    });
    await saveData({ users, requests: updatedRequests, config });
    toast.success("Workflow stage updated successfully.");
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.login === nuForm.login)) return toast.error("Username already exists.");
    const newUser: User = { ...nuForm, status: 'Active' };
    const updatedUsers = [...users, newUser];
    await saveData({ users: updatedUsers, requests, config });
    setNuForm({ name: '', login: '', email: '', pass: '', office: '', roles: [] });
    toast.success("Staff member added successfully!");
  };

  const toggleUserStatus = async (login: string) => {
    const updatedUsers = users.map(u => {
      if (u.login === login) {
        return { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return u;
    });
    await saveData({ users: updatedUsers, requests, config });
  };

  const addConfigItem = async (type: 'service' | 'role' | 'room', value: any) => {
    if (!value) return;
    const newConfig = { ...config };
    if (type === 'service') newConfig.services.push(value);
    if (type === 'role') newConfig.roles.push(value);
    if (type === 'room') newConfig.rooms.push(value);
    await saveData({ users, requests, config: newConfig });
    if (type === 'service') setNewServiceName('');
    if (type === 'role') setNewRoleName('');
    if (type === 'room') {
      setNewRoomName('');
      setNewRoomRole('');
    }
    toast.success("Setting added successfully.");
  };

  const removeConfigItem = async (type: 'service' | 'role' | 'room', index: number) => {
    const newConfig = { ...config };
    if (type === 'service') newConfig.services.splice(index, 1);
    if (type === 'role') newConfig.roles.splice(index, 1);
    if (type === 'room') newConfig.rooms.splice(index, 1);
    await saveData({ users, requests, config: newConfig });
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.pass !== passForm.curr) return toast.error("Current password is incorrect.");
    const updatedUsers = users.map(u => {
      if (u.login === currentUser?.login) return { ...u, pass: passForm.next };
      return u;
    });
    await saveData({ users: updatedUsers, requests, config });
    setCurrentUser({ ...currentUser, pass: passForm.next });
    setPassForm({ curr: '', next: '' });
    toast.success("Password updated successfully!");
  };

  const viewHistory = (id: number) => {
    setSelectedRequestId(id);
    setActiveSection('history-view');
  };

  const isAdmin = currentUser?.roles.includes('Admin');
  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  // Group rooms by role for the dropdown
  const groupedOffices = useMemo(() => {
    const groups: Record<string, OfficeRoom[]> = {};
    config.rooms.forEach(room => {
      if (!groups[room.role]) groups[room.role] = [];
      groups[room.role].push(room);
    });
    return groups;
  }, [config.rooms]);

  // Helper to get all targets for a role (static rooms + users)
  const getTargetsForRole = (role: string) => {
    const staticRooms = config.rooms.filter(r => r.role === role).map(r => ({ type: 'room', name: r.name }));
    const staffMembers = users.filter(u => u.roles.includes(role) && u.status === 'Active').map(u => ({ 
      type: 'staff', 
      name: `${u.name}${u.office ? ` (${u.office})` : ''}` 
    }));
    return [...staticRooms, ...staffMembers];
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] text-[#333] font-sans selection:bg-[#054ada]/20">
      <Toaster richColors position="top-right" />
      
      <style>{`
        :root { 
          --primary: #002b5c; 
          --secondary: #054ada; 
          --admin: #6f42c1; 
          --danger: #dc3545; 
          --success: #28a745; 
          --bg: #f4f7f9; 
        }
        .btn-main { 
          width: 100%; padding: 10px; background: var(--secondary); color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; 
          transition: 0.2s;
        }
        .btn-main:hover { opacity: 0.9; }
        .btn-main:disabled { background: #ccc; cursor: not-allowed; opacity: 0.7; }
        .settings-card { border: 1px solid #eee; padding: 15px; border-radius: 8px; background: #fafafa; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; background: white; border-radius: 8px; overflow: hidden; }
        th, td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; }
        th { background: #f8f9fa; color: var(--primary); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
        input, select, textarea { width: 100%; padding: 10px; margin: 5px 0 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-size: 14px; }
        input:focus, select:focus { outline: none; border-color: var(--secondary); box-shadow: 0 0 0 2px rgba(5, 74, 218, 0.1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {!currentUser ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-[400px] w-full bg-white p-10 rounded-2xl shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
            {!isForgotMode ? (
              <>
                <div className="flex justify-center">
                  <div className="p-4 bg-[#002b5c]/10 rounded-full text-[#002b5c]">
                    <GraduationCap size={48} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#002b5c]">Registrar Portal</h2>
                <p className="text-[11px] font-medium text-orange-500">
                  {loading ? "Connecting to Database..." : "Connected (Online)"}
                </p>
                <form onSubmit={handleLogin} className="text-left space-y-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Username" 
                      required 
                      value={loginForm.user}
                      onChange={(e) => setLoginForm({...loginForm, user: e.target.value})}
                    />
                  </div>
                  <div>
                    <input 
                      type="password" 
                      placeholder="Password" 
                      required 
                      value={loginForm.pass}
                      onChange={(e) => setLoginForm({...loginForm, pass: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="btn-main">Login</button>
                </form>
                <button 
                  onClick={() => setIsForgotMode(true)}
                  className="text-xs text-[#054ada] hover:underline"
                >
                  Forgot Account/Password?
                </button>
              </>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-[#333]">Account Recovery</h3>
                <p className="text-xs text-gray-500">Enter your registered email address to receive recovery instructions.</p>
                <form onSubmit={recoverAccount} className="text-left">
                  <input 
                    type="email" 
                    placeholder="Enter Registered Email" 
                    required 
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                  />
                  <button type="submit" className="btn-main">Send Recovery Email</button>
                </form>
                <button 
                  onClick={() => setIsForgotMode(false)}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          {/* Navigation */}
          <nav className="bg-[#002b5c] text-white p-3 flex justify-between items-center sticky top-0 z-[100] shadow-md">
            <div className="flex items-center gap-2 font-bold">
              <GraduationCap size={24} className="text-[#054ada]" />
              <span className="hidden sm:inline">🎓 Registrar Portal</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveSection('dashboard')}
                className={`px-3 py-1.5 rounded text-sm transition-all whitespace-nowrap border ${activeSection === 'dashboard' ? 'bg-white text-[#002b5c]' : 'bg-transparent border-white/20 hover:bg-white/10'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveSection('registration')}
                className={`px-3 py-1.5 rounded text-sm transition-all whitespace-nowrap border ${activeSection === 'registration' ? 'bg-white text-[#002b5c]' : 'bg-transparent border-white/20 hover:bg-white/10'}`}
              >
                New Registration
              </button>
              {isAdmin && (
                <>
                  <button 
                    onClick={() => setActiveSection('users')}
                    className={`px-3 py-1.5 rounded text-sm transition-all whitespace-nowrap border ${activeSection === 'users' ? 'bg-white text-[#002b5c]' : 'bg-transparent border-white/20 hover:bg-white/10'}`}
                  >
                    Users (Admin)
                  </button>
                  <button 
                    onClick={() => setActiveSection('settings')}
                    className={`px-3 py-1.5 rounded text-sm transition-all whitespace-nowrap border border-yellow-400 ${activeSection === 'settings' ? 'bg-white text-[#002b5c]' : 'bg-transparent hover:bg-white/10 text-yellow-400'}`}
                  >
                    Settings
                  </button>
                </>
              )}
              <button 
                onClick={() => setActiveSection('profile')}
                className={`px-3 py-1.5 rounded text-sm transition-all whitespace-nowrap border ${activeSection === 'profile' ? 'bg-white text-[#002b5c]' : 'bg-transparent border-white/20 hover:bg-white/10'}`}
              >
                Profile
              </button>
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 rounded text-sm bg-[#dc3545] hover:bg-red-600 border border-transparent transition-all whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </nav>

          <div className="max-w-[1400px] w-full mx-auto p-4 sm:p-6 space-y-6">
            {/* User Info Header */}
            <div className="p-4 bg-white rounded-xl shadow-sm border-l-[5px] border-[#054ada] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#002b5c] text-white rounded-full flex items-center justify-center font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-[#002b5c]">{currentUser.name}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{currentUser.roles.join(' | ')}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-x-4">
                <span>Office: <strong className="text-[#333]">{currentUser.office}</strong></span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Status: <strong className="text-[#28a745]">Active</strong>
                </span>
              </div>
            </div>

            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-[#002b5c]">
                    <LayoutDashboard size={20} />
                    <h3 className="text-xl font-bold">Active Workflow Requests</h3>
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    Showing {requests.length} total entries
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Student Name & Info</th>
                        <th>Graduation Date</th>
                        <th>Stage</th>
                        <th>Room</th>
                        <th className="min-w-[400px]">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-16 text-gray-400 italic">
                            No active requests found in the system.
                          </td>
                        </tr>
                      ) : (
                        requests.map(req => {
                          const isAtMyStage = currentUser.roles.includes(req.stage);
                          const canSend = isAdmin || isAtMyStage;
                          const currentPending = pendingMoves[req.id] || { role: '', room: '' };

                          return (
                            <tr key={req.id} className={`hover:bg-gray-50/50 transition-colors ${!canSend ? 'opacity-75 grayscale-[0.2]' : ''}`}>
                              <td className="font-mono text-[10px] text-gray-400">#{req.id.toString().slice(-6)}</td>
                              <td>
                                <button 
                                  onClick={() => viewHistory(req.id)}
                                  className="font-bold text-[#054ada] hover:underline text-left block flex items-center gap-1 group"
                                >
                                  {req.name}
                                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                                <div className="text-xs text-gray-500">{req.dept} | {req.prog} {req.level}</div>
                                <div className="text-[9px] text-gray-400 mt-1 uppercase font-semibold">{req.service}</div>
                              </td>
                              <td>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <Calendar size={12} className="text-gray-400" />
                                  {req.gradDate}
                                </div>
                              </td>
                              <td>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase border border-blue-100">
                                  {req.stage}
                                </span>
                              </td>
                              <td>
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold uppercase border border-amber-100">
                                  {req.room}
                                </span>
                              </td>
                              <td>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 py-2">
                                  <div className="flex-1 grid grid-cols-2 gap-2 relative group">
                                    {/* Role Selection */}
                                    <select 
                                      className={`text-[11px] p-2 border-gray-300 rounded h-10 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer ${!canSend ? 'bg-gray-50 cursor-not-allowed border-gray-200 text-gray-400' : ''}`}
                                      value={currentPending.role}
                                      onChange={(e) => setPendingMoves({...pendingMoves, [req.id]: { role: e.target.value, room: '' }})}
                                      disabled={!canSend}
                                    >
                                      <option value="" disabled>Target Role...</option>
                                      {config.roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                      ))}
                                      <option value="Completed">✅ Completed</option>
                                    </select>

                                    {/* Room/Staff Selection */}
                                    <select 
                                      className={`text-[11px] p-2 border-gray-300 rounded h-10 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer ${!canSend || !currentPending.role ? 'bg-gray-50 cursor-not-allowed border-gray-200 text-gray-400' : ''}`}
                                      value={currentPending.room}
                                      onChange={(e) => setPendingMoves({...pendingMoves, [req.id]: { ...currentPending, room: e.target.value }})}
                                      disabled={!canSend || !currentPending.role}
                                    >
                                      <option value="" disabled>Target Office...</option>
                                      {currentPending.role === 'Completed' ? (
                                        <option value="Archive">Archive</option>
                                      ) : (
                                        getTargetsForRole(currentPending.role).map((t, idx) => (
                                          <option key={idx} value={t.name}>
                                            {t.type === 'staff' ? '👤 ' : '🏢 '}{t.name}
                                          </option>
                                        ))
                                      )}
                                    </select>

                                    {!canSend && !isAdmin && (
                                      <div className="absolute -top-10 left-0 bg-slate-800 text-white text-[9px] px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-xl flex items-center gap-1.5">
                                        <Lock size={10} className="text-amber-400" />
                                        Locked: Waiting for request to return to your stage
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button 
                                      onClick={() => {
                                        const { role, room } = currentPending;
                                        if (!role || !room) return toast.error("Please select both role and target office");
                                        updateRequestStage(req.id, role, room);
                                        const newMoves = {...pendingMoves};
                                        delete newMoves[req.id];
                                        setPendingMoves(newMoves);
                                      }}
                                      disabled={!canSend || !currentPending.role || !currentPending.room}
                                      className={`px-3 h-10 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${canSend ? 'bg-[#054ada] hover:bg-[#002b5c]' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}
                                      title={!canSend ? "You cannot send this request yet" : "Send to target office"}
                                    >
                                      {canSend ? <Send size={14} /> : <Lock size={14} />}
                                      {canSend ? 'Send' : 'Locked'}
                                    </button>
                                    <button 
                                      onClick={() => viewHistory(req.id)}
                                      className="p-2 h-10 w-10 flex items-center justify-center text-gray-500 hover:text-[#054ada] transition-colors border border-gray-200 rounded-lg hover:border-[#054ada]/30 hover:bg-blue-50 shadow-sm"
                                      title="View History"
                                    >
                                      <History size={18} />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* History View Section */}
            {activeSection === 'history-view' && selectedRequest && (
              <div className="animate-in fade-in duration-300">
                <button 
                  onClick={() => setActiveSection('dashboard')}
                  className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#054ada] mb-6 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Student Details Card */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex flex-col items-center text-center pb-6 border-b border-gray-50 mb-6">
                        <div className="w-20 h-20 bg-[#002b5c]/5 text-[#002b5c] rounded-full flex items-center justify-center font-bold text-3xl mb-4">
                          {selectedRequest.name.charAt(0)}
                        </div>
                        <h3 className="text-xl font-bold text-[#002b5c]">{selectedRequest.name}</h3>
                        <p className="text-sm text-gray-500">{selectedRequest.dept}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Graduation Date</span>
                          <span className="text-sm font-medium">{selectedRequest.gradDate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Program</span>
                          <span className="text-sm font-medium">{selectedRequest.prog} ({selectedRequest.level})</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Service Type</span>
                          <span className="text-sm font-bold text-[#054ada]">{selectedRequest.service}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Stage</span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase">{selectedRequest.stage}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Room</span>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold uppercase">{selectedRequest.room}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Timeline Card */}
                  <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                      <div className="flex items-center gap-2 mb-8 text-[#002b5c]">
                        <History size={20} />
                        <h3 className="text-xl font-bold">Detailed Workflow History</h3>
                      </div>

                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                        <div className="space-y-8">
                          {(typeof selectedRequest.history === 'string' ? selectedRequest.history : '').split('|').reverse().map((h, i) => {
                            const [time, action] = h.includes(']') ? [h.split(']')[0] + ']', h.split(']')[1]] : ['', h];
                            return (
                              <div key={i} className="relative pl-10">
                                <div className="absolute left-[11px] top-1.5 w-[10px] h-[10px] rounded-full bg-white border-2 border-[#054ada] z-10"></div>
                                <div className="bg-[#f8f9fa] p-4 rounded-xl border border-gray-50 hover:border-blue-100 transition-colors">
                                  <div className="text-[10px] font-bold text-[#054ada] uppercase mb-1">{time.replace('[', '').replace(']', '')}</div>
                                  <div className="text-sm text-gray-700 leading-relaxed font-medium">{action.trim()}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {(!selectedRequest.history || selectedRequest.history.length < 5) && (
                         <div className="flex flex-col items-center justify-center h-48 text-gray-400 italic">
                           <p>No detailed history records found.</p>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Section */}
            {activeSection === 'registration' && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-8 border-b pb-4 text-[#002b5c]">
                  <UserPlus size={24} />
                  <h3 className="text-2xl font-bold">New Customer Registration</h3>
                </div>
                <form onSubmit={registerCustomer} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter Student Full Name" 
                        required 
                        value={regForm.name}
                        onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Department</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Computer Science" 
                        required 
                        value={regForm.dept}
                        onChange={(e) => setRegForm({...regForm, dept: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Graduation Date</label>
                      <input 
                        type="date" 
                        required 
                        value={regForm.gradDate}
                        onChange={(e) => setRegForm({...regForm, gradDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Program</label>
                      <select 
                        value={regForm.prog}
                        onChange={(e) => setRegForm({...regForm, prog: e.target.value})}
                      >
                        <option value="Regular">Regular</option>
                        <option value="Extension">Extension</option>
                        <option value="Weekend">Weekend</option>
                        <option value="Summer">Summer</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Degree Level</label>
                      <select 
                        value={regForm.level}
                        onChange={(e) => setRegForm({...regForm, level: e.target.value})}
                      >
                        <option value="Degree">Degree</option>
                        <option value="Masters">Masters</option>
                        <option value="Diploma">Diploma</option>
                        <option value="PhD">PhD</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Service Type</label>
                      <select 
                        value={regForm.service}
                        onChange={(e) => setRegForm({...regForm, service: e.target.value})}
                        required
                      >
                        <option value="">Select Service...</option>
                        {config.services.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-main text-lg py-4 mt-4 bg-[#054ada] hover:bg-[#002b5c] shadow-lg shadow-blue-500/20">
                    Register Customer & Start Workflow
                  </button>
                </form>
              </div>
            )}

            {/* User Management Section */}
            {activeSection === 'users' && isAdmin && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-6 text-[#6f42c1]">
                    <UsersIcon size={24} />
                    <h3 className="text-2xl font-bold">Staff Management</h3>
                  </div>
                  
                  <div className="settings-card border-[#6f42c1]/20 bg-[#6f42c1]/5">
                    <h4 className="font-bold text-[#6f42c1] mb-4">Register New Staff Member</h4>
                    <form onSubmit={addUser} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Full Name" required value={nuForm.name} onChange={(e) => setNuForm({...nuForm, name: e.target.value})} />
                        <input type="text" placeholder="Username" required value={nuForm.login} onChange={(e) => setNuForm({...nuForm, login: e.target.value})} />
                        <input type="email" placeholder="Email Address" required value={nuForm.email} onChange={(e) => setNuForm({...nuForm, email: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="password" placeholder="Initial Password" required value={nuForm.pass} onChange={(e) => setNuForm({...nuForm, pass: e.target.value})} />
                        <input type="text" placeholder="Office Number" value={nuForm.office} onChange={(e) => setNuForm({...nuForm, office: e.target.value})} />
                        <div>
                          <small className="font-bold text-gray-500 block mb-1">Assign Workflow Roles:</small>
                          <div className="flex flex-wrap gap-1.5 p-2 bg-white border border-gray-200 rounded min-h-[42px]">
                            {config.roles.concat("Admin").map(role => (
                              <label key={role} className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer hover:bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 transition-colors">
                                <input 
                                  type="checkbox" 
                                  checked={nuForm.roles.includes(role)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setNuForm(prev => ({
                                      ...prev,
                                      roles: checked ? [...prev.roles, role] : prev.roles.filter(r => r !== role)
                                    }));
                                  }}
                                  className="w-3 h-3 text-[#6f42c1] rounded"
                                />
                                {role}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button type="submit" className="btn-main bg-[#6f42c1] hover:bg-[#5a32a3]">Save Staff Member</button>
                    </form>
                  </div>

                  <div className="overflow-x-auto mt-8">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Office</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.login} className="hover:bg-gray-50/50 transition-colors">
                            <td className="font-bold text-[#002b5c]">{user.name}</td>
                            <td className="text-gray-500">@{user.login}</td>
                            <td>{user.email}</td>
                            <td>{user.office}</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td>
                              <button 
                                onClick={() => toggleUserStatus(user.login)}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded-md border transition-all ${user.status === 'Active' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                              >
                                {user.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && isAdmin && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-8 text-yellow-600">
                  <SettingsIcon size={24} />
                  <h3 className="text-2xl font-bold">System Configurations</h3>
                </div>
                <div className="flex flex-col gap-8">
                  <div className="settings-card border-blue-100 bg-blue-50/30">
                    <h4 className="font-bold text-[#002b5c] mb-4 text-lg border-b border-blue-100 pb-2">1. Service Types</h4>
                    <div className="flex gap-2 max-w-md">
                      <input type="text" placeholder="Add service... (e.g. Degree, Transcript)" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} className="m-0 bg-white" />
                      <button onClick={() => addConfigItem('service', newServiceName)} className="bg-[#002b5c] text-white px-4 rounded-md text-2xl hover:bg-[#054ada] transition-colors shadow-sm">+</button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {config.services.map((s, i) => (
                        <div key={i} className="flex justify-between items-center text-xs p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all">
                          <span className="font-bold text-gray-700">{s}</span>
                          <button onClick={() => removeConfigItem('service', i)} className="text-red-400 hover:text-red-600 text-2xl leading-none px-2">&times;</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="settings-card border-purple-100 bg-purple-50/30">
                    <h4 className="font-bold text-[#002b5c] mb-4 text-lg border-b border-purple-100 pb-2">2. Workflow Roles</h4>
                    <div className="flex gap-2 max-w-md">
                      <input type="text" placeholder="Add role... (e.g. Front Desk, Finance)" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="m-0 bg-white" />
                      <button onClick={() => addConfigItem('role', newRoleName)} className="bg-[#002b5c] text-white px-4 rounded-md text-2xl hover:bg-[#054ada] transition-colors shadow-sm">+</button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {config.roles.map((s, i) => (
                        <div key={i} className="flex justify-between items-center text-xs p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all">
                          <span className="font-bold text-gray-700">{s}</span>
                          <button onClick={() => removeConfigItem('role', i)} className="text-red-400 hover:text-red-600 text-2xl leading-none px-2">&times;</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="settings-card border-amber-100 bg-amber-50/30">
                    <h4 className="font-bold text-[#002b5c] mb-4 text-lg border-b border-amber-100 pb-2">3. Office Rooms</h4>
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select 
                          value={newRoomRole} 
                          onChange={(e) => setNewRoomRole(e.target.value)}
                          className="m-0 bg-white flex-1"
                        >
                          <option value="">Select Department...</option>
                          {config.roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <input 
                          type="text" 
                          placeholder="Add room number/name..." 
                          value={newRoomName} 
                          onChange={(e) => setNewRoomName(e.target.value)} 
                          className="m-0 bg-white flex-1" 
                        />
                        <button 
                          onClick={() => addConfigItem('room', { role: newRoomRole, name: newRoomName })}
                          className="bg-[#002b5c] text-white px-6 rounded-md font-bold hover:bg-[#054ada] transition-colors shadow-sm h-10"
                        >
                          Add Room
                        </button>
                      </div>
                      
                      <div className="mt-4">
                        {Object.entries(groupedOffices).map(([role, rooms]) => (
                          <div key={role} className="mb-4">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{role}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {rooms.map((room, i) => {
                                const originalIndex = config.rooms.findIndex(r => r.name === room.name && r.role === room.role);
                                return (
                                  <div key={i} className="flex justify-between items-center text-xs p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all">
                                    <span className="font-bold text-gray-700">{room.name}</span>
                                    <button onClick={() => removeConfigItem('room', originalIndex)} className="text-red-400 hover:text-red-600 text-2xl leading-none px-2">&times;</button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 mb-6 text-[#054ada]">
                  <UserCircle size={24} />
                  <h3 className="text-xl font-bold">Security & Profile Settings</h3>
                </div>
                <form onSubmit={changePassword} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                    <input type="text" disabled value={currentUser.name} className="bg-gray-50 border-gray-100 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                    <input type="text" disabled value={currentUser.email} className="bg-gray-50 border-gray-100 cursor-not-allowed" />
                  </div>
                  <hr className="border-gray-50 my-2" />
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Password</label>
                    <input type="password" required placeholder="••••••••" value={passForm.curr} onChange={(e) => setPassForm({...passForm, curr: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                    <input type="password" required placeholder="••••••••" value={passForm.next} onChange={(e) => setPassForm({...passForm, next: e.target.value})} />
                  </div>
                  <button type="submit" className="btn-main shadow-lg shadow-blue-500/10 mt-2">Update Password</button>
                </form>
              </div>
            )}
          </div>
          
          <footer className="mt-auto py-8 text-center text-[10px] text-gray-400 uppercase tracking-widest border-t border-gray-100">
            &copy; {new Date().getFullYear()} Hawassa University Registrar Management System
          </footer>
        </div>
      )}
    </div>
  );
}