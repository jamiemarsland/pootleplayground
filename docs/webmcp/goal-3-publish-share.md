# WebMCP Use Case: Preview, Export, Save to Gallery, or Publish a Shared Link (Goal 3)

This document defines the isolated Stages 2–4 conversational design for **Goal 3** of the Pootle Playground Blueprint Builder: inspecting generated `blueprint.json`, downloading it locally, launching WordPress Playground, and handing off consequential Supabase persistence flows (saving to the Gallery or creating a public `/p/:slug` short link) to the user via pre-filled confirmation dialogs.

---

## 1. Scenario Definition

- **Product Context**: Pootle Playground — a client-side visual WordPress Playground Blueprint Builder (`/`).
- **Target User Goal**: Verify the generated native WordPress Playground blueprint JSON, export or launch it, or prepare a pre-filled Gallery save / shared Playground link dialog for explicit human confirmation.
- **Starting State Matrix (Stage 2)**:
  - **State A — Ready Blueprint**:
    - **Application State**: Route `/`, `blueprintTitle = "Sweet Crumb Bakery"`, `steps.length = 5`, modals closed (`showSaveModal = false`, `showShareModal = false`).
    - **Agent Context**: User has finished composing steps and wants to inspect, export, launch, save, or share.
    - **System Constraints**: Saving to the Gallery inserts into Supabase `blueprints` (defaulting to public visibility); creating a short link inserts into Supabase `shared_playgrounds` and exposes a public `/p/:slug` redirect. Neither database mutation may execute autonomously without user confirmation.
  - **State B — Empty Blueprint**:
    - **Application State**: Route `/`, `steps = []`.
    - **System Constraints**: Export, launch, save, and share tools require at least one configured step and are state-gated (`enabled: steps.length > 0`).

---

## 2. Role-Playing the Conversation (Stage 3)

### Turn 1: Preview Paginated Generated JSON

- **User**: "Let me inspect the generated blueprint JSON before we share it."
- **Agent Intent**: Read the first chunk of the generated blueprint JSON using offset/limit pagination so large payloads stay within the 1,500-character output budget.
- **Agent Tool Invocations**:
  ```javascript
  preview_blueprint_json({ offset: 0, limit: 1000 });
  ```
- **Tool Response (to Agent)**:
  ```json
  {
    "total_chars": 1640,
    "offset": 0,
    "limit": 1000,
    "next_offset": 1000,
    "truncated": true,
    "step_count": 5,
    "landing_page": "/",
    "json_slice": "{\n  \"landingPage\": \"/\",\n  \"preferredVersions\": {\n    \"php\": \"8.3\",\n    \"wp\": \"6.8\"\n  }..."
  }
  ```
- **Site Implementation & UI Reaction**:
  - Read-only inspection; no UI mutation.
- **Agent Response**:
  "Your generated blueprint is 1,640 characters across 5 steps, targeting PHP 8.3 and WordPress 6.8 with landing page `/`. Would you like me to read the remaining 640 characters, download `blueprint.json`, launch it, or prepare it to save or share?"

---

### Turn 2: Human-in-the-Loop Hand-off to Save Blueprint Modal

- **User**: "Save it privately to my collection as 'Sweet Crumb Bakery Demo' with description 'Ollie theme + Contact Form 7 bakery starter'."
- **Agent Intent**: Never write directly to Supabase; invoke `initiate_save_blueprint` to open `SaveBlueprintModal` pre-filled with the requested title, description, and `is_public: false`, handing final submission to the user.
- **Agent Tool Invocations**:
  ```javascript
  initiate_save_blueprint({
    title: "Sweet Crumb Bakery Demo",
    description: "Ollie theme + Contact Form 7 bakery starter",
    is_public: false,
  });
  ```
- **Tool Response (to Agent)**:
  ```json
  {
    "status": "requires_user_action",
    "modal": "save_blueprint",
    "prefilled": {
      "title": "Sweet Crumb Bakery Demo",
      "description": "Ollie theme + Contact Form 7 bakery starter",
      "is_public": false
    },
    "message": "Save Blueprint dialog is open. Ask the user to review visibility and click Save Blueprint."
  }
  ```
- **Site Implementation & UI Reaction**:
  - Sets pre-fill draft values and opens `SaveBlueprintModal` with `Share Publicly` switched off.
- **Agent Response**:
  "I've opened the **Save Blueprint** dialog pre-filled with title **Sweet Crumb Bakery Demo**, your description, and **Share Publicly** turned off. Please review the details and click **Save Blueprint** to confirm."

---

### Turn 3: Human-in-the-Loop Hand-off to Share Playground Modal

- **User**: "Now also open the share link dialog so I can create a short link."
- **Agent Intent**: Hand off to `SharePlaygroundModal` via `initiate_share_playground` (closing the save modal if open) so the user reviews the generated Playground URL and clicks **Create short link**.
- **Agent Tool Invocations**:
  ```javascript
  initiate_share_playground({
    title: "Sweet Crumb Bakery Demo",
    description: "Ollie theme + Contact Form 7 bakery starter",
  });
  ```
- **Tool Response (to Agent)**:
  ```json
  {
    "status": "requires_user_action",
    "modal": "share_playground",
    "prefilled": {
      "title": "Sweet Crumb Bakery Demo",
      "description": "Ollie theme + Contact Form 7 bakery starter"
    },
    "message": "Share Playground dialog is open with your current blueprint URL. Ask the user to click Create short link."
  }
  ```
- **Site Implementation & UI Reaction**:
  - Opens `SharePlaygroundModal` pre-populated with the encoded `playground.wordpress.net/#...` URL, title, and description.
- **Agent Response**:
  "The **Share Playground** dialog is now open with your blueprint URL and details pre-filled. Click **Create short link** whenever you're ready to publish it."

---

## 3. Discovered WebMCP Tool Specifications

| Tool Name | Parameters | Description ("What + When") | Annotations | Expected Site Reaction |
| :--- | :--- | :--- | :--- | :--- |
| `preview_blueprint_json` | `offset?`, `limit?` | Returns a paginated slice of the generated WordPress Playground blueprint JSON along with total step count and byte length. Use when inspecting or validating the generated JSON before exporting, launching, or sharing. | `readOnlyHint: true`, `untrustedContentHint: true` | None (read-only query) |
| `export_blueprint_json` | *(none)* | Triggers a browser download of the current blueprint as a formatted JSON file. Use when the user asks to download or export their blueprint.json locally. | *(omitted)* | Downloads `<site-title>-blueprint.json` |
| `launch_playground` | *(none)* | Opens the generated blueprint in WordPress Playground in a new browser tab. Use when the user asks to launch, test, or run their configured blueprint live. | `consequentialHint: true` | Opens `playground.wordpress.net/#...` in a new tab |
| `initiate_save_blueprint` | `title?`, `description?`, `is_public?` | Opens the Save Blueprint dialog pre-filled with optional title, description, and visibility so the user can review and confirm saving to the gallery. Use when the user wants to save or publish their blueprint. | *(omitted)* | Opens pre-filled `SaveBlueprintModal` (human-in-the-loop) |
| `initiate_share_playground` | `title?`, `description?` | Opens the Share Playground dialog pre-filled with the current blueprint URL and optional title or description so the user can review and create a short link. Use when the user wants a shareable Playground link. | *(omitted)* | Opens pre-filled `SharePlaygroundModal` (human-in-the-loop) |

---

## 4. Variations & Graceful Failure (Stage 4)

1. **Empty Blueprint Prerequisite**:
   - *Trigger*: User asks to save, share, export, or launch before adding any steps.
   - *Behavior*: `export_blueprint_json`, `launch_playground`, `initiate_save_blueprint`, and `initiate_share_playground` are state-gated (`enabled: steps.length > 0`) and also throw an actionable `Error("Add at least one step to the blueprint before ...")` if invoked while empty.
2. **Large Blueprint JSON Pagination**:
   - *Trigger*: Blueprint includes a Guided Tour or multiple HTML pages totaling > 10 KB.
   - *Behavior*: `preview_blueprint_json` never silently drops content — it returns `truncated: true`, `total_chars`, and `next_offset` so the agent can fetch subsequent slices cleanly.
3. **Popup Blocker on Launch**:
   - *Trigger*: `window.open(...)` returns `null` when launching WordPress Playground.
   - *Behavior*: Throws an actionable `Error` instructing the agent to tell the user to allow popups or click the header **Launch** button directly.
4. **Public Visibility Caution**:
   - *Trigger*: User says *"Save this blueprint"* without specifying public vs. private.
   - *Behavior*: `initiate_save_blueprint` opens `SaveBlueprintModal` (human-in-the-loop) and does NOT commit to Supabase; the agent explicitly reminds the user to verify the **Share Publicly** toggle before clicking **Save Blueprint**.

---

## 5. Autonomous Self-Critique (Stage 3–4 Gate)

1. **Agent Demeanor & Tone**: Clearly communicates what was pre-filled and hands control to the user for every persistent database action rather than claiming the blueprint is already saved/published.
2. **Clarifying Questions**: If the user doesn't specify visibility (`is_public`) or a description, the dialog hand-off lets them verify/fill those fields interactively without blocking on unnecessary extra turns.
3. **Autonomous Boundaries**: Zero autonomous Supabase writes. `initiate_save_blueprint` and `initiate_share_playground` use the `initiate_*` naming convention and omit both `readOnlyHint` and `consequentialHint` (the UI hand-off is the boundary). `launch_playground` sets `consequentialHint: true` before opening an external Playground tab; `preview_blueprint_json` sets `readOnlyHint: true` and `untrustedContentHint: true`.
