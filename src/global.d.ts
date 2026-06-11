// Temporary module declarations to satisfy TypeScript in this workspace.
// These are lightweight shims and should be replaced with proper types
// or package installs if you want full type-safety.

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

