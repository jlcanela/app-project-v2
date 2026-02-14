import { Atom, useAtom, useAtomSet } from '@effect-atom/atom-react'
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core'
import { createUserAtom } from './store'

interface AddUserModalProps {
  opened: boolean
  onClose: () => void
}

const newUserNameAtom = Atom.make('')

export function AddUserModal({ opened, onClose }: AddUserModalProps) {
  const createUser = useAtomSet(createUserAtom)
  const [newUserName, setNewUserName] = useAtom(newUserNameAtom)

  const handleAddUser = () => {
    if (!newUserName.trim()) {
      return
    }
    createUser(newUserName)
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