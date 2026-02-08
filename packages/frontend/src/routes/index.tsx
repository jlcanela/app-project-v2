import { HomePage } from '@/pages/Home.page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <HomePage/>
  )
}