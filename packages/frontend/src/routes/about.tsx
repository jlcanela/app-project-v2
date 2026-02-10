import { Welcome } from '@/components/Welcome/Welcome'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: Welcome,
})
