import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
// @ts-ignore
import Users from 'lucide-react/dist/esm/icons/users';
// @ts-ignore
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
// @ts-ignore
import GraduationCap from 'lucide-react/dist/esm/icons/graduation-cap';
// @ts-ignore
import Rocket from 'lucide-react/dist/esm/icons/rocket';

interface AlumniStats {
  total: number;
  working: number;
  higherStudies: number;
  entrepreneur: number;
}

const COLORS = {
  total: '#FFD700',
  working: '#3B82F6',
  higherStudies: '#10B981',
  entrepreneur: '#F59E0B',
};

const INITIAL_STATS: AlumniStats = {
  total: 0,
  working: 0,
  higherStudies: 0,
  entrepreneur: 0,
};

const STATUS_KEYWORDS = {
  working: ['job', 'working', 'working professional', 'employed', 'service', 'software', 'engineer', 'developer', 'consultant', 'analyst', 'manager', 'executive', 'associate', 'intern'],
  higherStudies: ['higher education', 'higher studies', 'studying', 'student', 'masters', 'phd', 'mba', 'postgraduate', 'research'],
  entrepreneur: ['entrepreneur', 'business', 'startup', 'founder', 'self employed'],
};

function normalize(value: any) {
  return String(value || '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyAlumni(row: any): 'working' | 'higher-studies' | 'entrepreneur' | null {
  const text = normalize(Object.values(row).filter(Boolean).join(' '));

  if (!text) return null;

  if (
    text.includes('entrepreneur') ||
    text.includes('business') ||
    text.includes('startup') ||
    text.includes('founder') ||
    text.includes('owner') ||
    text.includes('self employed')
  ) {
    return 'entrepreneur';
  }

  if (
    text.includes('higher education') ||
    text.includes('higher studies') ||
    text.includes('masters') ||
    text.includes('mtech') ||
    text.includes('mba') ||
    text.includes('phd') ||
    text.includes('university') ||
    text.includes('studying')
  ) {
    return 'higher-studies';
  }

  if (
    text.includes('working professional') ||
    text.includes('working') ||
    text.includes('job') ||
    text.includes('employed') ||
    text.includes('software') ||
    text.includes('engineer') ||
    text.includes('developer') ||
    text.includes('analyst') ||
    text.includes('manager') ||
    text.includes('intern')
  ) {
    return 'working';
  }

  return null;
}
export function AlumniStatisticsWidget() {
  const [stats, setStats] = useState<AlumniStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchAlumniStats = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[AlumniStatisticsWidget] Fetching alumni statistics...');

        const { data, error: fetchError } = await supabase
          .from('alumni_profiles')
          .select('*')

        if (fetchError) {
          console.error('[AlumniStatisticsWidget] Supabase fetch error:', {
            code: fetchError.code,
            message: fetchError.message,
            details: fetchError.details,
            hint: fetchError.hint,
          });
          if (mounted) {
            console.log('[AlumniStatisticsWidget] Using demo statistics');
            setStats(INITIAL_STATS);
            setLoading(false);
          }
          return;
        }

        if (!mounted) return;

        if (!data || data.length === 0) {
          console.log('[AlumniStatisticsWidget] No alumni records found, using demo statistics');
          if (mounted) {
            setStats(INITIAL_STATS);
            setLoading(false);
          }
          return;
        }

        console.log(`[AlumniStatisticsWidget] Processing ${data.length} records`);

        let working = 0;
        let higherStudies = 0;
        let entrepreneur = 0;
        let uncategorized = 0;

        data.forEach((row: any) => {
          const category = classifyAlumni(row);

          if (category === 'working') working++;
          else if (category === 'higher-studies') higherStudies++;
          else if (category === 'entrepreneur') entrepreneur++;
          else {
            uncategorized++;
            console.log(`[AlumniStatisticsWidget] Uncategorized status: "${status}"`);
          }
        });

        const total = data.length;
        console.log(`[AlumniStatisticsWidget] Stats: total=${total}, working=${working}, higherStudies=${higherStudies}, careerAspirants=${entrepreneur}, uncategorized=${uncategorized}`);

        if (mounted) {
          setStats({ total, working, higherStudies, entrepreneur });
          setLoading(false);
        }
      } catch (err) {
        console.error('[AlumniStatisticsWidget] Unexpected error:', {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        if (mounted) {
          console.log('[AlumniStatisticsWidget] Using demo statistics due to error');
          setStats(INITIAL_STATS);
          setLoading(false);
        }
      }
    };

    fetchAlumniStats();

    return () => {
      mounted = false;
    };
  }, []);

  const chartData = [
    { name: 'Working Professionals', value: stats.working, color: COLORS.working },
    { name: 'Higher Studies', value: stats.higherStudies, color: COLORS.higherStudies },
    { name: 'Entrepreneur', value: stats.entrepreneur, color: COLORS.entrepreneur },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-white text-sm font-medium">{payload[0].name}</p>
          <p className="text-yellow-400 text-sm font-bold">{payload[0].value} alumni</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (cx: number, cy: number, midAngle: number, innerRadius: number, outerRadius: number, percent: number) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="alumni-statistics-widget space-y-4">
      {/* Header Card */}
      <div className="glass-card shiny-border rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-lg bg-white dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Users className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
          Alumni Insights
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Registration statistics overview</p>
      </div>

      {/* Count Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Alumni */}
        <div className="glass-card shiny-border rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-md hover:border-yellow-400/50 transition-all duration-300 group bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-400/10 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-400/20 transition-colors">
              <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Alumni</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ) : (
                  stats.total
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Working Professionals */}
        <div className="glass-card shiny-border rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-md hover:border-blue-400/50 transition-all duration-300 group bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/10 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/20 transition-colors">
              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">Working</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ) : (
                  stats.working
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Higher Studies */}
        <div className="glass-card shiny-border rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-md hover:border-emerald-400/50 transition-all duration-300 group bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-colors">
              <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">Higher Studies</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ) : (
                  stats.higherStudies
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Career Aspirants */}
        <div className="glass-card shiny-border rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-md hover:border-amber-400/50 transition-all duration-300 group bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/10 group-hover:bg-amber-200 dark:group-hover:bg-amber-500/20 transition-colors">
              <Rocket className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">Entrepreneur</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                ) : (
                  stats.entrepreneur
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="glass-card shiny-border rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-lg bg-white dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Distribution</h3>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-yellow-500 animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-slate-500 dark:text-slate-400 text-sm">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) =>
                  renderCustomLabel(cx, cy, midAngle, innerRadius, outerRadius, percent)
                }
                outerRadius={80}
                innerRadius={45}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="none"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-slate-600 dark:text-slate-300 text-xs">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
