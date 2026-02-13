import { Link } from '@tanstack/react-router';
import {
  Burger,
  Button,
  ButtonProps,
  Group,
  PolymorphicComponentProps,
  Title,
} from '@mantine/core';
import { ColorSchemeToggle } from './ColorSchemeToggle/ColorSchemeToggle';

type HeaderLinkProps = PolymorphicComponentProps<typeof Link, ButtonProps>;

function HeaderLink(props: HeaderLinkProps) {
  return (
    <Button
      component={Link}
      variant="subtle"
      activeProps={{
        style: {
          backgroundColor: 'var(--mantine-primary-color-light)',
          color: 'var(--mantine-primary-color-light-color)',
        },
      }}
      {...props}
    />
  );
}

interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function Header({ opened, toggle }: HeaderProps) {
  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Title order={3}>Rule Studio</Title>
        <HeaderLink to="/">Home</HeaderLink>
         <HeaderLink to="/posts-and-users">Posts & Users</HeaderLink>
        <HeaderLink to="/about">About</HeaderLink>
      </Group>
      <Group>
        <ColorSchemeToggle />
        <Button>Login</Button>
      </Group>
    </Group>
  );
}
