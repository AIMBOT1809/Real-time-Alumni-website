
import React from 'react';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export function Community() {
  const { posts, following, getAlumniById, role, user } = useAuth();

  // Filter posts to show followed alumni posts plus admin announcements
  const followedPosts = posts.filter(
    post => following.includes(post.alumniId) || post.alumniId === 'admin' || (role === 'admin' && user?.id === post.alumniId)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Community Discussion</h1>
          <p className="text-slate-600 mt-2">Share insights, ask questions, and connect with peers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Popular Topics</h3>
            <ul className="space-y-2">
              {['Career Advice', 'Interview Prep', 'Industry Trends', 'Relocation', 'Higher Education'].map(topic => (
                <li key={topic}>
                  <a href="#" className="text-slate-600 hover:text-yellow-600 hover:bg-yellow-50 block px-2 py-1 rounded transition-colors text-sm">
                    #{topic}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-lg shadow-sm">
            <h3 className="font-bold mb-2">Community Guidelines</h3>
            <p className="text-sm text-slate-300 mb-4">
              Please be respectful and professional. This is a space for constructive dialogue and support.
            </p>
            <a href="#" className="text-yellow-400 text-sm hover:underline">Read full guidelines</a>
          </div>
        </div>

        {/* Feed */}
        <div className="lg:col-span-3 space-y-6">
          {followedPosts.map((post, index) => {
            const author = getAlumniById(post.alumniId) || {
              id: post.alumniId,
              name: post.alumniId === 'admin' ? 'Admin' : 'Alumni Member',
              role: 'alumni',
              avatar: 'https://ui-avatars.com/api/?name=Alumni&background=FDE68A&color=111827&size=256',
              graduationYear: new Date().getFullYear(),
              degree: '',
              skills: [],
            };
            
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-semibold text-slate-900">{author.name}</h4>
                      <p className="text-xs text-slate-500 capitalize">{author.role} • {post.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full capitalize">
                      {post.type}
                    </span>
                  </div>
                </div>
                
                {post.title && (
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{post.title}</h3>
                )}
                <p className="text-slate-600 mb-4">{post.content}</p>
                
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full rounded-lg mb-4"
                  />
                )}
                
                <div className="flex items-center space-x-6 text-slate-500 text-sm border-t border-slate-100 pt-4">
                  <button className="flex items-center space-x-2 hover:text-yellow-600 transition-colors">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likes} Likes</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-yellow-600 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments} Comments</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
          
          {followedPosts.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No posts yet</h3>
              <p className="text-slate-500">Follow some alumni to see their posts here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
