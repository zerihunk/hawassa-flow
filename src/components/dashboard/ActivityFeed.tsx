import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { History, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

// This component is updated to reflect a more system-wide activity log style in English
const recentActivities = [
  { id: 1, user: 'Alemu Bekele', action: 'Registered new student (Niro: HU/8821/16)', time: '5 mins ago', status: 'Completed', initial: 'AB' },
  { id: 2, user: 'Sara Kassa', action: 'Updated grade report for Dept: CS', time: '15 mins ago', status: 'In Progress', initial: 'SK' },
  { id: 3, user: 'Yonas Tadesse', action: 'Approved transfer request (Room 101)', time: '1 hour ago', status: 'Completed', initial: 'YT' },
  { id: 4, user: 'Meseret Abebe', action: 'Sent monthly graduation report', time: '2 hours ago', status: 'Pending', initial: 'MA' },
  { id: 5, user: 'Tewodros Assefa', action: 'Processed withdrawal clearance', time: '4 hours ago', status: 'Completed', initial: 'TA' },
];

export function ActivityFeed() {
  return (
    <Card className="border-none shadow-sm h-full bg-white/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="flex items-center gap-2">
          <History size={18} className="text-primary" />
          <CardTitle className="text-lg font-bold">System-Wide Activity Log</CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="text-primary font-semibold hover:bg-primary/5">View All Logs</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-xs">
                    {activity.initial}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{activity.user}</p>
                  <p className="text-xs text-slate-500 leading-tight">{activity.action}</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="flex justify-end mb-1">
                  <Badge 
                    variant="secondary" 
                    className={`text-[9px] font-extrabold px-2 py-0 ${
                      activity.status === 'Completed' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : activity.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                    } border`}
                  >
                    {activity.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-medium">
                  <Clock size={10} />
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <AlertCircle size={16} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">System Notice</p>
            <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Backup scheduled for 12:00 AM. System might experience minor latency during synchronization.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}