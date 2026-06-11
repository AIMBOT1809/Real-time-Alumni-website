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

