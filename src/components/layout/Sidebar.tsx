import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SidebarItem = ({ icon: Icon, label, active = false, onClick, isOpen }: { 
  icon: any, 
  label: string, 
  active?: boolean, 
  onClick: () => void, 
  isOpen: boolean 
}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`}
  >
    <Icon size={20} className={active ? 'text-primary-foreground' : 'group-hover:scale-110 transition-transform'} />
    {isOpen && <span className="font-medium whitespace-nowrap">{label}</span>}
    {active && isOpen && (
      <motion.div 
        layoutId="active-indicator"
        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground"
      />
    )}
  </button>
);

export function Sidebar({ isOpen, activeTab, setActiveTab }: SidebarProps) {
  const universityLogo = 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/531090b8-c916-40ea-9f96-437f0848e4fa/university-logo-8008a8f9-1776276937706.webp';

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-72' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-primary/5">
            <img src={universityLogo} alt="HU Logo" className="w-full h-full object-cover" />
          </div>
          {isOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-bold text-slate-900 leading-tight text-sm">Hawassa University</h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Registrar Office</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            isOpen={isOpen}
          />
          <SidebarItem 
            icon={FileText} 
            label="Workflows" 
            active={activeTab === 'tasks'} 
            onClick={() => setActiveTab('tasks')}
            isOpen={isOpen}
          />
          <SidebarItem 
            icon={Users} 
            label="Student Registry" 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')}
            isOpen={isOpen}
          />
          <SidebarItem 
            icon={History} 
            label="Activity History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
            isOpen={isOpen}
          />
          <Separator className="my-4 opacity-50" />
          <SidebarItem 
            icon={Settings} 
            label="System Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            isOpen={isOpen}
          />
        </nav>

        <div className="mt-auto">
          <div className={`p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 ${
            !isOpen ? 'justify-center' : ''
          }`}>
            <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            {isOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">Daniel Kebede</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Administrator</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}