import { createFileRoute } from '@tanstack/react-router'

import { Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useAtom } from '@effect-atom/atom-react'
import { selectedRuleTypeIdAtom } from './(components)/atoms'
import { RuleTypesSidebar } from './(components)/RuleTypesSidebar'
// import { RuleTypeDetail } from './(components)/RuleTypeDetail'
// import { AddPostModal } from './(components)/AddPostModal'
// import { AddRuleTypeModal } from './(components)/AddRuleTypeModal'
// import { PostsMain } from './(components)/PostsMain'
// import { RuleTypesSidebar } from './(components)/RuleTypesSidebar'
// import { useAtom } from '@effect-atom/atom-react'
// import { selectedRuleTypeIdAtom } from './(components)/store'

export const Route = createFileRoute('/rules/types/')({
  component: RouteComponent,
})

// {
//     "businessDecision": "Demo Rule",
//     "description": "A demo of rules",
//     "callingSystems": [],
//     "inputContractDescription": "",
//     "outputContractDescription": "",
//     "schemaInFields": [
//         {
//             "id": "in-b3xw26ze4am",
//             "pathOrId": "a",
//             "label": "a",
//             "type": "string",
//             "required": true,
//             "allowedValues": [],
//             "description": "a",
//             "primaryOutcome": false
//         }
//     ],
//     "schemaOutFields": [
//         {
//             "id": "out-jcar25c9fmo",
//             "pathOrId": "b",
//             "label": "b",
//             "type": "string",
//             "required": false,
//             "allowedValues": [],
//             "description": "b",
//             "primaryOutcome": false
//         }
//     ],
//     "governance": {
//         "version": "",
//         "breakingChange": false,
//         "changeNotes": "",
//         "effectiveFrom": null,
//         "notifiedTeams": [],
//         "communicationSummary": ""
//     }
// }
function RouteComponent() {
  const [selectedRuleTypeId, setSelectedRuleTypeId] = useAtom(selectedRuleTypeIdAtom)

  // Modals
  //  const [openedRuleTypeModal, { open: openRuleTypeModal, close: closeRuleTypeModal }] =
  //  useDisclosure(false)
  // const [openedPostModal, { open: openPostModal, close: closePostModal }] =
  //  useDisclosure(false)
  const [,{ open: openRuleTypeModal }] =
    useDisclosure(false)

  return (
    <Box style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
        <RuleTypesSidebar
          selectedRuleTypeId={selectedRuleTypeId}
          setSelectedRuleTypeId={setSelectedRuleTypeId}
          onAddRuleType={openRuleTypeModal}
        />
     
      {/* <AddRuleTypeModal opened={openedRuleTypeModal} onClose={closeRuleTypeModal} />
      <RuleTypesSidebar
        selectedRuleTypeId={selectedRuleTypeId}
        setSelectedRuleTypeId={setSelectedRuleTypeId}
        onAddRuleType={openRuleTypeModal}
      />
      <PostsMain selectedRuleTypeId={selectedRuleTypeId} onCreatePost={openPostModal} />
        <AddPostModal
          opened={openedPostModal}
          onClose={closePostModal}
          defaultAuthorId={selectedRuleTypeId}
        /> */}
    </Box>
  )
}
