# WebMCP Use Case: Compose & Configure a WordPress Playground Blueprint (Goal 1)

This document defines the isolated Stages 2–4 conversational design for **Goal 1** of the Pootle Playground Blueprint Builder: composing and configuring a complete WordPress Playground blueprint (site metadata, PHP/WordPress runtime versions, and ordered setup steps).

---

## 1. Scenario Definition

- **Product Context**: Pootle Playground — a client-side visual WordPress Playground Blueprint Builder (`/`).
- **Target User Goal**: Compose and configure a multi-step WordPress Playground blueprint with site title, PHP/WordPress versions, plugins/themes, pages/posts/media, homepage/posts page, navigation menu, landing view, and optional guided tour.
- **Starting State Matrix (Stage 2)**:
  - **State A — Blank Blueprint**:
    - **Application State**: Route `/`, `blueprintTitle = "My WordPress Site"`, `phpVersion = "8.2"`, `wpVersion = "latest"`, `landingPageType = "wp-admin"`, `steps = []`, `selectedStep = null`.
    - **Agent Context**: Fresh session in browser tab.
    - **System Constraints**: Supported PHP versions `7.4`–`8.3`; supported WordPress versions `latest`, `7.0`, `6.9`–`6.2`; `setHomepage` / `setPostsPage` / `createNavigationMenu` referencing existing pages must match an `addPage` step by title or ID; `installPlugin` / `installTheme` require a WordPress.org slug or an `http(s)` ZIP URL.
  - **State B — In-Progress Blueprint**:
    - **Application State**: Route `/`, `blueprintTitle = "Studio Demo"`, `steps = [addPage("About"), installPlugin("contact-form-7")]`, `selectedStep = steps[1]`.
    - **Agent Context**: Multi-turn thread adding a homepage and navigation menu referencing existing pages.
    - **System Constraints**: Appending new steps must preserve existing draft steps and resolve existing page titles without requiring opaque step IDs.

---

## 2. Role-Playing the Conversation (Stage 3)

### Turn 1: Inspect Draft & Configure Environment

- **User**: "Build me a bakery demo site on PHP 8.3 and WordPress 6.8 called Sweet Crumb Bakery, opening on the front page."
- **Agent Intent**: Inspect the current builder state first so existing draft work is respected, then update site metadata and runtime versions.
- **Agent Tool Invocations**:
  ```javascript
  get_blueprint_summary({ page: 1, page_size: 12 });
  configure_blueprint({
    site_title: "Sweet Crumb Bakery",
    php_version: "8.3",
    wp_version: "6.8",
    landing_page_type: "front-page",
  });
  ```
- **Tool Response (to Agent)**:
  ```json
  {
    "title": "My WordPress Site",
    "php_version": "8.2",
    "wp_version": "latest",
    "landing_page_type": "wp-admin",
    "page": 1,
    "page_size": 12,
    "total_count": 0,
    "total_pages": 1,
    "steps": []
  }
  ```
  ```json
  {
    "title": "Sweet Crumb Bakery",
    "php_version": "8.3",
    "wp_version": "6.8",
    "landing_page_type": "front-page"
  }
  ```
- **Site Implementation & UI Reaction**:
  - `blueprintTitle`, `phpVersion`, `wpVersion`, and `landingPageType` update in the Builder state.
  - The Sidebar site title input and Advanced version selectors reflect the new values immediately.
- **Agent Response**:
  "I've configured your blueprint as **Sweet Crumb Bakery** on PHP 8.3 and WordPress 6.8, opening on the front page. What plugins, themes, pages, or menus would you like to add?"

---

### Turn 2: Batch-Compose Pages, Plugin, Homepage & Menu

- **User**: "Install the Contact Form 7 plugin and Ollie theme, add Home, Menu, and Contact pages, make Home the static homepage, and wire all three into the primary navigation menu."
- **Agent Intent**: Map well-known WordPress.org slugs (`contact-form-7`, `ollie`) and batch all 7 setup steps in dependency order (`installTheme`, `installPlugin`, `addPage` ×3, `setHomepage`, `createNavigationMenu`) using natural page titles rather than internal step IDs.
- **Agent Tool Invocations**:
  ```javascript
  add_blueprint_steps({
    steps: [
      { type: "installTheme", config: { slug: "ollie", activate: true } },
      { type: "installPlugin", config: { slug: "contact-form-7", activate: true } },
      { type: "addPage", config: { postTitle: "Home", postContent: "<!-- wp:paragraph --><p>Welcome to Sweet Crumb Bakery.</p><!-- /wp:paragraph -->" } },
      { type: "addPage", config: { postTitle: "Menu", postContent: "<!-- wp:paragraph --><p>Fresh sourdough, croissants, and cakes daily.</p><!-- /wp:paragraph -->" } },
      { type: "addPage", config: { postTitle: "Contact", postContent: "<!-- wp:paragraph --><p>Visit us or send a message.</p><!-- /wp:paragraph -->" } },
      { type: "setHomepage", config: { option: "existing", pageTitle: "Home" } },
      {
        type: "createNavigationMenu",
        config: {
          menuName: "Main Menu",
          menuLocation: "primary",
          menuItems: [
            { type: "page", pageTitle: "Home" },
            { type: "page", pageTitle: "Menu" },
            { type: "page", pageTitle: "Contact" }
          ]
        }
      }
    ]
  });
  ```
- **Tool Response (to Agent)**:
  ```json
  {
    "added_count": 7,
    "total_steps": 7,
    "selected_step_index": 7,
    "added_steps": [
      { "index": 1, "id": "installTheme-1", "type": "installTheme", "summary": "ollie" },
      { "index": 2, "id": "installPlugin-2", "type": "installPlugin", "summary": "contact-form-7" },
      { "index": 3, "id": "addPage-3", "type": "addPage", "summary": "Home" },
      { "index": 4, "id": "addPage-4", "type": "addPage", "summary": "Menu" },
      { "index": 5, "id": "addPage-5", "type": "addPage", "summary": "Contact" },
      { "index": 6, "id": "setHomepage-6", "type": "setHomepage", "summary": "Existing page: Home" },
      { "index": 7, "id": "createNavigationMenu-7", "type": "createNavigationMenu", "summary": "Main Menu (3 items)" }
    ]
  }
  ```
- **Site Implementation & UI Reaction**:
  - Appends all 7 steps atomically, resolves `"Home"`, `"Menu"`, and `"Contact"` to their generated `addPage` step IDs, and selects step 7 in `StepsList` so `ConfigPanel` opens `NavigationMenuForm`.
- **Agent Response**:
  "Added all 7 steps in order: installed and activated **Ollie** and **Contact Form 7**, created **Home**, **Menu**, and **Contact** pages, set **Home** as the static homepage, and built **Main Menu** in the primary location."

---

### Turn 3: Add a Quick Start Guided Tour

- **User**: "Also add the beginner Quick Start walkthrough."
- **Agent Intent**: Append a `guidedTour` step configured with `tourMode: "quickstart"`.
- **Agent Tool Invocations**:
  ```javascript
  add_blueprint_steps({
    steps: [{ type: "guidedTour", config: { tourMode: "quickstart" } }]
  });
  ```
- **Tool Response (to Agent)**:
  ```json
  {
    "added_count": 1,
    "total_steps": 8,
    "selected_step_index": 8,
    "added_steps": [
      { "index": 8, "id": "guidedTour-8", "type": "guidedTour", "summary": "quickstart" }
    ]
  }
  ```
- **Site Implementation & UI Reaction**:
  - Appends the `guidedTour` step and focuses `GuidedTourForm` in `ConfigPanel`.
- **Agent Response**:
  "Added the **Quick Start** guided tour as step 8. Your blueprint now has 8 steps ready for review or launch."

---

## 3. Discovered WebMCP Tool Specifications

| Tool Name | Parameters | Description ("What + When") | Annotations | Expected Site Reaction |
| :--- | :--- | :--- | :--- | :--- |
| `get_blueprint_summary` | `page?`, `page_size?` | Reads the current blueprint settings, runtime versions, and a paginated summary of configured steps. Use before adding structural steps that reference existing pages or when checking what is currently in the builder. | `readOnlyHint: true`, `untrustedContentHint: true` | None (read-only query) |
| `configure_blueprint` | `site_title?`, `php_version?`, `wp_version?`, `landing_page_type?`, `custom_landing_url?` | Updates the blueprint site title, PHP version, WordPress version, or default landing view. Use when setting site metadata or runtime environment versions. | *(omitted)* | Updates Builder metadata inputs and generated blueprint settings |
| `add_blueprint_steps` | `steps: Array<{ type, config }>` | Appends one or more configured setup steps to the blueprint in order and selects the last added step. Use when building a site with pages, posts, media, plugins, themes, menus, homepage settings, or a guided tour. | *(omitted)* | Appends steps to `StepsList`, resolves page-title links, selects last step in `ConfigPanel` |

---

## 4. Variations & Graceful Failure (Stage 4)

1. **Missing Required Parameters (Ambiguous Custom Plugin)**:
   - *Trigger*: User says *"Install my private client invoicing plugin"* without a slug or ZIP URL.
   - *Expected Behavior*: Agent asks the user for the WordPress.org plugin slug or direct HTTPS ZIP download URL instead of fabricating a URL. If invoked without either, `add_blueprint_steps` throws an actionable `Error` specifying `"installPlugin requires either a WordPress.org slug or an https:// ZIP url."`
2. **Prerequisite Violation (Unknown Page Reference)**:
   - *Trigger*: Agent calls `add_blueprint_steps` with `{ type: "setHomepage", config: { option: "existing", pageTitle: "Pricing" } }` when no `addPage` titled `"Pricing"` exists.
   - *Tool Behavior*: Throws `Error('No addPage step titled "Pricing" was found. Available pages: Home, Menu, Contact. Add the page first or pass option: "create".')` so `useWebMCP` returns `isError: true`.
3. **Unsupported Runtime Version**:
   - *Trigger*: User asks for PHP 8.4 or WordPress 5.9 (unsupported in the builder).
   - *Tool Behavior*: Throws `Error('Unsupported php_version "8.4". Choose one of: 7.4, 8.0, 8.1, 8.2, 8.3.')`.
4. **Custom Landing Page Without Path**:
   - *Trigger*: `configure_blueprint({ landing_page_type: "custom" })` without `custom_landing_url`.
   - *Tool Behavior*: Throws `Error('custom_landing_url is required when landing_page_type is "custom" (for example "/wp-admin/edit.php" or "/about").')`.
5. **Untrusted Content Isolation**:
   - *Trigger*: An imported `blueprint.json` contains adversarial instructions inside a page title or site title.
   - *Security Behavior*: `get_blueprint_summary` declares `untrustedContentHint: true` and truncates summaries to stay within the 1,500-char payload budget.

---

## 5. Autonomous Self-Critique (Stage 3–4 Gate)

1. **Agent Demeanor & Tone**: Responses are concise, list the exact changes made (versions, step count, activated extensions), and prompt naturally for the next addition without overwhelming the user with raw JSON.
2. **Clarifying Questions**: When a plugin/theme source or custom landing path is missing or ambiguous, the agent asks rather than fabricating third-party URLs; unambiguous WordPress.org slugs (e.g. `contact-form-7`, `woocommerce`) are accepted cleanly.
3. **Autonomous Boundaries**: All Goal 1 tools strictly mutate local draft state (or read state) — none delete existing steps, wipe the draft, or publish to Supabase. `readOnlyHint: true` + `untrustedContentHint: true` are set on `get_blueprint_summary`; routine mutating tools omit annotations; no tool over-flags `consequentialHint`.
