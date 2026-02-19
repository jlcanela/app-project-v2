import { RuleDetail, RuleDetailProps } from './RuleDetail';
import { readFileSync } from 'node:fs';

export default {
  title: 'Rules/RuleDetail',
  tags: ['autodocs'],
};

const rule = {
  "contentType": "application/vnd.gorules.decision",
  "nodes": [
    {
      "type": "inputNode",
      "content": {
        "schema": ""
      },
      "id": "ed608995-ff7e-436a-bfb8-4f7770a89c8e",
      "name": "request",
      "position": {
        "x": 100,
        "y": 235
      }
    },
    {
      "type": "decisionTableNode",
      "content": {
        "hitPolicy": "collect",
        "rules": [
          {
            "_id": "7a909dd2-f3bd-4e2b-9876-d8b14e47669f",
            "0a16aac4-8457-4a28-8321-df1e0e3f514a": "> 10000",
            "21245083-929b-457b-9a6f-aa67eb39a258": "",
            "6c49e318-8b72-41ed-b09b-e26cd0bed307": "\"BUDGET_LIMIT_EXCEEDED\"",
            "15754a42-68d8-44bb-9fe3-ee3aaf344934": "project.budget",
            "ca07ee55-e75d-4a3d-b922-8a0cf78165b8": "10000"
          },
          {
            "_id": "b8869395-2a30-4140-b4a2-154138224c9b",
            "0a16aac4-8457-4a28-8321-df1e0e3f514a": "(project.budget - project.cost) / project.budget < 0.10",
            "21245083-929b-457b-9a6f-aa67eb39a258": "",
            "6c49e318-8b72-41ed-b09b-e26cd0bed307": "\"MARGIN_TO_LOW\"",
            "15754a42-68d8-44bb-9fe3-ee3aaf344934": "(project.budget - project.cost) / project.budget",
            "ca07ee55-e75d-4a3d-b922-8a0cf78165b8": "0.10"
          },
          {
            "_id": "5f90afcc-94d7-4474-9d53-f496157eb718",
            "0a16aac4-8457-4a28-8321-df1e0e3f514a": "",
            "21245083-929b-457b-9a6f-aa67eb39a258": "> 9000",
            "6c49e318-8b72-41ed-b09b-e26cd0bed307": "\"COST_LIMIT_EXCEEDED\"",
            "15754a42-68d8-44bb-9fe3-ee3aaf344934": "project.cost",
            "ca07ee55-e75d-4a3d-b922-8a0cf78165b8": "9000"
          }
        ],
        "inputs": [
          {
            "id": "0a16aac4-8457-4a28-8321-df1e0e3f514a",
            "name": "Input",
            "field": "project.budget"
          },
          {
            "id": "21245083-929b-457b-9a6f-aa67eb39a258",
            "name": "New field",
            "field": "project.cost"
          }
        ],
        "outputs": [
          {
            "id": "6c49e318-8b72-41ed-b09b-e26cd0bed307",
            "name": "Output",
            "field": "issue.code"
          },
          {
            "id": "15754a42-68d8-44bb-9fe3-ee3aaf344934",
            "name": "Output",
            "field": "issue.value"
          },
          {
            "id": "ca07ee55-e75d-4a3d-b922-8a0cf78165b8",
            "name": "Output",
            "field": "issue.parameter"
          }
        ],
        "passThrough": false,
        "inputField": null,
        "outputPath": null,
        "executionMode": "single"
      },
      "id": "35f9b9f1-7cce-43cd-bec6-401bffef91b4",
      "name": "check_constraints",
      "position": {
        "x": 380,
        "y": 235
      }
    },
    {
      "type": "outputNode",
      "content": {
        "schema": ""
      },
      "id": "e7b506c5-4f65-42f5-8b1f-19f2f5ae1683",
      "name": "response",
      "position": {
        "x": 675,
        "y": 235
      }
    }
  ],
  "edges": [
    {
      "id": "6b592875-22f7-4d45-9fc6-b3d332d496b2",
      "sourceId": "ed608995-ff7e-436a-bfb8-4f7770a89c8e",
      "targetId": "35f9b9f1-7cce-43cd-bec6-401bffef91b4",
      "type": "edge"
    },
    {
      "id": "89888d7c-8954-432c-be6f-d00dfa031ccd",
      "sourceId": "35f9b9f1-7cce-43cd-bec6-401bffef91b4",
      "targetId": "e7b506c5-4f65-42f5-8b1f-19f2f5ae1683",
      "type": "edge"
    }
  ]
}

const baseProps: RuleDetailProps = {
  rule: {
    ruleId: 1,
    content: JSON.stringify(rule)
  }
};

export const Default = () => <RuleDetail {...baseProps} />;
