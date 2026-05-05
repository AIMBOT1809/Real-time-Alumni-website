
import React, { useState } from 'react';
import { Search, MapPin, Briefcase, GraduationCap, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export function AlumniNetwork() {
  const { alumni, isFollowing, follow, unfollow } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const filteredAlumni = alumni.filter(alumni => {
    const matchesSearch = 
      alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumni.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumni.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = selectedRole === 'all' || alumni.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const handleFollowToggle = (alumniId: string) => {
    if (isFollowing(alumniId)) {
      unfollow(alumniId);
    } else {
      follow(alumniId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Alumni Directory</h1>
        <p className="text-slate-600 mb-8">Connect with graduates who are making an impact in their fields.</p>
        
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, company, or skills..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 md:w-48">
            <Filter className="text-slate-400 h-5 w-5" />
            <select
              className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="alumni">Alumni</option>
              <option value="graduate">Recent Graduate</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlumni.map((alumni, index) => (
          <motion.div
            key={alumni.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-700"></div>
            <div className="px-6 pb-6">
              <div className="relative flex justify-between items-end -mt-12 mb-4">
                <img
                  src={alumni.avatar}
                  alt={alumni.name}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-sm bg-slate-100"
                />
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                  ${alumni.role === 'alumni' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {alumni.role.replace('_', ' ')}
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900">{alumni.name}</h3>
                <p className="text-slate-500 text-sm flex items-center mt-1">
                  <Briefcase className="h-3 w-3 mr-1" /> {alumni.position} at {alumni.company}
                </p>
                <p className="text-slate-500 text-sm flex items-center mt-1">
                  <GraduationCap className="h-3 w-3 mr-1" /> {alumni.degree} ({alumni.graduationYear})
                </p>
              </div>
              
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">{alumni.bio}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {alumni.skills.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                    {skill}
                  </span>
                ))}
              </div>
              
              <button 
                onClick={() => handleFollowToggle(alumni.id)}
                className={`w-full py-2 font-medium rounded-md transition-colors ${
                  isFollowing(alumni.id)
                    ? 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    : 'border border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                {isFollowing(alumni.id) ? 'Following' : 'Follow'}
              </button>
            </div>
          </motion.div>
        ))}
        
        {filteredAlumni.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 text-lg">No alumni found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
