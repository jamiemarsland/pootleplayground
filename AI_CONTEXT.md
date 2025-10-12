# Pootle Playground - AI Context Documentation

## Overview

Pootle Playground is a visual blueprint builder for WordPress Playground. It provides a user-friendly interface for creating WordPress site configurations (blueprints) through a step-based system. Users can build sites by adding and configuring steps (install plugins, create pages, set options, etc.), then export or launch their configurations in WordPress Playground.

## Purpose

- **Simplify WordPress Playground blueprint creation**: Replace manual JSON editing with a visual interface
- **Enable rapid prototyping**: Quickly configure WordPress sites for testing, demos, or learning
- **Community sharing**: Save and share blueprints with other users via a gallery system
- **AI-powered generation**: Generate complete blueprints from natural language descriptions

## Architecture Overview

The application follows a three-panel layout with centralized state management in the root App component:

```
┌─────────────────────────────────────────────────────────┐
│                     Header                               │
│  (Actions: Export, Import, Save, Launch, AI Generate)   │
└─────────────────────────────────────────────────────────┘
┌──────────┬─────────────────────┬─────────────────────────┐
│          │                     │                         │
│ Sidebar  │   ConfigPanel       │      StepsList          │
│          │                     │                         │
│ (Add     │   (Configure        │   (View & Manage        │
│  Steps)  │    Selected Step)   │    Added Steps)         │
│          │                     │                         │
└──────────┴─────────────────────┴─────────────────────────┘
```

### Component Hierarchy

```
App (Root State Management)
├── Header (Global Actions)
├── Sidebar (Step Creation)
├── ConfigPanel (Step Configuration)
│   └── Form Components (One per step type)
├── StepsList (Step Management)
└── Modals (Overlays)
    ├── SaveBlueprintModal
    ├── AlertModal
    ├── ConfirmModal
    └── AiPromptSidebar
```

## UI Architecture

### 1. App Component (State Container)

The App component serves as the central state manager, holding:

- **steps**: Array of Step objects representing the blueprint configuration
- **selectedStep**: Currently selected step for editing
- **blueprintTitle**: Site title
- **landingPageType**: Where WordPress Playground should land (wp-admin, front-page, or custom URL)
- **UI state**: Modal visibility flags, gallery display state

**Key Responsibilities**:
- Maintains the single source of truth for all blueprint data
- Provides handlers for step CRUD operations
- Orchestrates data flow between components
- Manages modal states and user interactions
- Handles import/export of blueprint JSON files

### 2. Header Component

Navigation and action bar providing global operations:

- **Export**: Downloads blueprint as WordPress Playground JSON
- **Import**: Loads existing WordPress Playground blueprints
- **Save**: Opens modal to save blueprint to database (community gallery)
- **Launch**: Converts blueprint to WordPress Playground format and opens in new tab
- **Gallery**: Shows saved blueprints
- **AI Generate**: Opens sidebar for AI-powered blueprint creation
- **Reset**: Clears all steps and resets to blank state

**Data Flow**: Receives blueprint data and action callbacks from App, triggers state changes through callbacks.

### 3. Sidebar Component

Step creation interface organized into categories:

- **Content**: Add pages, posts, media
- **Structure**: Set homepage, posts page, navigation menus
- **Extensions**: Install plugins and themes
- **Launch View**: Configure landing page

**Interaction Pattern**: User clicks a step type button → App creates a new step with default data → App sets it as selectedStep → ConfigPanel displays the appropriate form.

### 4. ConfigPanel Component

Dynamic form renderer that displays the configuration form for the currently selected step:

- **Conditional Rendering**: Displays different form components based on selected step type
- **Form Components**: Each step type has a dedicated form (PostForm, PageForm, PluginForm, etc.)
- **Two-way Binding**: Forms receive data and onChange callback from ConfigPanel
- **Empty State**: Shows placeholder when no step is selected

**Form Component Pattern**:
```
Form Component receives:
├── data: Current step configuration
├── onChange: Callback to update step data
└── allSteps?: Reference to all steps (for relational fields)

Form Component provides:
└── Interactive inputs that call onChange with updated data
```

### 5. StepsList Component

Visual list of all configured steps:

- **Display**: Shows each step with a visual indicator and summary
- **Selection**: Clicking a step makes it active in ConfigPanel
- **Deletion**: Remove steps from the blueprint
- **Order**: Steps are executed in display order (top to bottom)

**Visual Feedback**: Selected step is highlighted, providing clear indication of what's being edited.

### 6. Modal System

#### SaveBlueprintModal
Captures metadata for saving blueprints to the database:
- Title and description
- Public/private visibility toggle
- Saves to Supabase with user identification

#### AiPromptSidebar
Full-height sidebar for AI blueprint generation:
- Text input for natural language descriptions
- Example prompts for guidance
- Calls Supabase Edge Function for generation
- Returns complete blueprint structure to App

#### AlertModal & ConfirmModal
Standard notification and confirmation dialogs for user feedback.

### 7. BlueprintGallery Component

Alternative view (replaces main builder UI) displaying saved blueprints:

- **Two Tabs**: "My Blueprints" and "Community" (public blueprints)
- **Template Gallery**: Pre-built starter blueprints
- **Actions**: Load blueprint, launch directly, upvote, delete
- **Admin Mode**: Authentication system for moderating community blueprints
- **Supabase Integration**: Fetches blueprints from database with RLS policies

## Data Model

### Step Structure

Every step follows this pattern:

```typescript
{
  id: string,           // Unique identifier (type-timestamp)
  type: StepType,       // One of the supported step types
  data: object          // Type-specific configuration
}
```

### Step Types

The application supports these step types:

- **Content Creation**: `addPost`, `addPage`, `addMedia`
- **Site Structure**: `setHomepage`, `setPostsPage`, `createNavigationMenu`
- **Extensions**: `installPlugin`, `installTheme`
- **Configuration**: `setSiteOption`, `defineWpConfigConst`
- **Import**: `importWxr`
- **Access Control**: `login`, `addClientRole`
- **Launch Config**: `setLandingPage`

### Blueprint Structure

The final WordPress Playground blueprint format:

```typescript
{
  landingPage: string,                    // URL to load on launch
  preferredVersions: {
    php: string,
    wp: string
  },
  phpExtensionBundles: string[],
  steps: BlueprintStep[]                  // Converted steps
}
```

## Key Workflows

### 1. Creating a Blueprint

```
User adds step from Sidebar
→ App creates step with defaults
→ Step appears in StepsList
→ Step auto-selected in ConfigPanel
→ User configures step via form
→ Form calls onChange
→ App updates step in state
→ Repeat for additional steps
```

### 2. Exporting a Blueprint

```
User clicks Export in Header
→ App calls generateBlueprint()
→ Conversion logic transforms Pootle steps to WordPress Playground format
→ JSON file downloaded to user's computer
```

### 3. Launching in WordPress Playground

```
User clicks Launch in Header
→ App calls generateBlueprint()
→ Blueprint JSON is base64 encoded
→ URL constructed: playground.wordpress.net/#[encoded-blueprint]
→ Opens in new browser tab
→ WordPress Playground loads and executes blueprint
```

### 4. AI Blueprint Generation

```
User opens AI sidebar
→ Enters natural language description
→ Submits to Supabase Edge Function
→ Edge Function calls OpenAI API
→ AI generates step array in Pootle format
→ Response validated and parsed
→ App replaces current steps with AI-generated steps
→ User can review and modify
```

### 5. Saving to Gallery

```
User clicks Save in Header
→ SaveBlueprintModal opens
→ User enters title, description, privacy setting
→ Blueprint saved to Supabase
→ User ID attached for ownership
→ Available in "My Blueprints" tab
→ If public, appears in "Community" tab
```

### 6. Loading from Gallery

```
User clicks Gallery in Header
→ BlueprintGallery component mounts
→ Fetches blueprints from Supabase
→ User selects a blueprint
→ Blueprint data passed to App
→ App replaces current state
→ Returns to builder view
```

## State Management Pattern

The application uses **lifted state** pattern with unidirectional data flow:

1. **All state lives in App component**
2. **Data flows down** via props to child components
3. **Actions flow up** via callback functions
4. **No component-local state** for blueprint data (only UI state like loading, errors)

This ensures a single source of truth and predictable state updates.

## Data Transformation Pipeline

### Pootle Format → WordPress Playground Format

The `blueprintGenerator.ts` utility handles conversion:

1. **Receives**: Pootle steps array (simplified, UI-friendly format)
2. **Transforms**: Each step type to WordPress Playground step format
3. **Handles**: Special cases (homepage setting, navigation menus, relational data)
4. **Outputs**: Valid WordPress Playground blueprint JSON

Key transformations:
- Plugin/theme steps: Converts between URL and wordpress.org resource types
- Page/post steps: Encodes content for proper UTF-8 handling
- Navigation menus: Generates wp-cli commands for menu creation
- Homepage/posts page: Resolves page references and sets WordPress options

### WordPress Playground Format → Pootle Format

The `nativeBlueprintConverter.ts` utility handles reverse conversion:

1. **Receives**: WordPress Playground blueprint JSON (from import)
2. **Parses**: Each blueprint step
3. **Converts**: Back to Pootle step format
4. **Outputs**: Pootle steps array for editing

This enables users to import existing WordPress Playground blueprints and edit them visually.

## Database Integration

### Supabase Schema

**blueprints table**:
- Stores saved blueprint configurations
- Contains: title, description, blueprint_data (JSON), user_id, is_public, votes, step_count
- Row Level Security (RLS): Users can only modify their own blueprints
- Admin authentication: Special password-based admin mode for moderation

**ai_blueprint_history table**:
- Stores history of AI-generated blueprints
- Tracks: prompts, generated blueprints, user IDs, timestamps
- Used for analytics and improvement of AI prompts

### User Identification

Uses localStorage-based user IDs:
- Generated on first visit
- Persists across sessions
- Enables "my blueprints" vs "community blueprints" separation
- No traditional authentication required (lightweight approach)

## AI Integration Architecture

### Supabase Edge Function: generate-blueprint

Deployed serverless function that:

1. **Receives**: User's natural language prompt
2. **Constructs**: Detailed system prompt with Pootle format specifications
3. **Calls**: OpenAI API (GPT-4o-mini) with structured instructions
4. **Validates**: AI response matches expected JSON structure
5. **Returns**: Complete blueprint data in Pootle format

### AI Prompt Engineering

The system prompt includes:
- Available step types and exact data structures
- Common WordPress plugin/theme slugs from wordpress.org
- Examples of well-structured blueprints
- Instructions to generate realistic, detailed content
- Guidelines for proper step ordering and dependencies

### Response Validation

Strict validation ensures AI output is usable:
- Verifies all steps have id, type, and data fields
- Checks for proper step type names
- Validates required fields per step type
- Falls back with clear error messages if validation fails

## Extension Points

The architecture supports easy extension:

1. **New Step Types**: Add to StepType union, create form component, add conversion logic
2. **New Form Inputs**: Create reusable form components, integrate in ConfigPanel
3. **New Actions**: Add buttons to Header, implement handlers in App
4. **New Views**: Create components that replace or overlay main builder
5. **Enhanced AI**: Modify edge function prompt for new capabilities

## Design Principles

1. **Separation of Concerns**: UI components don't contain business logic
2. **Single Responsibility**: Each component has one clear purpose
3. **Unidirectional Data Flow**: State changes flow predictably
4. **Progressive Disclosure**: Complex options revealed as needed
5. **Immediate Feedback**: Visual updates reflect state changes instantly
6. **Forgiving Interactions**: Invalid states prevented or handled gracefully

## Common Patterns

### Adding a New Step Type

1. Add type to `StepType` union in `types/blueprint.ts`
2. Create form component in `components/forms/`
3. Add case to ConfigPanel's switch statement
4. Add default data in `getDefaultStepData()` in App
5. Add conversion logic in `blueprintGenerator.ts`
6. Add button to appropriate category in Sidebar

### Handling Related Steps

Some steps reference other steps (e.g., "Set Homepage" references a page):
- Pass `allSteps` to form component
- Filter to relevant step types
- Display dropdown of available steps
- Store reference as `stepId` in data
- Resolve reference during conversion

### Managing Complex Step Data

For steps with nested or complex data:
- Keep form components focused on single step type
- Use controlled inputs with local state for form UX
- Call onChange only when user completes an action
- Validate inputs before calling onChange
- Provide clear error messages for invalid data

## Performance Considerations

- **No unnecessary re-renders**: Components only re-render when their props change
- **Efficient list rendering**: StepsList uses keys for React optimization
- **Lazy loading**: Gallery component only fetches data when visible
- **Debounced inputs**: Form inputs update state without lag
- **Minimal bundle**: Uses lightweight libraries (Lucide icons, no heavy frameworks)

## Summary

Pootle Playground is a state-driven React application with clear separation between UI and data. The App component orchestrates all interactions, child components focus on presentation, and utility functions handle complex transformations. This architecture makes the codebase maintainable, testable, and easy to extend with new features.
