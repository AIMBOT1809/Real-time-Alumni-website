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
  careerAspirants: number;
}

const COLORS = {
  total: '#FFD700',
  working: '#3B82F6',
  higherStudies: '#10B981',
  careerAspirants: '#F59E0B',
};

const STATUS_KEYWORDS = {
  working: ['job', 'working', 'working professional', 'employed', 'service', 'software', 'engineer', 'developer', 'consultant', 'analyst', 'manager', 'executive', 'associate', 'intern'],
  higherStudies: ['higher education', 'higher studies', 'studying', 'student', 'masters', 'phd', 'mba', 'postgraduate', 'research'],
  careerAspirant: ['career aspirant', 'aspirant', 'looking for job', 'job seeker', 'fresher', 'unemployed'],
};

function classifyStatus(status: string): 'working' | 'higher-studies' | 'career-aspirant' | null {
  const s = status.toLowerCase().trim();
  if (!s || s === 'null' || s === 'undefined') return null;

  for (const kw of STATUS_KEYWORDS.working) {
    if (s === kw || s.includes(kw)) return 'working';
  }
  for (const kw of STATUS_KEYWORDS.higherStudies) {
    if (s === kw || s.includes(kw)) return 'higher-studies';
  }
  for (const kw of STATUS_KEYWORDS.careerAspirant) {
    if (s === kw || s.includes(kw)) return 'career-aspirant';
  }
  return null;
}

export function AlumniStatisticsWidget() {
  const [stats, setStats] = useState<AlumniStats>({
    total: 0,
    working: 0,
    higherStudies: 0,
    careerAspirants: 0,
  });
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
          .select('Current_Status, current_status, currentStatus, role, Role')
          .not('role', 'eq', 'faculty');

        if (fetchError) {
          console.error('[AlumniStatisticsWidget] Supabase fetch error:', {
            code: fetchError.code,
            message: fetchError.message,
            details: fetchError.details,
            hint: fetchError.hint,
          });
          if (mounted) {
            setError('Failed to load alumni statistics');
            setLoading(false);
          }
          return;
        }

        if (!mounted) return;

        if (!data || data.length === 0) {
          console.log('[AlumniStatisticsWidget] No alumni records found');
          if (mounted) {
            setStats({ total: 0, working: 0, higherStudies: 0, careerAspirants: 0 });
            setLoading(false);
          }
          return;
        }

        console.log(`[AlumniStatisticsWidget] Processing ${data.length} records`);

        let working = 0;
        let higherStudies = 0;
        let careerAspirants = 0;
        let uncategorized = 0;

        data.forEach((row: any) => {
          const rawStatus = row.Current_Status ?? row.current_status ?? row.currentStatus ?? '';
          const status = String(rawStatus).trim();
          const category = classifyStatus(status);

          if (category === 'working') working++;
          else if (category === 'higher-studies') higherStudies++;
          else if (category === 'career-aspirant') careerAspirants++;
          else {
            uncategorized++;
            console.log(`[AlumniStatisticsWidget] Uncategorized status: "${status}"`);
          }
        });

        const total = data.length;
        console.log(`[AlumniStatisticsWidget] Stats: total=${total}, working=${working}, higherStudies=${higherStudies}, careerAspirants=${careerAspirants}, uncategorized=${uncategorized}`);

        if (mounted) {
          setStats({ total, working, higherStudies, careerAspirants });
          setLoading(false);
        }
      } catch (err) {
        console.error('[AlumniStatisticsWidget] Unexpected error:', {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
        if (mounted) {
          setError('An unexpected error occurred');
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
    { name: 'Career Aspirants', value: stats.careerAspirants, color: COLORS.careerAspirants },
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
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Users className="h-5 w-5 text-yellow-400" />
          Alumni Insights
        </h2>
        <p className="text-sm text-slate-400">Registration statistics overview</p>
      </div>

      {/* Count Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Alumni */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-md hover:border-yellow-400/50 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-400/10 group-hover:bg-yellow-400/20 transition-colors">
              <Users className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Total Alumni</p>
              <p className="text-2xl font-bold text-white">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-slate-700 rounded animate-pulse" />
                ) : error ? (
                  <span className="text-red-400 text-lg">--</span>
                ) : (
                  stats.total
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Working Professionals */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-md hover:border-blue-400/50 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <Briefcase className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Working</p>
              <p className="text-2xl font-bold text-white">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-slate-700 rounded animate-pulse" />
                ) : error ? (
                  <span className="text-red-400 text-lg">--</span>
                ) : (
                  stats.working
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Higher Studies */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-md hover:border-emerald-400/50 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <GraduationCap className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Higher Studies</p>
              <p className="text-2xl font-bold text-white">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-slate-700 rounded animate-pulse" />
                ) : error ? (
                  <span className="text-red-400 text-lg">--</span>
                ) : (
                  stats.higherStudies
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Career Aspirants */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-md hover:border-amber-400/50 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
              <Rocket className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Career Aspirants</p>
              <p className="text-2xl font-bold text-white">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-slate-700 rounded animate-pulse" />
                ) : error ? (
                  <span className="text-red-400 text-lg">--</span>
                ) : (
                  stats.careerAspirants
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {/* Donut Chart */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Distribution</h3>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-32 h-32 rounded-full border-4 border-slate-700 border-t-yellow-400 animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-slate-500 text-sm">No data available</p>
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
                  <span className="text-slate-300 text-xs">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}