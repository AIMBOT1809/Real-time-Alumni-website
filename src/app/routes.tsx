import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { AlumniNetwork } from "./pages/AlumniNetwork";
import { Opportunities } from "./pages/Opportunities";
import { Events } from "./pages/Events";
import { Community } from "./pages/Community";
import { Dashboard } from "./pages/Dashboard";
import { MainDashboard } from "./pages/MainDashboard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Chat } from "./pages/Chat";
import { Notifications } from "./pages/Notifications";
import ResetPassword from "./pages/ResetPassword";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "network", Component: AlumniNetwork },
      { path: "opportunities", Component: Opportunities },
      { path: "events", Component: Events },
      { path: "community", Component: Community },
      { path: "dashboard", Component: MainDashboard },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "chat", Component: Chat },
      { path: "notifications", Component: Notifications },
      { path: "reset-password", Component : ResetPassword},
    ],
  },
]);