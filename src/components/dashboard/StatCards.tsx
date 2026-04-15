import { 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  { id: 1, label: 'New Requests', value: '24', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5%' },
  { id: 2, label: 'Completed', value: '1,284', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12%' },
  { id: 3, label: 'In Progress', value: '56', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-2%' },
  { id: 4, label: 'Action Needed', value: '12', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'High' },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={stat.color} size={22} />
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] font-bold ${idx === 3 ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-slate-500'}`}
                >
                  {stat.trend}
                </Badge>
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</h3>
                <p className="text-xl md:text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}