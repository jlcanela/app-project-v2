import { Header } from '@/components/Header'
import { AppShell, NavLink, ScrollArea } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const RootLayout = () => {
  const [opened, { toggle }] = useDisclosure()

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Header opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          <NavLink label="Dashboard" component={Link} to="/" />

          <NavLink label="Domain Catalog" defaultOpened>
            <NavLink label="States" component={Link} to="/catalog/states" />
            <NavLink label="Events" component={Link} to="/catalog/events" />
            <NavLink label="Entities" component={Link} to="/catalog/entities" />
          </NavLink>

          <NavLink label="Rule Definitions" defaultOpened>
            <NavLink label="Rule Types" component={Link} to="/rules/types" />
            <NavLink label="Rule Instances" component={Link} to="/rules/instances" />
          </NavLink>

          <NavLink label="Governance">
            <NavLink label="Version History" component={Link} to="/governance/history" />
            <NavLink label="Access Control" component={Link} to="/governance/access" />
          </NavLink>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <TanStackRouterDevtools />
    </AppShell>
  )
}

export const Route = createRootRoute({ component: RootLayout })