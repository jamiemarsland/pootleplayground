# WebMCP Use Case: Inspect, Refine, Reorder & Prune Blueprint Steps (Goal 2)

This document defines the isolated Stages 2–4 conversational design for **Goal 2** of the Pootle Playground Blueprint Builder: inspecting existing steps, resolving natural-language references, refining fields, reordering execution sequence, and safely pruning or resetting steps.

---

## 1. Scenario Definition

- **Product Context**: Pootle Playground — a client-side visual WordPress Playground Blueprint Builder (`/`).
- **Target User Goal**: Locate, inspect, edit, reorder, or remove steps in an existing blueprint while preserving WordPress Playground execution dependencies (such as `addPage` steps referenced by `setHomepage`, `setPostsPage`, or `createNavigationMenu`).
- **Starting State Matrix (Stage 2)**:
  - **State A — Multi-Step Draft**:
    - **Application State**: Route `/`, `steps = [1: addPage("Home"), 2: addPage("About"), 3: setHomepage(existing -> addPage("Home")), 4: installPlugin("woocommerce"), 5: createNavigationMenu("Main Menu" -> Home, About)]`, `selectedStep = steps[0]`.
    - **Agent Context**: Ongoing editing session; user refers to steps by title (*"the About page"*), plugin name (*"WooCommerce"*), or ordinal (*"the second page"*).
    - **System Constraints**: WordPress Playground executes steps sequentially. Deleting an `addPage` step breaks downstream `setHomepage`, `setPostsPage`, or `createNavigationMenu` references unless handled explicitly. Moving a dependent step before its referenced page breaks runtime lookup.
  - **State B — Empty Draft**:
    - **Application State**: Route `/`, `steps = []`, `selectedStep = null`.
    - **System Constraints**: Mutating/removing tools cannot act until at least one step exists (`enabled` or actionable error).

---

## 2. Role-Playing the Conversation (Stage 3)

### Turn 1: List & Resolve Coreference ("the second page")

- **User**: "Rename the second page to 'Our Story' and move WooCommerce to run first."
- **Agent Intent**: List steps first to map "the second page" (`addPage-2`, "About") and "WooCommerce" (`installPlugin-4`), then update the page and reorder the plugin step to position 1.
- **Agent Tool Invocations**:
  ```javascript
  list_blueprint_steps({ page: 1, page_size: 12 });
  ```
- **Tool Response (to Agent)**:
  ```json
  {
    "page": 1,
    "page_size": 12,
    "total_count": 5,
    "total_pages": 1,
    "steps": [
      { "index": 1, "id": "addPage-1", "type": "addPage", "summary": "Home", "dependents": ["setHomepage-3", "createNavigationMenu-5"] },
      { "index": 2, "id": "addPage-2", "type": "addPage", "summary": "About", "dependents": ["createNavigationMenu-5"] },
      { "index": 3, "id": "setHomepage-3", "type": "setHomepage", "summary": "Existing page: Home", "dependents": [] },
      { "index": 4, "id": "installPlugin-4", "type": "installPlugin", "summary": "woocommerce", "dependents": [] },
      { "index": 5, "id": "createNavigationMenu-5", "type": "createNavigationMenu", "summary": "Main Menu (2 items)", "dependents": [] }
    ]
  }
  ```
- **Site Implementation & UI Reaction**:
  - Read-only inspection; no UI mutation yet.
- **Agent Intent (Follow-up Tool Calls)**:
  ```javascript
  update_blueprint_step({ step_id: "addPage-2", updates: { postTitle: "Our Story" } });
  reorder_blueprint_steps({ step_id: "installPlugin-4", to_index: 1 });
  ```
- **Tool Response (to Agent)**:
  ```json
  { "status": "updated", "step_id": "addPage-2", "index": 2, "type": "addPage", "summary": "Our Story" }
  ```
  ```json
  { "status": "reordered", "step_id": "installPlugin-4", "from_index": 4, "to_index": 1, "warnings": [] }
  ```
- **Site Implementation & UI Reaction**:
  - Updates `addPage-2`'s `postTitle` to `"Our Story"` and moves `installPlugin-4` to index 1 in `StepsList`.
  - Focuses the updated step in `ConfigPanel`.
- **Agent Response**:
  "Done — I renamed the **About** page to **Our Story** and moved **Install Plugin (woocommerce)** to step 1 so it runs first."

---

### Turn 2: Inspect & Guard Destructive Removal with Downstream Dependencies

- **User**: "Remove the Home page."
- **Agent Intent**: Attempt to remove `addPage-1`, respecting the dependency guard and consequential confirmation boundary.
- **Agent Tool Invocations**:
  ```javascript
  remove_blueprint_steps({ step_ids: ["addPage-1"] });
  ```
- **Tool Response (to Agent)**:
  ```json
  {
    "isError": true,
    "content": [
      {
        "type": "text",
        "text": "Cannot remove step \"Home\" (addPage-1) because it is referenced by: setHomepage-3 (setHomepage), createNavigationMenu-5 (createNavigationMenu). Confirm with the user and retry with force: true, or update those dependent steps first."
      }
    ]
  }
  ```
- **Site Implementation & UI Reaction**:
  - No steps are removed; builder draft remains intact.
- **Agent Response**:
  "The **Home** page is currently referenced by **Set Homepage** (step 4) and **Main Menu** (step 5). Would you like me to remove **Home** anyway (which will leave those references pointing to a missing page), or should we remove or update those steps too?"

---

## 3. Discovered WebMCP Tool Specifications

| Tool Name | Parameters | Description ("What + When") | Annotations | Expected Site Reaction |
| :--- | :--- | :--- | :--- | :--- |
| `list_blueprint_steps` | `types?`, `query?`, `page?`, `page_size?` | Lists configured blueprint steps in execution order with step IDs, types, summaries, and dependency references. Use when inspecting the sequence or resolving references like "the second page" before editing, reordering, or removing steps. | `readOnlyHint: true`, `untrustedContentHint: true` | None (read-only query) |
| `get_blueprint_step` | `step_id?`, `step_index?`, `title?` | Reads full configuration details and downstream dependencies for a single blueprint step. Use when checking exact step fields or checking whether other steps depend on a page before modifying it. | `readOnlyHint: true`, `untrustedContentHint: true` | None (read-only query) |
| `update_blueprint_step` | `step_id?`, `step_index?`, `title?`, `updates` | Updates configuration fields on an existing blueprint step and selects it in the editor panel. Use when refining a step's title, content, plugin/theme source, menu items, or tour settings. | *(omitted)* | Updates step in `StepsList` and focuses it in `ConfigPanel` |
| `reorder_blueprint_steps` | `step_id?`, `from_index?`, `title?`, `to_index` | Moves an existing blueprint step to a new 1-based position in the execution sequence. Use when fixing setup order so pages or plugins run before dependent steps. | *(omitted)* | Reorders `StepsList` and reports any dependency-order warnings |
| `remove_blueprint_steps` | `step_ids?`, `step_indices?`, `reset_all?`, `force?` | Removes one or more steps from the blueprint, or resets the entire blueprint when reset_all is true. Use when pruning unwanted steps or clearing the draft after user confirmation. | `consequentialHint: true` | Removes target steps (or resets draft) and updates selection |

---

## 4. Variations & Graceful Failure (Stage 4)

1. **Ambiguous Step Title Match**:
   - *Trigger*: Two `addPage` steps both match `"Contact"` when calling `update_blueprint_step({ title: "Contact", updates: ... })`.
   - *Tool Behavior*: Throws an actionable `Error` listing matching step IDs and 1-based indices so the agent asks or specifies `step_id`.
2. **Out-of-Bounds Reorder Index**:
   - *Trigger*: `reorder_blueprint_steps({ from_index: 2, to_index: 99 })` on a 5-step blueprint.
   - *Tool Behavior*: Throws `Error("to_index 99 is out of range. Choose a 1-based position between 1 and 5.")`.
3. **Dependency-Breaking Reorder Warning**:
   - *Trigger*: Moving `setHomepage` (referencing `addPage("Home")`) to index 1 ahead of `addPage("Home")` at index 2.
   - *Tool Behavior*: Completes the reorder and returns a `warnings` array noting that `setHomepage` now appears before its referenced page `Home`, so the agent alerts the user and offers to fix it.
4. **Full Draft Reset Guard**:
   - *Trigger*: User says *"Clear everything and start over."*
   - *Security / UX Behavior*: `remove_blueprint_steps` declares `consequentialHint: true` so the browser/agent confirms before clearing the user's draft.
5. **Empty Blueprint State**:
   - *Trigger*: User asks to edit or reorder when `steps.length === 0`.
   - *Tool Behavior*: Mutating step-management tools (`get_blueprint_step`, `update_blueprint_step`, `reorder_blueprint_steps`, `remove_blueprint_steps`) are state-gated with `enabled: steps.length > 0`, while `list_blueprint_steps` stays available and reports `total_count: 0`.

---

## 5. Autonomous Self-Critique (Stage 3–4 Gate)

1. **Agent Demeanor & Tone**: Keeps edits crisp and transparent; proactively highlights dependency conflicts before destructive deletions or order breaks.
2. **Clarifying Questions**: Resolves unambiguous ordinals via `list_blueprint_steps` without bothering the user, but pauses to clarify ambiguous title matches or destructive actions affecting downstream steps.
3. **Autonomous Boundaries**: `list_blueprint_steps` and `get_blueprint_step` are strictly pure reads (`readOnlyHint: true`, `untrustedContentHint: true` without side-effect selection); routine `update_blueprint_step` and `reorder_blueprint_steps` omit annotations; destructive `remove_blueprint_steps` sets `consequentialHint: true` and refuses to silently break page dependencies unless `force: true`.
