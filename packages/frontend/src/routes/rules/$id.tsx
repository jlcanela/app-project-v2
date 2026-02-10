import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/rules/$id')({
  component: () => <Outlet />,
});
