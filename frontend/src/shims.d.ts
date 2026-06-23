// Lightweight shims for modules TypeScript can't find in this workspace.
// Replace with proper types or install `@types/*` packages for full safety.

declare module "react-dom/client" {
  export function createRoot(container: any): { render: (el: any) => void };
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}
