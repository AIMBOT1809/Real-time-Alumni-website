import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Bell from 'lucide-react/dist/esm/icons/bell';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Circle from 'lucide-react/dist/esm/icons/circle';

export function NotificationsPanel() {
  const {
    user,
    notifications,
    unreadNotificationCount,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.post_id) {
      navigate('/dashboard');
      return;
    }

    await markNotificationRead(notification.id);
    const commentParam = notification.comment_id ? `&comment=${encodeURIComponent(notification.comment_id)}` : '';
    navigate(`/dashboard?openComment=${encodeURIComponent(notification.post_id)}${commentParam}`);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Notifications</h1>
          <p className="text-slate-600">Please log in to view your notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-200">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
              <p className="text-sm text-slate-500">
                {unreadNotificationCount > 0
                  ? `${unreadNotificationCount} unread notification${unreadNotificationCount > 1 ? 's' : ''}`
                  : 'No unread notifications'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="self-start rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            Mark all as read
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            <p>No notifications yet. When someone comments on your post, you will see it here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div
                key={notification.id}
                role="button"
                tabIndex={0}
                onClick={() => handleNotificationClick(notification)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleNotificationClick(notification);
                  }
                }}
                className={`w-full cursor-pointer text-left rounded-3xl border p-5 shadow-sm transition ${
                  notification.is_read ? 'border-slate-200 bg-white' : 'border-yellow-300/40 bg-slate-900/80'
                } hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{new Date(notification.created_at).toLocaleString()}</p>
                    <p className="mt-2 text-base text-slate-900">{notification.message}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm font-medium text-slate-500">
                      {notification.is_read ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-yellow-500" />
                      )}
                      {notification.is_read ? 'Read' : 'Unread'}
                    </span>
                    {!notification.is_read && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          markNotificationRead(notification.id);
                        }}
                        className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-slate-950 transition hover:bg-yellow-300"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
