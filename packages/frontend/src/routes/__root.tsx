import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AppShell, NavLink, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Header } from '@/components/Header';

const RootLayout = () => {
  const [opened, { toggle }] = useDisclosure();

  const showMenu = false;

  return (
    <AppShell header={{ height: 60 }} padding="xl">
      <AppShell.Header>
        <Header opened={opened} toggle={toggle} />
      </AppShell.Header>

      {showMenu && (
        <AppShell.Navbar p="md">
          <AppShell.Section grow component={ScrollArea}>
            <NavLink label="Dashboard" component={Link} to="/" />
            <NavLink label="Rule Definitions" defaultOpened>
              <NavLink label="Rule Types" component={Link} to="/rules/types" />
            </NavLink>
          </AppShell.Section>
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <TanStackRouterDevtools />
    </AppShell>
  );
};

export const Route = createRootRoute({ component: RootLayout });
