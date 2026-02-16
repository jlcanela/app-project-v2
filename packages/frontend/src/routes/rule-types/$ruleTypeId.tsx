import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/rule-types/$ruleTypeId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/rule-types/$ruleTypeId"!</div>
}
