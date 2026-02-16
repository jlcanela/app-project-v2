import { createFileRoute } from '@tanstack/react-router'

import { Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Result, useAtom, useAtomSet, useAtomValue } from '@effect-atom/atom-react'
import { selectedRuleTypeAtom, selectedRuleTypeIdAtom } from './(components)/atoms'
import { RuleTypesSidebar } from './(components)/RuleTypesSidebar'
import { RuleTypeDetail } from './(components)/RuleTypeDetail'
import { useEffect } from 'react'
// import { AddPostModal } from './(components)/AddPostModal'
// import { AddRuleTypeModal } from './(components)/AddRuleTypeModal'
// import { PostsMain } from './(components)/PostsMain'
// import { RuleTypesSidebar } from './(components)/RuleTypesSidebar'
// import { useAtom } from '@effect-atom/atom-react'
// import { selectedRuleTypeIdAtom } from './(components)/store'

export const Route = createFileRoute('/rules/types/$ruleTypeId')({
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
  const { ruleTypeId } = Route.useParams()
  const ruleTypeIdNumber = Number(ruleTypeId) 

  const ruleType = useAtomValue(selectedRuleTypeAtom)

    if (Number.isNaN(ruleTypeIdNumber)) {
    // oops
  }
  const setCurrentRuleTypeId = useAtomSet(selectedRuleTypeIdAtom)

  useEffect(() => {
    setCurrentRuleTypeId(ruleTypeIdNumber)
  }, [ruleTypeId, setCurrentRuleTypeId])

  
  // Modals
  const [openedRuleTypeModal, { open: openRuleTypeModal, close: closeRuleTypeModal }] =
    useDisclosure(false)
  const [openedPostModal, { open: openPostModal, close: closePostModal }] =
    useDisclosure(false)
    
    return (
      <Box style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <RuleTypesSidebar
        selectedRuleTypeId={selectedRuleTypeId}
        setSelectedRuleTypeId={setSelectedRuleTypeId}
        onAddRuleType={openRuleTypeModal}
      />
      <RuleTypeDetail />
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
