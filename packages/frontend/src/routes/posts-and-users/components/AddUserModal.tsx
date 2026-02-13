import { useState } from 'react'
import { useAtom } from '@effect-atom/atom-react'
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core'
import { usersAtom } from './store'

interface AddUserModalProps {
  opened: boolean
  onClose: () => void
}

export function AddUserModal({ opened, onClose }: AddUserModalProps) {
  const [, setUsers] = useAtom(usersAtom)
  const [newUserName, setNewUserName] = useState('')

  const handleAddUser = () => {
    if (!newUserName.trim()) {
      return
    }
    const newUser = { id: Date.now(), name: newUserName }
    setUsers((prev) => [...prev, newUser])
    setNewUserName('')
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add User">
      <Stack>
        <TextInput
          label="Name"
          placeholder="Enter user name"
          value={newUserName}
          onChange={(e) => setNewUserName(e.currentTarget.value)}
          data-autofocus
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddUser}>Save</Button>
        </Group>
      </Stack>
    </Modal>
  )
}