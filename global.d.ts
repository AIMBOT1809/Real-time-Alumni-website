// Root-level shims for missing declaration files (temporary)

declare module 'react-router' {
  export const Link: any;
  export const NavLink: any;
  export const Outlet: any;
  export const useNavigate: any;
  export const useLocation: any;
  export const RouterProvider: any;
  const _default: any;
  export default _default;
}

declare module 'react-router/dom' {
  const anything: any;
  export = anything;
}

declare module 'react-router/*' {
  const anything: any;
  export = anything;
}

declare module 'lucide-react' {
  export const Home: any;
  export const FileText: any;
  export const Settings: any;
  export const ShieldCheck: any;
  export const Users: any;
  export const Briefcase: any;
  export const BarChart3: any;
  export const Plus: any;
  export const Search: any;
  export const LogOut: any;
  export const GraduationCap: any;
  export const Eye: any;
  export const EyeOff: any;
  export const Menu: any;
  export const X: any;
  export const User: any;
  export const Bell: any;
  const _default: any;
  export default _default;
}
