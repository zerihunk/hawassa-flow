import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function SystemStatus() {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold">System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">Database Persistence</span>
          <Badge className="bg-emerald-500 text-white border-none text-[10px] font-bold px-2 py-0.5">HEALTHY</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">File Storage Server</span>
          <Badge className="bg-emerald-500 text-white border-none text-[10px] font-bold px-2 py-0.5">HEALTHY</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">Auth Service</span>
          <Badge className="bg-emerald-500 text-white border-none text-[10px] font-bold px-2 py-0.5">HEALTHY</Badge>
        </div>
        <Separator className="opacity-50" />
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
          <AlertCircle size={16} />
          <span className="text-[10px] font-bold uppercase tracking-tight">2 Maintenance alerts pending</span>
        </div>
      </CardContent>
    </Card>
  );
}