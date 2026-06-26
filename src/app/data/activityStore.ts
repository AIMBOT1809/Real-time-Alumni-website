export type ActivityKind =
  | 'appliedJobs'
  | 'joinedMentorshipSessions'
  | 'requestedReferrals'
  | 'savedPosts';

export interface ActivityItem {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  status?: string;
  category?: string;
}

export type ActivityState = Record<ActivityKind, ActivityItem[]>;

const emptyActivity = (): ActivityState => ({
  appliedJobs: [],
  joinedMentorshipSessions: [],
  requestedReferrals: [],
  savedPosts: [],
});

const keyFor = (userId: string) => `alumni_activity_${userId}`;

export function getActivity(userId?: string | null): ActivityState {
  if (!userId || typeof window === 'undefined') return emptyActivity();
  try {
    const parsed = JSON.parse(localStorage.getItem(keyFor(userId)) || '{}');
    return { ...emptyActivity(), ...parsed };
  } catch {
    return emptyActivity();
  }
}

export function addActivityItem(userId: string | undefined, kind: ActivityKind, item: ActivityItem) {
  if (!userId || typeof window === 'undefined') return;
  const activity = getActivity(userId);
  activity[kind] = [item, ...activity[kind].filter((existing) => existing.id !== item.id)];
  localStorage.setItem(keyFor(userId), JSON.stringify(activity));
  window.dispatchEvent(new CustomEvent('alumni-activity-updated', { detail: { userId, kind } }));
}

export function removeActivityItem(userId: string | undefined, kind: ActivityKind, itemId: string) {
  if (!userId || typeof window === 'undefined') return;
  const activity = getActivity(userId);
  activity[kind] = activity[kind].filter((item) => item.id !== itemId);
  localStorage.setItem(keyFor(userId), JSON.stringify(activity));
  window.dispatchEvent(new CustomEvent('alumni-activity-updated', { detail: { userId, kind } }));
}
