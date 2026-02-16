// src/pages/rule-types/RuleTypePage.tsx

import { UseFormReturnType } from '@mantine/form';

export type RuleFieldType = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';

export type RuleField = {
  id: string;
  pathOrId: string;
  label: string;
  type: RuleFieldType;
  required: boolean;
  allowedValues: string[];
  description: string;
  primaryOutcome?: boolean;
};

export type Governance = {
  version: string;
  breakingChange: boolean;
  changeNotes: string;
  effectiveFrom: string | null;
  notifiedTeams: string[];
  communicationSummary: string;
};

export type RuleTypeFormValues = {
  ruleTypeId?: number;
  name: string;
  description: string;
  //callingSystems: string[];
  //inputContractDescription: string;
  //outputContractDescription: string;
  schemaInFields: RuleField[];
  schemaOutFields: RuleField[];
  //governance: Governance;
};

export type RuleTypeGovernanceSectionProps = {
  form: UseFormReturnType<RuleTypeFormValues>;
};
