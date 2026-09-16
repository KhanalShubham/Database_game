import { NavLink, Outlet } from 'react-router-dom';
import { Database, ShieldAlert, ShieldCheck, Zap, Wrench, GraduationCap, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';
import { useDbStore } from '../store/dbStore';

const navigation = [
  { name: '01 Database World', href: '/01-database-world', icon: Database },
  { name: '02 Integrity Scanner', href: '/02-integrity-scanner', icon: ShieldAlert },
  { name: '03 Entity', href: '/03-entity-integrity', icon: ShieldCheck },
  { name: '04 Referential', href: '/04-referential-integrity', icon: ShieldCheck },
  { name: '05 Domain', href: '/05-domain-integrity', icon: ShieldCheck },
  { name: '06 Unique', href: '/06-uniqueness', icon: ShieldCheck },
  { name: '07 Structure Lab', href: '/07-structure-lab', icon: LayoutGrid },
  { name: '08 Break It', href: '/08-break-it', icon: Zap },
  { name: '09 Fix It', href: '/09-fix-it', icon: Wrench },
  { name: '10 Normalization', href: '/10-normalization', icon: Database },
  { name: '11 Challenge', href: '/11-challenge', icon: ShieldAlert },
  { name: '12 Assessment', href: '/12-assessment', icon: GraduationCap },
];

export function Layout() {
  const lastResult = useDbStore(state => state.lastValidationResult);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Navigation */}
      <nav className="w-72 bg-card border-r border-slate-200 flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Database className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              DATABASE INTEGRITY LAB
            </h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Database Status Panel */}
        <div className="p-4 border-t border-slate-200">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Database Status
          </h3>
          <div className="space-y-2 text-sm">
            {lastResult ? (
              <div className={cn("p-3 rounded-md border", lastResult.valid ? "bg-success-light border-success/30 text-success-700" : "bg-destructive-light border-destructive/30 text-destructive-700")}>
                <div className="flex items-center gap-2 font-medium mb-1">
                  {lastResult.valid ? <ShieldCheck className="w-4 h-4 text-success" /> : <ShieldAlert className="w-4 h-4 text-destructive" />}
                  {lastResult.valid ? "All Rules Passed" : "Validation Failed"}
                </div>
                {!lastResult.valid && (
                  <p className="text-xs opacity-90">{lastResult.reason}</p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-100 rounded-md border border-slate-200 text-slate-600">
                <div className="flex items-center gap-2 font-medium">
                  <Database className="w-4 h-4" />
                  System Ready
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
