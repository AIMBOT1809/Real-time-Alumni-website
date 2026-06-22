
import React, { useState } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export function Opportunities() {
  const { jobs, role, addJob, user, following } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Filter jobs to show followed alumni postings plus admin-managed listings
  const followedJobs = jobs?.filter(
    job =>
      job.alumniId &&
      (
        following?.includes(job.alumniId) ||
        job.alumniId === 'admin' ||
        (role === 'admin' && user?.id === job.alumniId)
      )
  ) || [];

  // Apply search and type filters
  const filteredJobs = followedJobs.filter(job => {
    const matchesSearch = searchTerm === '' ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || job.type === selectedType;

    return matchesSearch && matchesType;
  });


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Career Opportunities</h1>
          <p className="text-slate-600 mt-2">Find your next internship or full-time role from our alumni network.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by job title, company, or keywords..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 md:w-48">
          <select
            className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold
                  ${job.type === 'Internship' ? 'bg-purple-100 text-purple-800' : 
                    job.type === 'Full-time' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {job.type}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center text-slate-500 text-sm gap-2 sm:gap-4 mb-3">
                <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1" /> {job.company}</span>
                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {job.location}</span>
                <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> Posted {job.postedDate}</span>
              </div>
              <p className="text-slate-600 line-clamp-2">{job.description}</p>
            </div>
            <div className="flex-shrink-0">
              <button className="w-full md:w-auto px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition-colors">
                View Details
              </button>
            </div>
          </motion.div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No opportunities available</h3>
            <p className="text-slate-500">Follow more alumni to see their job postings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
