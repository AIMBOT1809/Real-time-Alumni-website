
import React from 'react';
import { MessageSquare, ThumbsUp, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

const SAMPLE_POSTS = [
  {
    id: 1,
    author: 'Sarah Chen',
    role: 'Alumni',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    time: '2 hours ago',
    title: 'Tips for negotiating your first salary',
    content: "When I graduated, I didn't negotiate my first offer and I regret it. Here are 3 things I wish I knew...",
    likes: 45,
    comments: 12,
    tags: ['Career Advice', 'Salary']
  },
  {
    id: 2,
    author: 'Michael Ross',
    role: 'Alumni',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    time: '5 hours ago',
    title: 'Anyone attending the Tech Conference in SF next month?',
    content: "I'll be there representing Global Finance. Would love to meet up with fellow alumni!",
    likes: 28,
    comments: 8,
    tags: ['Networking', 'Events']
  },
  {
    id: 3,
    author: 'Emily Davis',
    role: 'Recent Graduate',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    time: '1 day ago',
    title: 'Looking for mock interview partners',
    content: "Hi everyone! I'm preparing for PM interviews. Is anyone available for a mock interview this weekend?",
    likes: 15,
    comments: 24,
    tags: ['Interview Prep', 'Mentorship']
  }
];

export function Community() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Community Discussion</h1>
          <p className="text-slate-600 mt-2">Share insights, ask questions, and connect with peers.</p>
        </div>
        {isAuthenticated && (
          <button className="mt-4 md:mt-0 bg-yellow-500 text-slate-900 font-bold py-2 px-6 rounded-md hover:bg-yellow-400 transition-colors shadow-sm">
            Start a Discussion
          </button>
        )}
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
          {SAMPLE_POSTS.map((post, index) => (
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
                    src={post.avatar}
                    alt={post.author}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900">{post.author}</h4>
                    <p className="text-xs text-slate-500">{post.role} • {post.time}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">{post.title}</h3>
              <p className="text-slate-600 mb-4">{post.content}</p>
              
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
          ))}
        </div>
      </div>
    </div>
  );
}
