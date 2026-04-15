import { 
  Bell, 
  Search, 
  Menu, 
  Globe,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ isSidebarOpen, setSidebarOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-500"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <Menu size={20} />
        </Button>
        <div className="hidden md:flex relative w-80 lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="Search students, tasks, or documents..." 
            className="pl-10 bg-slate-50 border-none focus-visible:ring-primary/20 h-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
          <Globe size={14} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">English (US)</span>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="relative rounded-full border-slate-200 h-9 w-9">
                <Bell size={18} className="text-slate-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <div className="flex items-center gap-2">
           <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none px-3 py-1 text-[10px] md:text-xs font-bold">
             SEPTEMBER 2024
           </Badge>
        </div>
      </div>
    </header>
  );
}