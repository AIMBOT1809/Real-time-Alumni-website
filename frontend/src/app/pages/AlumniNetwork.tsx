import React, { useState, useEffect } from 'react';
import { Search, Briefcase, GraduationCap, ChevronRight, Award, Upload, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../supabaseClient';

export function AlumniNetwork() {
  const { user, role } = useAuth();
  const [alumni, setAlumni] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drill-down states
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    fetchAlumni();

    const channel = supabase
      .channel('alumni_network_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alumni_profiles' },
        () => {
          fetchAlumni();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlumni = async () => {
    const { data, error } = await supabase
      .from('alumni_profiles')
      .select('*')
      .order('First_Name', { ascending: true });

    if (error) {
      console.error('Error fetching alumni:', error);
      return;
    }

    if (data) setAlumni(data);
  };

  const isSearching = searchTerm.trim().length > 0;

  // Filter for search
  const searchResults = alumni.filter(a => {
    const term = searchTerm.toLowerCase();
    const fullName = `${a.First_Name || ''} ${a.Last_name || ''}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (a.Organization_Name && a.Organization_Name.toLowerCase().includes(term)) ||
      (a.Department && a.Department.toLowerCase().includes(term)) ||
      (a.achievement && a.achievement.toLowerCase().includes(term)) ||
      (a.career_status && a.career_status.toLowerCase().includes(term))
    );
  });

  // Extract unique years
  const availableYears = Array.from(
    new Set(alumni.map(a => a.Passed_Out_Year).filter(Boolean))
  ).sort((a, b) => b - a); // newest first

  // Extract unique departments for selected year
  const availableDepartments = selectedYear
    ? Array.from(
        new Set(alumni.filter(a => a.Passed_Out_Year === selectedYear).map(a => a.Department).filter(Boolean))
      ).sort()
    : [];

  // Alumni for selected year and department
  const filteredDirectory = selectedYear && selectedDepartment
    ? alumni.filter(a => a.Passed_Out_Year === selectedYear && a.Department === selectedDepartment)
    : [];

  const handleUploadClick = () => {
    alert("Admin Feature: Bulk Upload Alumni List functionality will open here.");
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 px-6 sm:px-8 pt-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Alumni Directory</h1>
            <p className="text-slate-700 dark:text-slate-300">Connect with alumni grouped by their graduation year and department.</p>
          </div>
          {role === 'admin' && (
            <button
              onClick={handleUploadClick}
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-slate-800 transition-colors"
            >
              <Upload className="h-5 w-5" />
              Upload Alumni Data
            </button>
          )}
        </div>
        
        <div className="glass-card shiny-border p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, company, department, or achievements..."
              className="w-full rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-300 dark:border-yellow-400/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none pl-11 pr-4 py-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isSearching ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Search Results ({searchResults.length})</h2>
          <AlumniGrid alumniList={searchResults} />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Breadcrumbs Navigation */}
          <nav className="flex items-center space-x-2 text-sm font-semibold">
            <button 
              onClick={() => { setSelectedYear(null); setSelectedDepartment(null); }}
                className={`transition-colors ${selectedYear ? 'text-blue-600 hover:underline' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Graduation Year
            </button>
            
            {selectedYear && (
              <>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <button 
                  onClick={() => setSelectedDepartment(null)}
                  className={`transition-colors ${selectedDepartment ? 'text-blue-600 hover:underline' : 'text-slate-900 dark:text-slate-100'}`}
                >
                  Class of {selectedYear}
                </button>
              </>
            )}

            {selectedDepartment && (
              <>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <span className="text-slate-900 dark:text-slate-100">{selectedDepartment}</span>
              </>
            )}
          </nav>

          <AnimatePresence mode="wait">
            {!selectedYear && (
              <motion.div
                key="years"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className="flex flex-col items-center justify-center p-6 glass-card shiny-border rounded-2xl text-center hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <GraduationCap className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">Class of {year}</span>
                    <span className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {alumni.filter(a => a.Passed_Out_Year === year).length} Alumni
                    </span>
                  </button>
                ))}
              </motion.div>
            )}

            {selectedYear && !selectedDepartment && (
              <motion.div
                key="departments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {availableDepartments.map(dept => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDepartment(dept)}
                    className="flex items-center justify-between p-6 glass-card shiny-border rounded-2xl hover:-translate-y-1 transition-all duration-300 group text-left"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{dept}</h3>
                      <span className="text-sm text-slate-600 dark:text-slate-300 mt-1 block">
                        {alumni.filter(a => a.Passed_Out_Year === selectedYear && a.Department === dept).length} Members
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </motion.div>
            )}

            {selectedYear && selectedDepartment && (
              <motion.div
                key="alumni"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {selectedDepartment} - Class of {selectedYear}
                  </h2>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-semibold">
                    {filteredDirectory.length} Alumni
                  </span>
                </div>
                <AlumniGrid alumniList={filteredDirectory} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function AlumniGrid({ alumniList }: { alumniList: any[] }) {
  if (alumniList.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400 font-medium">No alumni found in this section.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {alumniList.map((a, index) => (
        <motion.div
          key={a.id || a.user_id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.05, 0.3) }}
          className="glass-card shiny-border p-5 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
        >
          <div className="h-20 bg-gradient-to-r from-slate-900 to-slate-800"></div>
          <div className="px-6 pb-6 flex-grow flex flex-col">
            <div className="relative flex justify-between items-end -mt-10 mb-4">
              <img
                src={a.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.First_Name + ' ' + a.Last_name)}&background=e2e8f0&color=475569&size=128`}
                alt={`${a.First_Name} ${a.Last_name}`}
                className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 object-cover shadow-sm bg-white dark:bg-slate-800"
              />
              {a.role && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800">
                  {a.role}
                </span>
              )}
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {a.First_Name} {a.Last_name}
              </h3>
              
              {a.career_status && a.Organization_Name ? (
                <p className="text-slate-600 dark:text-slate-300 text-sm flex items-center mt-1.5 font-medium">
                  <Briefcase className="h-4 w-4 mr-1.5 text-slate-400 dark:text-slate-500" /> 
                  {a.career_status} at {a.Organization_Name}
                </p>
              ) : a.career_status || a.Organization_Name ? (
                <p className="text-slate-600 dark:text-slate-300 text-sm flex items-center mt-1.5 font-medium">
                  <Briefcase className="h-4 w-4 mr-1.5 text-slate-400 dark:text-slate-500" /> 
                  {a.career_status || a.Organization_Name}
                </p>
              ) : null}
              
              {(a.Passed_Out_Year || a.Department) && (
                <p className="text-slate-500 dark:text-slate-400 text-sm flex items-start mt-1.5">
                  <GraduationCap className="h-4 w-4 mr-1.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                  <span>{a.Department} {a.Passed_Out_Year ? `(${a.Passed_Out_Year})` : ''}</span>
                </p>
              )}
              
              {(a.Country || a.City) && (
                <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center mt-1.5">
                  <MapPin className="h-4 w-4 mr-1.5 text-slate-400 dark:text-slate-500" /> 
                  {[a.City, a.Country].filter(Boolean).join(', ')}
                </p>
              )}
            </div>

            {(a.achievement || a.about) && (
              <div className="mt-auto mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1.5 mb-1 text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                  <Award className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                  Highlights
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                  {a.achievement || a.about}
                </p>
              </div>
            )}
            
            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => alert(`Connect request sent to ${a.First_Name}`)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Connect
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
