import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { DashboardLayout } from "./components/DashboardLayout";
import { Home } from "./pages/Home";
import { AlumniNetwork } from "./pages/AlumniNetwork";
import { Opportunities } from "./pages/Opportunities";
import { Events } from "./pages/Events";
import { Community } from "./pages/Community";
import { Dashboard } from "./pages/Dashboard";
import { MainDashboard } from "./pages/MainDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminUserProfile } from "./pages/AdminUserProfile";
import { PostApproval } from "./pages/PostApproval";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Chat } from "./pages/Chat";
import { Notifications } from "./pages/Notifications";
import ResetPassword from "./pages/ResetPassword";
import { MentorshipSessions } from "./pages/MentorshipSessions";
import { Jobs } from "./pages/Jobs";
import { Internships } from "./pages/Internships";
import { Referrals } from "./pages/Referrals";
import { BusinessStartups } from "./pages/BusinessStartups";
import { PostsDiscovery } from "./pages/PostsDiscovery";
import { ActivityHistory } from "./pages/ActivityHistory";
import { MyContributions } from "./pages/MyContributions";
import { HigherEducation } from "./pages/HigherEducation";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "opportunities", Component: Opportunities },
      { path: "community", Component: Community },
      { path: "admin", Component: AdminDashboard },
      { path: "admin/user/:email", Component: AdminUserProfile },
      { path: "admin/post-approval", Component: PostApproval },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "chat", Component: Chat },
      { path: "notifications", Component: Notifications },
      { path: "reset-password", Component : ResetPassword},
    ],
  },
  {
    Component: DashboardLayout,
    children: [
      { path: "dashboard", Component: MainDashboard },
      { path: "dashboard/activity", Component: ActivityHistory },
      { path: "dashboard/contributions", Component: MyContributions },
      { path: "dashboard/:section", Component: MainDashboard },
      { path: "network", Component: AlumniNetwork },
      { path: "mentorship", Component: MentorshipSessions },
      { path: "jobs", Component: Jobs },
      { path: "referrals", Component: Referrals },
      { path: "internships", Component: Internships },
      { path: "higher-education", Component: HigherEducation },
      { path: "business-startups", Component: BusinessStartups },
      { path: "events", Component: Events },
    ],
  },
]);
