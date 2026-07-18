import React, { useState } from 'react';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showGlobalToast } from '../components/Toast';
import { motion } from 'motion/react';
import { useEffect } from "react";
import { supabase } from "../../supabaseClient";

const normalizeUrl = (url?: string) => {
  if (!url || !url.trim()) return "";
  const trimmed = url.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
};

const openPostLink = (url?: string) => {
  const finalUrl = normalizeUrl(url);
  if (!finalUrl) {
    showGlobalToast("Link not available for this post.", 'warning');
    return;
  }
  window.open(finalUrl, "_blank", "noopener,noreferrer");
};

export function Events() {
  const { getAlumniById, role, user, addEvent } = useAuth();

const [events, setEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');


  const filteredEvents = events.filter((event) => {
  const query = searchTerm.toLowerCase();

  const matchesSearch =
    event.title?.toLowerCase().includes(query) ||
    event.location?.toLowerCase().includes(query) ||
    event.organizer?.toLowerCase().includes(query);

  const matchesType =
    selectedType === "all" || event.type === selectedType;

  return matchesSearch && matchesType;
});

  const fetchEvents = async () => {
  // Alumni events - fetch all posts and filter for those with event details
  const { data: postEvents, error: postError } = await supabase
    .from("posts")
    .select("*");

  // Admin events
  const { data: adminEvents, error: adminError } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (postError) {
    console.log(postError);
  }

  if (adminError) {
    console.log(adminError);
  }

  // Log all posts to see what we're working with
  console.log("All posts count:", postEvents?.length);
  console.log("Post types:", [...new Set(postEvents?.map(p => p.type))]);
  
  const alumni = (postEvents || [])
  .map((item: any) => {
    console.log("Processing post:", item.id, "type:", item.type, "has post_details:", !!item.post_details);
    
    let details = item.post_details;
    let hasValidDetails = false;

    try {
      if (typeof details === "string") {
        details = JSON.parse(details);
      }
      if (details && typeof details === "object") {
        hasValidDetails = true;
      }
    } catch {
      // Invalid JSON
    }

    // Include all posts for now to see what's available
    return {
      id: item.id,
      source: "post",
      title: hasValidDetails ? (details.eventTitle || item.title || 'Untitled Event') : (item.title || 'Untitled Event'),
      date: hasValidDetails ? (details.eventDate || item.created_at) : (item.created_at || ''),
      time: hasValidDetails ? (details.eventTime || '') : '',
      location: hasValidDetails ? (details.eventLocation || item.content || '') : (item.content || ''),
      image: item.image || item.file_url || '',
      organizer: hasValidDetails ? (details.organizer || item.author_name || "Alumni") : (item.author_name || "Alumni"),
      type: hasValidDetails ? (details.eventType || "Event") : (item.type === 'event' ? 'Event' : "Event"),
      created_at: item.created_at,
      registrationLink: hasValidDetails ? (details.registrationLink || '') : '',
      alumniId: item.alumni_id || item.author_id || 'unknown',
    };
  })
  .filter((event: any) => event !== null && event.title && event.title.trim() !== '');

  const admin = (adminEvents || []).map((item: any) => ({
    id: item.id,
    source: "admin",
    title: item.title,
    date: item.event_date,
    time: item.event_time,
    location: item.location,
    image: item.image_url || item.file_url,
    organizer: "Admin",
    type: item.type || "Event",
    created_at: item.created_at,
  }));
  console.log("Admin Events:", adminEvents);
console.log("Alumni Events Count:", postEvents?.length);
console.log(JSON.stringify(postEvents, null, 2));
console.log("Merged Events:", [...admin, ...alumni]);

  // Sort by created_at descending (latest first)
  const sortedEvents = [...admin, ...alumni].sort((a: any, b: any) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
  setEvents(sortedEvents);
};

useEffect(() => {
  fetchEvents();

  // Subscribe to admin events changes
  const adminChannel = supabase
    .channel('student_events_admin')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events' },
      () => {
        fetchEvents();
      }
    )
    .subscribe();

  // Subscribe to alumni posts changes
  const alumniChannel = supabase
    .channel('student_events_alumni')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts' },
      () => {
        fetchEvents();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(adminChannel);
    supabase.removeChannel(alumniChannel);
  };
}, []);

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">Upcoming Events</h1>
            <p className="text-slate-600 dark:text-slate-300">Join webinars, workshops, and networking events to connect with fellow alumni.</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900/70 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-yellow-400/20">
          <div className="relative flex-grow">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by title, location, or organizer..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-yellow-400/20 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 md:w-48">
            <select
              className="w-full p-2 border border-slate-300 dark:border-yellow-400/20 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Events</option>
              <option value="Networking">Networking</option>
              <option value="Workshop">Workshop</option>
              <option value="Webinar">Webinar</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event, index) => (
          <motion.div
  key={event.id}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
  className="bg-white dark:bg-slate-900/70 rounded-xl shadow-sm border border-slate-200 dark:border-yellow-400/20 overflow-hidden hover:shadow-md transition-shadow group"
>
  <div className="relative h-48 overflow-hidden">
    <img
      src={event.image}
      alt={event.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />

    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full text-xs font-semibold text-slate-900 dark:text-slate-100 shadow-sm backdrop-blur-sm">
      {event.type}
    </div>
  </div>

  <div className="p-6">
    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
      {event.title}
    </h3>

    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-6">
      <div className="flex items-center">
        <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500 mr-2" />
        <span>
          {event.date} at {event.time}
        </span>
      </div>

      <div className="flex items-center">
        <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500 mr-2" />
        <span>{event.location}</span>
      </div>

      <div className="flex items-center">
        <Users className="h-4 w-4 text-slate-400 dark:text-slate-500 mr-2" />
        <span>
          Organized by {event.organizer}
        </span>
      </div>
    </div>

     <button onClick={() => openPostLink(event.registrationLink)} className="w-full py-2 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 dark:hover:bg-yellow-400 dark:hover:text-slate-950 transition-colors flex items-center justify-center">
       Register Now
       <ArrowRight className="ml-2 h-4 w-4" />
     </button>
  </div>
</motion.div>
        ))}
        
        {filteredEvents.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-lg">No events found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}