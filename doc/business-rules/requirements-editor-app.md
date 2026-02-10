# Requirements: Schema Editor & Business Rule Configuration App

## Overview
This document specifies the requirements for the "Authoring Tools" application. This application allows Business Analysts (BAs) to define the domain vocabulary (Data Schemas) and configure business rules by strictly defining their Input (IN) and Output (OUT) contracts before implementing logic.

## 1. Data Schema Editor (The Catalog)
**Objective:** Define the global, closed sets of States, Events, and Entities.

### Functional Requirements
- **Schema Definition:**
  - Create and edit schemas for **States** (e.g., `Cart`), **Events** (e.g., `ItemAdded`), and **Entities** (e.g., `Product`).
  - Support primitive types, nested objects, arrays, and discriminated unions.
  - **Effect Schema Integration:** All types must map to `Effect Schema` definitions to ensure runtime validation and TypeScript compatibility.
- **Versioning:**
  - Semantic versioning for schemas (e.g., `v1.0.0`).
  - Breaking change detection (e.g., removing a field used by active rules).
- **Registry:**
  - A searchable catalog of all available schemas to be used as building blocks for rules.

## 2. Rule Configuration (IN/OUT Definition)
**Objective:** Define the "Type" or "Contract" of a rule. This acts as the interface definition.

### IN Schema Configuration
- **Requirement:** The user must define the `RuleInput` structure.
- **Features:**
  - **Composition:** Build the IN schema by selecting existing schemas from the Catalog (e.g., `Input = { cart: CartState, product: ProductEntity }`).
  - **Constraints:** Add field-level constraints (regex, min/max) specific to the rule context.

### OUT Schema Configuration (Capability Definition)
- **Requirement:** The user must define the `RuleOutput` structure, which includes the pure result and allowed side-effects.
- **Features:**
  - **Result Type:** Define the shape of the pure calculation result (e.g., `DiscountValue`).
  - **Capability Selection (The "Actions"):**
    - The user must explicitly select which side-effects are allowed for this rule type.
    - *Example:* "This rule can `UpdateState(Cart)` and `TriggerEvent(DiscountApplied)`, but cannot `UpdateEntity(User)`."
  - **Schema Generation:** The system automatically generates the `RuleOutputSchema` as a discriminated union of the Result and the selected Actions (as described in `bsB.md`).

## 3. Rule Logic Editor (GoRules JDM Integration)
**Objective:** Implement the transformation from IN to OUT using the GoRules Decision Graph editor.

### Functional Requirements
- **Component Integration:**
  - Embed the **GoRules JDM (JSON Decision Model) React component**.
  - Configure the editor to load and save decision graphs compatible with the project's execution engine.
- **Strict Typing & Constraints:**
  - **Schema Injection:** Inject the IN Schema into the editor to enable autocomplete for input fields.
  - **Output Validation:** Ensure that the "Output" nodes in the graph correspond to the structure defined in the OUT Schema.
  - **Action Restrictions:** Validate that the decision graph only produces outputs (Results or Actions) permitted by the OUT Schema.
- **Authoring Metaphors (Supported by GoRules):**
  - **Decision Tables:** For tabular logic.
  - **Decision Graphs:** Visual flow with Switch nodes, Expression nodes, and Input/Output nodes.
  - **Expression Language:** Use the underlying expression language (Zen) for conditions and calculations.

## 4. Validation & Simulation
**Objective:** Verify correctness before deployment.

### Functional Requirements
- **Static Analysis:**
  - Validate that the logic covers all possible input combinations (completeness).
  - Validate that all outputs conform to the OUT schema.
- **Simulator:**
  - **Input Generation:** Auto-generate a form based on the IN schema.
  - **Execution:** Run the rule logic (using the shared interpreter) and display the Result and Actions.
  - **Action Audit:** Visually distinguish between "State Updates" and "Events" in the output.

## 5. Governance & Lifecycle
**Objective:** Manage the evolution of rules and schemas.

### Functional Requirements
- **Role-Based Access:**
  - *Senior BA:* Can define Schemas and Rule Types (IN/OUT contracts).
  - *Junior BA:* Can implement Rule Logic for existing Rule Types.
- **Dependency Tracking:**
  - Visualize which rules depend on which Schemas (e.g., "If I change `CartState`, which rules break?").