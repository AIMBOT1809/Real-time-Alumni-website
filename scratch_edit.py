import sys

file_path = r'src/app/pages/AdminDashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Type definition
content = content.replace(
    "role: 'alumni' | 'graduate' | 'higher-education' | 'faculty';",
    "role: 'alumni' | 'graduate' | 'higher-education';"
)

# 2. Subscription
sub_old = '''    // Real-time subscription: re-fetch whenever alumni_profiles or faculty_profiles changes
    const channel = supabase
      .channel('profiles_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alumni_profiles' },
        () => {
          fetchAllProfiles();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'faculty_profiles' },
        () => {
          fetchAllProfiles();
        }
      )
      .subscribe();'''
sub_new = '''    // Real-time subscription: re-fetch whenever alumni_profiles changes
    const channel = supabase
      .channel('profiles_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alumni_profiles' },
        () => {
          fetchAllProfiles();
        }
      )
      .subscribe();'''
content = content.replace(sub_old, sub_new)

# 3. fetchAllProfiles
fetch_old = '''  // Fetch faculty profiles
  const { data: facultyData, error: facultyError } = await supabase
    .from("faculty_profiles")
    .select(`
      First_Name,
      Email_Address,
      Phone_Number,
      Department,
      Created_At
    `);

  if (facultyError) {
    console.error("Error fetching faculty:", facultyError);
  }

  const validRoles = new Set(['alumni', 'graduate', 'higher-education', 'faculty']);

  // Format alumni/student records
  const alumniRecords: CommunityAlumniRecord[] = (alumniData || []).map(
    (item, index) => ({
      id: `a-${index}`,
      name: item.First_Name || "",
      email: item.Email_Address || "",
      phone: item.Phone_Number || "",
      graduationYear: String(item.Passed_Out_Year || ""),
      year: String(item.Year_of_Joining || ""),
      role: validRoles.has(item.role) ? item.role as CommunityAlumniRecord['role'] : "alumni",
      createdAt: item.created_at,
    })
  );

  // Format faculty records
  const facultyRecords: CommunityAlumniRecord[] = (facultyData || []).map(
    (item, index) => ({
      id: `f-${index}`,
      name: item.First_Name || "",
      email: item.Email_Address || "",
      phone: item.Phone_Number || "",
      graduationYear: "",
      role: "faculty" as const,
      createdAt: item.Created_At,
    })
  );

  // Merge both lists
  setReportAlumni([...alumniRecords, ...facultyRecords]);
};'''
fetch_new = '''  const validRoles = new Set(['alumni', 'graduate', 'higher-education']);

  // Format alumni/student records
  const alumniRecords: CommunityAlumniRecord[] = (alumniData || []).map(
    (item, index) => ({
      id: `a-${index}`,
      name: item.First_Name || "",
      email: item.Email_Address || "",
      phone: item.Phone_Number || "",
      graduationYear: String(item.Passed_Out_Year || ""),
      year: String(item.Year_of_Joining || ""),
      role: validRoles.has(item.role) ? item.role as CommunityAlumniRecord['role'] : "alumni",
      createdAt: item.created_at,
    })
  );

  // Update lists
  setReportAlumni(alumniRecords);
};'''
content = content.replace(fetch_old, fetch_new)

# 4. analyticsCounts
analytics_old = '''  const analyticsCounts = useMemo(() => {
    const totalRegistrations = reportAlumni.length;
    const alumniCount = reportAlumni.filter((item) => item.role === 'alumni').length;
    const facultyCount = reportAlumni.filter((item) => item.role === 'faculty').length;
    const higherEducationCount = reportAlumni.filter((item) => item.role === 'higher-education').length;
    const graduateCount = reportAlumni.filter((item) => item.role === 'graduate').length;
    const effectiveTotal = totalRegistrations || 1;

    return {
      totalRegistrations,
      alumniCount,
      facultyCount,
      higherEducationCount,
      graduateCount,
      alumniRatio: Math.round((alumniCount / effectiveTotal) * 100),
      facultyRatio: Math.round((facultyCount / effectiveTotal) * 100),
      higherEducationRatio: Math.round((higherEducationCount / effectiveTotal) * 100),
      graduateRatio: Math.round((graduateCount / effectiveTotal) * 100),
    };
  }, [reportAlumni]);'''
analytics_new = '''  const analyticsCounts = useMemo(() => {
    const totalRegistrations = reportAlumni.length;
    const alumniCount = reportAlumni.filter((item) => item.role === 'alumni').length;
    const higherEducationCount = reportAlumni.filter((item) => item.role === 'higher-education').length;
    const graduateCount = reportAlumni.filter((item) => item.role === 'graduate').length;
    const effectiveTotal = totalRegistrations || 1;

    return {
      totalRegistrations,
      alumniCount,
      higherEducationCount,
      graduateCount,
      alumniRatio: Math.round((alumniCount / effectiveTotal) * 100),
      higherEducationRatio: Math.round((higherEducationCount / effectiveTotal) * 100),
      graduateRatio: Math.round((graduateCount / effectiveTotal) * 100),
    };
  }, [reportAlumni]);'''
content = content.replace(analytics_old, analytics_new)

# 5. registrationSegments
reg_old = '''  const registrationSegments = useMemo(() => {
    const segments = [
      { label: 'Alumni', count: analyticsCounts.alumniCount, color: 'from-blue-500 to-sky-400', dashColor: '#0ea5e9' },
      { label: 'Faculty', count: analyticsCounts.facultyCount, color: 'from-emerald-400 to-teal-300', dashColor: '#10b981' },
      { label: 'Higher Education', count: analyticsCounts.higherEducationCount, color: 'from-violet-500 to-fuchsia-400', dashColor: '#8b5cf6' },
      { label: 'Graduate', count: analyticsCounts.graduateCount, color: 'from-amber-400 to-orange-300', dashColor: '#f59e0b' },
    ];'''
reg_new = '''  const registrationSegments = useMemo(() => {
    const segments = [
      { label: 'Alumni', count: analyticsCounts.alumniCount, color: 'from-blue-500 to-sky-400', dashColor: '#0ea5e9' },
      { label: 'Higher Education', count: analyticsCounts.higherEducationCount, color: 'from-violet-500 to-fuchsia-400', dashColor: '#8b5cf6' },
      { label: 'Graduate', count: analyticsCounts.graduateCount, color: 'from-amber-400 to-orange-300', dashColor: '#f59e0b' },
    ];'''
content = content.replace(reg_old, reg_new)

# 6. timelineData
time_old = '''  const timelineData = useMemo(() => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    // Initialize monthly data
    const monthlyData = months.map(month => ({
      name: month,
      timelineAlumni: 0,
      timelineStudents: 0,
      timelineFaculties: 0,
      timelineHigherEd: 0
    }));

    reportAlumni.forEach(profile => {
      if (!profile.createdAt) return;
      const date = new Date(profile.createdAt);
      if (isNaN(date.getTime())) return;
      
      const monthIndex = date.getMonth(); // 0-11
      const role = profile.role;
      
      if (role === 'alumni') {
        monthlyData[monthIndex].timelineAlumni++;
      } else if (role === 'faculty') {
        monthlyData[monthIndex].timelineFaculties++;
      } else if (role === 'higher-education') {
        monthlyData[monthIndex].timelineHigherEd++;
      } else if (role === 'graduate') {
        monthlyData[monthIndex].timelineStudents++; // using students key for graduate
      }
    });

    return monthlyData;
  }, [reportAlumni]);'''
time_new = '''  const timelineData = useMemo(() => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    // Initialize monthly data
    const monthlyData = months.map(month => ({
      name: month,
      timelineAlumni: 0,
      timelineStudents: 0,
      timelineHigherEd: 0
    }));

    reportAlumni.forEach(profile => {
      if (!profile.createdAt) return;
      const date = new Date(profile.createdAt);
      if (isNaN(date.getTime())) return;
      
      const monthIndex = date.getMonth(); // 0-11
      const role = profile.role;
      
      if (role === 'alumni') {
        monthlyData[monthIndex].timelineAlumni++;
      } else if (role === 'higher-education') {
        monthlyData[monthIndex].timelineHigherEd++;
      } else if (role === 'graduate') {
        monthlyData[monthIndex].timelineStudents++; // using students key for graduate
      }
    });

    return monthlyData;
  }, [reportAlumni]);'''
content = content.replace(time_old, time_new)

# 7. Select option
opt_old = '''                      <option value="higher-education">Higher Education</option>
                      <option value="faculty">Faculty</option>
                    </select>'''
opt_new = '''                      <option value="higher-education">Higher Education</option>
                    </select>'''
content = content.replace(opt_old, opt_new)

# 8. roleColors map
role_old = '''  const roleColors = {
                          alumni: 'bg-blue-100 text-blue-800',
                          graduate: 'bg-amber-100 text-amber-800',
                          'higher-education': 'bg-violet-100 text-violet-800',
                          faculty: 'bg-emerald-100 text-emerald-800',
                        };'''
role_new = '''  const roleColors = {
                          alumni: 'bg-blue-100 text-blue-800',
                          graduate: 'bg-amber-100 text-amber-800',
                          'higher-education': 'bg-violet-100 text-violet-800',
                        };'''
content = content.replace(role_old, role_new)

# 9. StatCards rendering
card_old = '''                { title: 'Faculty', value: analyticsCounts.facultyCount, subtitle: `${analyticsCounts.facultyRatio}% of total`, accent: 'from-emerald-400 via-teal-300 to-cyan-200', detail: 'Academic representation' },'''
content = content.replace(card_old, '')

# 10. Summary info below charts
summary_old = '''                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span>Balanced faculty representation</span>
                        <span className="font-semibold text-emerald-400">{analyticsCounts.facultyRatio}%</span>
                      </div>'''
content = content.replace(summary_old, '')

# 11. Bar chart timelineFaculties
bar_old = '''                    <Bar dataKey="timelineFaculties" name="Faculty" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} animationDuration={1000} />'''
content = content.replace(bar_old, '')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Successfully modified AdminDashboard.tsx")
