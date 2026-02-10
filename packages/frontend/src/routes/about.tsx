import { createFileRoute } from '@tanstack/react-router';
import { Welcome } from '@/components/Welcome/Welcome';

export const Route = createFileRoute('/about')({
  component: Welcome,
});
