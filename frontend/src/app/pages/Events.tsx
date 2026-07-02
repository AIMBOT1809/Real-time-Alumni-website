
import React, { useState } from 'react';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { useEffect } from "react";
import { supabase } from "../../supabaseClient";

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
  // Alumni approved events
  const { data: postEvents, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "approved")
    .eq("type", "event");

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

  const alumni = (postEvents || [])
  .filter((item: any) => item.post_details)
  .map((item: any) => {
    let details = item.post_details;

    try {
      if (typeof details === "string") {
        details = JSON.parse(details);
      }
    } catch {
      return null;
    }

    if (!details) return null;

    return {
      id: item.id,
      source: "post",
      title: details.eventTitle,
      date: details.eventDate,
      time: details.eventTime,
      location: details.eventLocation,
      image: item.image || item.file_url,
      organizer: item.author_name || "Alumni",
      type: details.eventType || "Event",
      created_at: item.created_at,
    };
  })
  .filter(Boolean);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Upcoming Events</h1>
            <p className="text-slate-600">Join webinars, workshops, and networking events to connect with fellow alumni.</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="relative flex-grow">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by title, location, or organizer..."
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
              <option value="all">All Events</option>
              <option value="Networking">Networking</option>
              <option value="Workshop">Workshop</option>
              <option value="Webinar">Webinar</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event, index) => (
          <motion.div
  key={event.id}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
>
  <div className="relative h-48 overflow-hidden">
    <img
      src={event.image}
      alt={event.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />

    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
      {event.type}
    </div>
  </div>

  <div className="p-6">
    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-yellow-600 transition-colors">
      {event.title}
    </h3>

    <div className="space-y-2 text-sm text-slate-600 mb-6">
      <div className="flex items-center">
        <Calendar className="h-4 w-4 text-slate-400 mr-2" />
        <span>
          {event.date} at {event.time}
        </span>
      </div>

      <div className="flex items-center">
        <MapPin className="h-4 w-4 text-slate-400 mr-2" />
        <span>{event.location}</span>
      </div>

      <div className="flex items-center">
        <Users className="h-4 w-4 text-slate-400 mr-2" />
        <span>
          Organized by {event.organizer}
        </span>
      </div>
    </div>

    <button className="w-full py-2 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 transition-colors flex items-center justify-center">
      Register Now
      <ArrowRight className="ml-2 h-4 w-4" />
    </button>
  </div>
</motion.div>
        ))}
        
        {filteredEvents.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-500 text-lg">No events found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
