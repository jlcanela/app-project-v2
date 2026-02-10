import { useState } from 'react';
import { IconDeviceFloppy, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Drawer,
  Group,
  JsonInput,
  ScrollArea,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export const Route = createFileRoute('/catalog/$type')({
  component: CatalogPage,
});

// Mock Data Types
type SchemaItem = {
  id: string;
  name: string;
  version: string;
  tags: string[];
  description: string;
  schema: Record<string, any>;
};

const MOCK_DATA: Record<string, SchemaItem[]> = {
  states: [
    {
      id: '1',
      name: 'CartState',
      version: '1.0.0',
      tags: ['core', 'checkout'],
      description: 'Represents the current shopping cart state.',
      schema: {
        type: 'object',
        properties: {
          items: { type: 'array' },
          total: { type: 'number' },
        },
      },
    },
    {
      id: '2',
      name: 'UserState',
      version: '1.1.0',
      tags: ['identity'],
      description: 'Authenticated user context.',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          tier: { type: 'string', enum: ['free', 'premium'] },
        },
      },
    },
  ],
  events: [
    {
      id: '3',
      name: 'ItemAdded',
      version: '1.0.0',
      tags: ['cart'],
      description: 'Triggered when an item is added to cart.',
      schema: {
        type: 'object',
        properties: {
          itemId: { type: 'string' },
          quantity: { type: 'number' },
        },
      },
    },
  ],
  entities: [
    {
      id: '4',
      name: 'Product',
      version: '2.0.0',
      tags: ['catalog'],
      description: 'Product entity definition.',
      schema: {
        type: 'object',
        properties: {
          sku: { type: 'string' },
          price: { type: 'number' },
        },
      },
    },
  ],
};

function CatalogPage() {
  const { type } = Route.useParams();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<SchemaItem | null>(null);

  // Normalize type to key of MOCK_DATA
  const dataKey = (type as string) in MOCK_DATA ? type : 'states';
  const items = MOCK_DATA[dataKey] || [];

  const handleEdit = (item: SchemaItem) => {
    setSelectedItem(item);
    open();
  };

  const handleCreate = () => {
    setSelectedItem({
      id: Math.random().toString(),
      name: 'New Schema',
      version: '0.0.1',
      tags: [],
      description: '',
      schema: { type: 'object', properties: {} },
    });
    open();
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2} tt="capitalize">
            {type} Catalog
          </Title>
          <Text c="dimmed">Manage domain definitions for {type}.</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
          Create New
        </Button>
      </Group>

      <Card withBorder radius="md" p="0">
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Version</Table.Th>
              <Table.Th>Tags</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th style={{ width: 100 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td fw={500}>{item.name}</Table.Td>
                <Table.Td>
                  <Badge variant="light" color="gray">
                    v{item.version}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {item.tags.map((tag) => (
                      <Badge key={tag} size="sm" variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                </Table.Td>
                <Table.Td>{item.description}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(item)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="xl"
        title={
          <Text fw={700} size="lg">
            {selectedItem?.name || 'New Schema'}
          </Text>
        }
        padding="md"
      >
        {selectedItem && <SchemaEditor item={selectedItem} />}
      </Drawer>
    </Container>
  );
}

function SchemaEditor({ item }: { item: SchemaItem }) {
  const [activeTab, setActiveTab] = useState<string | null>('visual');
  const [schemaJson, setSchemaJson] = useState(JSON.stringify(item.schema, null, 2));

  return (
    <Stack h="calc(100vh - 100px)">
      <Group grow>
        <TextInput label="Name" defaultValue={item.name} />
        <TextInput label="Version" defaultValue={item.version} />
      </Group>
      <TextInput label="Description" defaultValue={item.description} />

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        flex={1}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <Tabs.List>
          <Tabs.Tab value="visual">Visual Editor</Tabs.Tab>
          <Tabs.Tab value="json">JSON Schema</Tabs.Tab>
          <Tabs.Tab value="usage">Usage References</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="visual" flex={1} py="md">
          <ScrollArea h="100%">
            <VisualSchemaBuilder schema={item.schema} />
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="json" flex={1} py="md">
          <JsonInput
            value={schemaJson}
            onChange={setSchemaJson}
            formatOnBlur
            autosize
            minRows={20}
            label="Raw JSON Schema"
            description="Edit the underlying JSON schema directly."
            styles={{ input: { fontFamily: 'monospace' } }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="usage" flex={1} py="md">
          <Text c="dimmed" size="sm">
            Rules using this schema:
          </Text>
          <Stack gap="xs" mt="sm">
            <Card withBorder padding="sm">
              <Text fw={500} size="sm">
                DiscountCalculation
              </Text>
              <Text size="xs" c="dimmed">
                Rule Type: Pricing
              </Text>
            </Card>
            <Card withBorder padding="sm">
              <Text fw={500} size="sm">
                ShippingValidation
              </Text>
              <Text size="xs" c="dimmed">
                Rule Type: Logistics
              </Text>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Group justify="flex-end" mt="auto">
        <Button variant="default">Cancel</Button>
        <Button leftSection={<IconDeviceFloppy size={16} />}>Save Changes</Button>
      </Group>
    </Stack>
  );
}

function VisualSchemaBuilder({ schema }: { schema: any }) {
  const properties = schema?.properties || {};

  return (
    <Stack>
      <Text size="sm" fw={500}>
        Properties
      </Text>
      {Object.entries(properties).map(([key, value]: [string, any]) => (
        <Group key={key} align="center">
          <TextInput placeholder="Field Name" defaultValue={key} style={{ flex: 1 }} />
          <Select
            data={['string', 'number', 'boolean', 'array', 'object']}
            defaultValue={value.type}
            style={{ width: 120 }}
          />
          <ActionIcon color="red" variant="subtle">
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ))}
      <Button variant="outline" size="xs" leftSection={<IconPlus size={14} />} fullWidth>
        Add Property
      </Button>
    </Stack>
  );
}
