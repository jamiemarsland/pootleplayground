# Pootle Playground Blueprint Generation Context

**Version:** 1.0
**Last Updated:** October 12, 2025

## Overview

This document contains comprehensive knowledge about the Pootle Playground blueprint system, which generates WordPress site configurations that are converted to WordPress Playground format. The AI must generate steps in the Pootle format with `id`, `type`, and `data` fields. The frontend handles conversion to WordPress Playground's native format.

---

## Complete Step Type Reference

### 1. installPlugin

Installs and optionally activates WordPress plugins from wordpress.org or custom URLs.

**From WordPress.org:**
```json
{
  "id": "installPlugin-1234567890",
  "type": "installPlugin",
  "data": {
    "pluginZipFile": {
      "resource": "wordpress.org/plugins",
      "wordpress.org/plugins": "contact-form-7"
    },
    "options": { "activate": true }
  }
}
```

**From Custom URL:**
```json
{
  "id": "installPlugin-1234567891",
  "type": "installPlugin",
  "data": {
    "pluginZipFile": {
      "resource": "url",
      "url": "https://example.com/my-plugin.zip"
    },
    "options": { "activate": true }
  }
}
```

**Popular WordPress.org Plugin Slugs:**
- `contact-form-7` - Contact forms
- `wordpress-seo` - Yoast SEO for optimization
- `classic-editor` - Restore classic editor
- `akismet` - Spam protection
- `jetpack` - Feature suite by Automattic
- `elementor` - Page builder
- `woocommerce` - E-commerce platform
- `wpforms-lite` - Form builder
- `all-in-one-seo-pack` - SEO tools
- `google-analytics-for-wordpress` - Analytics
- `wordfence` - Security plugin
- `duplicate-post` - Clone posts/pages
- `regenerate-thumbnails` - Image handling
- `redirection` - URL redirects
- `wp-super-cache` - Caching solution

### 2. installTheme

Installs and optionally activates WordPress themes from wordpress.org or custom URLs.

**From WordPress.org:**
```json
{
  "id": "installTheme-1234567890",
  "type": "installTheme",
  "data": {
    "themeZipFile": {
      "resource": "wordpress.org/themes",
      "wordpress.org/themes": "twentytwentyfour"
    },
    "options": { "activate": true }
  }
}
```

**From Custom URL:**
```json
{
  "id": "installTheme-1234567891",
  "type": "installTheme",
  "data": {
    "themeZipFile": {
      "resource": "url",
      "url": "https://example.com/my-theme.zip"
    },
    "options": { "activate": true }
  }
}
```

**Popular WordPress.org Theme Slugs:**
- `twentytwentyfour` - Latest default theme (2024)
- `twentytwentythree` - Default theme (2023)
- `twentytwentytwo` - Block-based theme (2022)
- `hello-elementor` - Minimalist for Elementor
- `astra` - Popular multipurpose theme
- `generatepress` - Lightweight and fast
- `oceanwp` - Multi-purpose theme
- `kadence` - Modern block theme
- `blocksy` - Fast block theme
- `neve` - Versatile and speedy

### 3. addPost

Creates blog posts with full content, metadata, and optional featured images.

```json
{
  "id": "addPost-1234567890",
  "type": "addPost",
  "data": {
    "postTitle": "Understanding Modern JavaScript",
    "postContent": "<!-- wp:paragraph -->\n<p>JavaScript has evolved significantly over the years. ES6 introduced many powerful features that have transformed how we write code. Let's explore arrow functions, destructuring, and async/await patterns that make modern JavaScript development more efficient and readable.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Arrow Functions</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>Arrow functions provide a concise syntax for writing function expressions. They also lexically bind the 'this' value, which solves many common pitfalls in JavaScript programming. Here's how they work and when to use them effectively.</p>\n<!-- /wp:paragraph -->",
    "postType": "post",
    "postStatus": "publish",
    "postDate": "now",
    "featuredImageUrl": "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg"
  }
}
```

**Field Details:**
- `postTitle`: The post title (required)
- `postContent`: Full HTML/Gutenberg block content (required, should be substantial - 100+ words)
- `postType`: Always "post" for blog posts
- `postStatus`: "publish" (live), "draft", "pending", "private"
- `postDate`: "now" for current time, or ISO date string
- `featuredImageUrl`: URL to featured image (optional but recommended)

**Content Best Practices:**
- Use Gutenberg block format for rich content (<!-- wp:paragraph --> tags)
- Include headings, paragraphs, lists for structure
- Write realistic, detailed content (minimum 100 words, preferably 200-400)
- Use relevant stock photos from Pexels for featured images
- Consider the user's industry/topic when writing content

### 4. addPage

Creates WordPress pages with full control over hierarchy, templates, and URLs.

```json
{
  "id": "addPage-1234567890",
  "type": "addPage",
  "data": {
    "postTitle": "About Us",
    "postContent": "<!-- wp:paragraph -->\n<p>Welcome to our company. We've been serving customers since 2010 with dedication and expertise. Our team of professionals is committed to delivering exceptional results and building lasting relationships.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Our Mission</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>We strive to provide innovative solutions that empower our clients to achieve their goals. Through collaboration, creativity, and cutting-edge technology, we transform challenges into opportunities.</p>\n<!-- /wp:paragraph -->",
    "postStatus": "publish",
    "postName": "about-us",
    "postParent": "",
    "template": "",
    "menuOrder": ""
  }
}
```

**Field Details:**
- `postTitle`: Page title (required)
- `postContent`: Full HTML/Gutenberg content (required, should be substantial)
- `postStatus`: "publish", "draft", "pending", "private"
- `postName`: URL slug (e.g., "about-us" → /about-us/)
- `postParent`: Parent page slug for hierarchy (optional)
- `template`: Page template filename (optional, e.g., "page-templates/full-width.php")
- `menuOrder`: Numeric order for sorting pages (optional)

**Hierarchy Example:**
```json
// Parent page
{
  "id": "addPage-1",
  "type": "addPage",
  "data": {
    "postTitle": "Services",
    "postName": "services",
    "postContent": "Our service offerings...",
    "postStatus": "publish",
    "postParent": "",
    "template": "",
    "menuOrder": ""
  }
}

// Child page
{
  "id": "addPage-2",
  "type": "addPage",
  "data": {
    "postTitle": "Web Development",
    "postName": "web-development",
    "postContent": "Our web development services...",
    "postStatus": "publish",
    "postParent": "services",
    "template": "",
    "menuOrder": ""
  }
}
```

### 5. addMedia

Imports images and files into the WordPress media library.

```json
{
  "id": "addMedia-1234567890",
  "type": "addMedia",
  "data": {
    "mediaUrl": "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg",
    "fileName": "hero-image.jpg",
    "altText": "Modern office workspace with laptop"
  }
}
```

**Field Details:**
- `mediaUrl`: Direct URL to the image/file (required)
- `fileName`: Desired filename in media library (required)
- `altText`: Accessibility description (required for images)

**Recommended Stock Photo Sources:**
- Pexels: `https://images.pexels.com/photos/{id}/{filename}.jpeg`
- Unsplash: `https://images.unsplash.com/photo-{id}`

### 6. setSiteOption

Configures WordPress site settings and options.

```json
{
  "id": "setSiteOption-1234567890",
  "type": "setSiteOption",
  "data": {
    "option": "blogname",
    "value": "Tech Insights Blog"
  }
}
```

**Common WordPress Options:**

**Basic Site Settings:**
- `blogname`: Site title
- `blogdescription`: Site tagline/description
- `admin_email`: Administrator email address
- `timezone_string`: Timezone (e.g., "America/New_York")
- `date_format`: Date display format
- `time_format`: Time display format

**Permalink Settings:**
- `permalink_structure`: URL structure (e.g., `/%postname%/`, `/%year%/%monthnum%/%postname%/`)

**Reading Settings:**
- `posts_per_page`: Number of posts per page (numeric)
- `posts_per_rss`: Number of posts in RSS feed
- `show_on_front`: "posts" or "page"
- `page_on_front`: Homepage page ID
- `page_for_posts`: Blog page ID

**Discussion Settings:**
- `default_comment_status`: "open" or "closed"
- `default_ping_status`: "open" or "closed"
- `require_name_email`: 1 or 0
- `comment_moderation`: 1 (manual approval) or 0
- `comment_registration`: 1 (require login) or 0

**Media Settings:**
- `thumbnail_size_w`: Thumbnail width
- `thumbnail_size_h`: Thumbnail height
- `medium_size_w`: Medium image width
- `medium_size_h`: Medium image height
- `large_size_w`: Large image width
- `large_size_h`: Large image height

### 7. defineWpConfigConst

Defines PHP constants in wp-config.php for advanced configuration.

```json
{
  "id": "defineWpConfigConst-1234567890",
  "type": "defineWpConfigConst",
  "data": {
    "constant": "WP_DEBUG",
    "value": true
  }
}
```

**Common wp-config.php Constants:**

**Debugging:**
- `WP_DEBUG`: Enable debug mode (true/false)
- `WP_DEBUG_LOG`: Log errors to debug.log (true/false)
- `WP_DEBUG_DISPLAY`: Display errors on screen (true/false)
- `SCRIPT_DEBUG`: Use unminified JS/CSS (true/false)

**Performance:**
- `WP_CACHE`: Enable caching (true/false)
- `COMPRESS_CSS`: Compress CSS (true/false)
- `COMPRESS_SCRIPTS`: Compress JavaScript (true/false)
- `CONCATENATE_SCRIPTS`: Combine scripts (true/false)

**Security:**
- `DISALLOW_FILE_EDIT`: Disable file editor (true/false)
- `DISALLOW_FILE_MODS`: Disable all file modifications (true/false)
- `FORCE_SSL_ADMIN`: Force SSL in admin (true/false)

**Content:**
- `WP_POST_REVISIONS`: Number of post revisions (numeric or false)
- `AUTOSAVE_INTERVAL`: Autosave frequency in seconds
- `EMPTY_TRASH_DAYS`: Days before trash deletion (numeric)

**Memory:**
- `WP_MEMORY_LIMIT`: PHP memory limit (e.g., "256M")
- `WP_MAX_MEMORY_LIMIT`: Admin memory limit (e.g., "512M")

### 8. login

Authenticates a user and creates a session.

```json
{
  "id": "login-1234567890",
  "type": "login",
  "data": {
    "username": "admin",
    "password": "password"
  }
}
```

**Field Details:**
- `username`: WordPress username (typically "admin" for demos)
- `password`: User password (typically "password" for demos)

**Note:** This step is primarily used for demo/playground scenarios. Always use default credentials for public blueprints.

### 9. importWxr

Imports content from WordPress export (WXR) files.

```json
{
  "id": "importWxr-1234567890",
  "type": "importWxr",
  "data": {
    "wxrUrl": "https://example.com/content-export.xml"
  }
}
```

**Field Details:**
- `wxrUrl`: Direct URL to WXR (WordPress eXtended RSS) export file

**Use Cases:**
- Importing sample content packages
- Migrating existing site content
- Loading pre-configured post/page structures
- Bulk importing taxonomies and media

### 10. addClientRole

Creates custom user roles with specific capabilities.

```json
{
  "id": "addClientRole-1234567890",
  "type": "addClientRole",
  "data": {
    "roleName": "content_manager",
    "displayName": "Content Manager",
    "capabilities": {
      "read": true,
      "edit_posts": true,
      "publish_posts": true,
      "delete_posts": true,
      "edit_pages": true,
      "publish_pages": true,
      "delete_pages": true,
      "upload_files": true,
      "manage_categories": true
    }
  }
}
```

**Field Details:**
- `roleName`: Internal role identifier (lowercase, underscores)
- `displayName`: Human-readable role name
- `capabilities`: Object mapping capabilities to true/false

**Common WordPress Capabilities:**

**Posts:**
- `edit_posts`, `publish_posts`, `delete_posts`
- `edit_published_posts`, `delete_published_posts`
- `edit_others_posts`, `delete_others_posts`
- `edit_private_posts`, `delete_private_posts`

**Pages:**
- `edit_pages`, `publish_pages`, `delete_pages`
- `edit_published_pages`, `delete_published_pages`
- `edit_others_pages`, `delete_others_pages`

**Media:**
- `upload_files`, `unfiltered_upload`

**Admin:**
- `manage_categories`, `manage_links`
- `manage_options` (site settings)
- `edit_users`, `delete_users`, `create_users`
- `edit_theme_options`, `install_plugins`, `activate_plugins`

### 11. setHomepage

Configures the site homepage by creating a new page or using an existing one.

**Create New Homepage:**
```json
{
  "id": "setHomepage-1234567890",
  "type": "setHomepage",
  "data": {
    "option": "create",
    "title": "Welcome Home",
    "content": "<!-- wp:paragraph -->\n<p>Welcome to our website! We're excited to have you here. Discover our services, learn about our team, and explore what makes us unique in our industry.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>What We Offer</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>From innovative solutions to personalized support, we're here to help you succeed. Browse our site to learn more about how we can assist with your needs.</p>\n<!-- /wp:paragraph -->"
  }
}
```

**Use Existing Page:**
```json
{
  "id": "setHomepage-1234567891",
  "type": "setHomepage",
  "data": {
    "option": "existing",
    "pageSlug": "home"
  }
}
```

**Field Details:**
- `option`: "create" (new page) or "existing" (use existing page)
- `title`: Page title (required if creating)
- `content`: Full page content (required if creating)
- `pageSlug`: Slug of existing page (required if using existing)

### 12. setPostsPage

Configures which page displays blog posts.

**Create New Posts Page:**
```json
{
  "id": "setPostsPage-1234567890",
  "type": "setPostsPage",
  "data": {
    "option": "create",
    "title": "Blog"
  }
}
```

**Use Existing Page:**
```json
{
  "id": "setPostsPage-1234567891",
  "type": "setPostsPage",
  "data": {
    "option": "existing",
    "pageSlug": "blog"
  }
}
```

**Field Details:**
- `option`: "create" or "existing"
- `title`: Page title (required if creating)
- `pageSlug`: Slug of existing page (required if using existing)

**Note:** This is typically used when `show_on_front` is set to "page" (static homepage).

### 13. createNavigationMenu

Creates navigation menus with pages, custom links, and assigns to theme locations.

```json
{
  "id": "createNavigationMenu-1234567890",
  "type": "createNavigationMenu",
  "data": {
    "menuName": "Main Navigation",
    "menuLocation": "primary",
    "menuItems": [
      {
        "type": "custom",
        "title": "Home",
        "url": "/"
      },
      {
        "type": "page",
        "pageSlug": "about"
      },
      {
        "type": "page",
        "pageSlug": "services"
      },
      {
        "type": "custom",
        "title": "Blog",
        "url": "/blog/"
      },
      {
        "type": "page",
        "pageSlug": "contact"
      }
    ]
  }
}
```

**Field Details:**
- `menuName`: Display name for the menu
- `menuLocation`: Theme location identifier (e.g., "primary", "footer", "social")
- `menuItems`: Array of menu item objects

**Menu Item Types:**

**Page Link:**
```json
{
  "type": "page",
  "pageSlug": "about"
}
```

**Custom Link:**
```json
{
  "type": "custom",
  "title": "Home",
  "url": "/"
}
```

**Common Menu Locations:**
- `primary`: Main navigation header
- `secondary`: Secondary/utility menu
- `footer`: Footer navigation
- `social`: Social media links
- `mobile`: Mobile-specific menu

### 14. setLandingPage

Configures which page users see when visiting the playground instance.

```json
{
  "id": "setLandingPage-1234567890",
  "type": "setLandingPage",
  "data": {
    "landingPageType": "front-page"
  }
}
```

**Landing Page Types:**
- `wp-admin`: WordPress admin dashboard
- `front-page`: Site homepage/front page
- `custom`: Custom URL path

**Custom URL Example:**
```json
{
  "id": "setLandingPage-1234567891",
  "type": "setLandingPage",
  "data": {
    "landingPageType": "custom",
    "customUrl": "/blog/"
  }
}
```

---

## Blueprint Structure

Every generated blueprint must follow this exact JSON structure:

```json
{
  "blueprintTitle": "Descriptive Site Name",
  "landingPageType": "front-page",
  "customLandingUrl": "",
  "steps": [
    {
      "id": "stepType-timestamp",
      "type": "stepType",
      "data": { }
    }
  ],
  "explanation": "Brief explanation of what this blueprint creates"
}
```

**Root Fields:**
- `blueprintTitle`: Short, descriptive name for the blueprint
- `landingPageType`: "wp-admin", "front-page", or "custom"
- `customLandingUrl`: URL path if landingPageType is "custom", otherwise ""
- `steps`: Array of step objects in execution order
- `explanation`: 1-2 sentence summary of the blueprint

**Step Object Fields:**
- `id`: Unique identifier in format "{stepType}-{timestamp}"
- `type`: Step type name (e.g., "addPost", "installPlugin")
- `data`: Step-specific data object

---

## Best Practices

### ID Generation

Always use unique timestamps for IDs:
- Format: `{stepType}-{timestamp}`
- Example: `installPlugin-1728389234567`
- Ensure each step has a unique ID
- Use incrementing timestamps or actual millisecond timestamps

### Content Quality

**Write Realistic, Detailed Content:**
- Minimum 100 words per post/page (prefer 200-400 words)
- Use proper paragraphs, headings, and structure
- Include relevant industry terminology
- Write as if for a real business/organization
- Add personality and specificity

**Use Gutenberg Block Format:**
```html
<!-- wp:paragraph -->
<p>Your paragraph content here.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Your Heading</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul>
<li>List item one</li>
<li>List item two</li>
</ul>
<!-- /wp:list -->
```

### Plugin and Theme Selection

**Always Use Real WordPress.org Slugs:**
- Research actual plugin/theme slugs from wordpress.org
- Don't invent plugin names or slugs
- Match the plugin to the user's actual need
- Consider popularity and compatibility

**Popular Combinations:**
- Blog: `classic-editor`, `wordpress-seo`, `akismet`
- Portfolio: `elementor`, `contact-form-7`, `envira-gallery`
- Business: `wpforms-lite`, `wordpress-seo`, `google-analytics-for-wordpress`
- E-commerce: `woocommerce`, `stripe`, `mailchimp-for-woocommerce`

### Site Configuration Order

**Recommended Step Sequence:**

1. **Site Identity** (first!)
   - Set blogname
   - Set blogdescription
   - Set admin_email if needed

2. **Theme & Plugins**
   - Install and activate theme
   - Install and activate plugins

3. **Content Creation**
   - Create pages (About, Services, Contact, etc.)
   - Create blog posts
   - Add media assets

4. **Homepage Configuration**
   - Create or set homepage
   - Set posts page if using static homepage
   - Configure show_on_front option

5. **Navigation**
   - Create navigation menus
   - Assign to theme locations

6. **Final Settings**
   - Set permalink structure
   - Configure comment settings
   - Set posts per page
   - Define wp-config constants if needed

### Navigation Menus

**Menu Best Practices:**
- Use "custom" type for Home link (url: "/")
- Use "page" type for existing pages
- Order items logically (Home first, Contact last)
- Keep main menu to 5-7 items maximum
- Use descriptive titles for custom links

**Example Menu Structure:**
```json
{
  "menuName": "Main Menu",
  "menuLocation": "primary",
  "menuItems": [
    { "type": "custom", "title": "Home", "url": "/" },
    { "type": "page", "pageSlug": "about" },
    { "type": "page", "pageSlug": "services" },
    { "type": "custom", "title": "Blog", "url": "/blog/" },
    { "type": "page", "pageSlug": "contact" }
  ]
}
```

### Featured Images

**Always Include Featured Images for Posts:**
- Use Pexels stock photos: `https://images.pexels.com/photos/{id}/{filename}.jpeg`
- Choose relevant, high-quality images
- Consider the post topic when selecting images
- Professional photography preferred over illustrations

**Good Image Topics:**
- Technology: computers, code, modern offices
- Business: handshakes, meetings, professionals
- Lifestyle: people, activities, environments
- Nature: landscapes, plants, animals

---

## Complete Site Examples

### Example 1: Simple Tech Blog

**User Prompt:** "Create a simple tech blog about web development"

**Generated Blueprint:**
```json
{
  "blueprintTitle": "Modern Web Dev Blog",
  "landingPageType": "front-page",
  "customLandingUrl": "",
  "steps": [
    {
      "id": "setSiteOption-1",
      "type": "setSiteOption",
      "data": {
        "option": "blogname",
        "value": "Modern Web Dev"
      }
    },
    {
      "id": "setSiteOption-2",
      "type": "setSiteOption",
      "data": {
        "option": "blogdescription",
        "value": "Insights on modern web development practices"
      }
    },
    {
      "id": "setSiteOption-3",
      "type": "setSiteOption",
      "data": {
        "option": "permalink_structure",
        "value": "/%postname%/"
      }
    },
    {
      "id": "installTheme-1",
      "type": "installTheme",
      "data": {
        "themeZipFile": {
          "resource": "wordpress.org/themes",
          "wordpress.org/themes": "twentytwentyfour"
        },
        "options": { "activate": true }
      }
    },
    {
      "id": "installPlugin-1",
      "type": "installPlugin",
      "data": {
        "pluginZipFile": {
          "resource": "wordpress.org/plugins",
          "wordpress.org/plugins": "wordpress-seo"
        },
        "options": { "activate": true }
      }
    },
    {
      "id": "addPost-1",
      "type": "addPost",
      "data": {
        "postTitle": "Getting Started with React Hooks",
        "postContent": "<!-- wp:paragraph -->\n<p>React Hooks revolutionized how we write React components by allowing us to use state and lifecycle features in functional components. This guide will walk you through the most essential hooks and how to use them effectively in your projects.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Understanding useState</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>The useState hook is the foundation of state management in functional components. It returns a pair: the current state value and a function to update it. This simple API makes it incredibly easy to add local state to any component without converting it to a class.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Working with useEffect</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>The useEffect hook handles side effects in functional components, replacing lifecycle methods like componentDidMount and componentDidUpdate. You can fetch data, set up subscriptions, and manually change the DOM all within this single powerful hook.</p>\n<!-- /wp:paragraph -->",
        "postType": "post",
        "postStatus": "publish",
        "postDate": "now",
        "featuredImageUrl": "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg"
      }
    },
    {
      "id": "addPost-2",
      "type": "addPost",
      "data": {
        "postTitle": "CSS Grid vs Flexbox: When to Use Each",
        "postContent": "<!-- wp:paragraph -->\n<p>Both CSS Grid and Flexbox are powerful layout systems that have transformed modern web design. Understanding when to use each one is crucial for creating efficient, maintainable layouts. Let's explore the strengths and ideal use cases for both.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Flexbox: One-Dimensional Layouts</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>Flexbox excels at laying out items in a single direction, either horizontally or vertically. It's perfect for navigation bars, card layouts, and any component where you need to distribute space among items along one axis. The flexibility to grow, shrink, and align items makes it indispensable.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>CSS Grid: Two-Dimensional Layouts</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>CSS Grid shines when you need to control both rows and columns simultaneously. It's ideal for page layouts, image galleries, and complex component structures. With features like grid template areas and automatic placement, you can create sophisticated layouts with minimal code.</p>\n<!-- /wp:paragraph -->",
        "postType": "post",
        "postStatus": "publish",
        "postDate": "now",
        "featuredImageUrl": "https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg"
      }
    },
    {
      "id": "addPost-3",
      "type": "addPost",
      "data": {
        "postTitle": "Understanding Asynchronous JavaScript",
        "postContent": "<!-- wp:paragraph -->\n<p>Asynchronous programming is fundamental to modern JavaScript development. From fetching data from APIs to handling user interactions, understanding how JavaScript manages asynchronous operations is essential for building responsive applications.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Callbacks and Promises</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>The journey of async JavaScript started with callbacks, evolved to Promises, and now we have async/await syntax. Each iteration made asynchronous code more readable and maintainable. Promises introduced a cleaner way to handle success and error cases, avoiding the infamous callback hell.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Modern Async/Await</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>The async/await syntax is syntactic sugar over Promises, making asynchronous code look and behave more like synchronous code. This improves readability dramatically and makes error handling with try/catch blocks feel natural. It's now the preferred way to handle async operations in modern JavaScript.</p>\n<!-- /wp:paragraph -->",
        "postType": "post",
        "postStatus": "publish",
        "postDate": "now",
        "featuredImageUrl": "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg"
      }
    }
  ],
  "explanation": "Created a modern web development blog with three detailed posts about React Hooks, CSS layouts, and async JavaScript"
}
```

### Example 2: Business Website with Pages

**User Prompt:** "Create a business website for a digital marketing agency"

**Generated Blueprint:**
```json
{
  "blueprintTitle": "Digital Marketing Pro",
  "landingPageType": "front-page",
  "customLandingUrl": "",
  "steps": [
    {
      "id": "setSiteOption-1",
      "type": "setSiteOption",
      "data": {
        "option": "blogname",
        "value": "Digital Marketing Pro"
      }
    },
    {
      "id": "setSiteOption-2",
      "type": "setSiteOption",
      "data": {
        "option": "blogdescription",
        "value": "Strategic marketing solutions for modern businesses"
      }
    },
    {
      "id": "setSiteOption-3",
      "type": "setSiteOption",
      "data": {
        "option": "permalink_structure",
        "value": "/%postname%/"
      }
    },
    {
      "id": "installTheme-1",
      "type": "installTheme",
      "data": {
        "themeZipFile": {
          "resource": "wordpress.org/themes",
          "wordpress.org/themes": "astra"
        },
        "options": { "activate": true }
      }
    },
    {
      "id": "installPlugin-1",
      "type": "installPlugin",
      "data": {
        "pluginZipFile": {
          "resource": "wordpress.org/plugins",
          "wordpress.org/plugins": "contact-form-7"
        },
        "options": { "activate": true }
      }
    },
    {
      "id": "installPlugin-2",
      "type": "installPlugin",
      "data": {
        "pluginZipFile": {
          "resource": "wordpress.org/plugins",
          "wordpress.org/plugins": "wordpress-seo"
        },
        "options": { "activate": true }
      }
    },
    {
      "id": "addPage-1",
      "type": "addPage",
      "data": {
        "postTitle": "Home",
        "postContent": "<!-- wp:paragraph -->\n<p>Welcome to Digital Marketing Pro, where we transform your digital presence into a powerful growth engine. Our team of experts specializes in data-driven strategies that deliver measurable results for businesses of all sizes.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Why Choose Us</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>With over a decade of experience in digital marketing, we've helped hundreds of companies achieve their goals. From small startups to enterprise organizations, our proven methodologies and innovative approaches consistently drive success.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Our Approach</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>We believe in transparency, collaboration, and results. Our process begins with understanding your unique challenges and goals, then crafting customized strategies that align with your vision. We don't believe in one-size-fits-all solutions.</p>\n<!-- /wp:paragraph -->",
        "postStatus": "publish",
        "postName": "home",
        "postParent": "",
        "template": "",
        "menuOrder": ""
      }
    },
    {
      "id": "addPage-2",
      "type": "addPage",
      "data": {
        "postTitle": "Services",
        "postContent": "<!-- wp:paragraph -->\n<p>Our comprehensive suite of digital marketing services is designed to cover every aspect of your online presence. We combine creativity with analytics to deliver campaigns that not only look great but perform exceptionally.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Search Engine Optimization</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>Dominate search results with our proven SEO strategies. We conduct thorough keyword research, optimize your site architecture, create compelling content, and build authoritative backlinks to improve your rankings and drive organic traffic.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Content Marketing</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>Engage your audience with strategic content that educates, entertains, and converts. Our content team creates blog posts, videos, infographics, and social media content that resonates with your target market and builds brand authority.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Social Media Management</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>Build meaningful connections with your audience across all major social platforms. We develop content calendars, create engaging posts, manage community interactions, and run targeted advertising campaigns to grow your social presence.</p>\n<!-- /wp:paragraph -->",
        "postStatus": "publish",
        "postName": "services",
        "postParent": "",
        "template": "",
        "menuOrder": ""
      }
    },
    {
      "id": "addPage-3",
      "type": "addPage",
      "data": {
        "postTitle": "About Us",
        "postContent": "<!-- wp:paragraph -->\n<p>Founded in 2012, Digital Marketing Pro emerged from a simple belief: businesses deserve marketing partners who truly understand their challenges and are invested in their success. Today, we're proud to be a leading digital marketing agency serving clients worldwide.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Our Story</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>What started as a two-person operation has grown into a dynamic team of strategists, designers, developers, and content creators. Throughout our growth, we've maintained our commitment to personalized service and exceptional results.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Our Team</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>Our diverse team brings together expertise from various fields including marketing, technology, design, and analytics. This multidisciplinary approach allows us to tackle complex challenges and deliver comprehensive solutions that drive real business growth.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Our Values</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>Integrity, innovation, and impact guide everything we do. We believe in transparent communication, continuous learning, and measuring success by the results we achieve for our clients. Your success is our success.</p>\n<!-- /wp:paragraph -->",
        "postStatus": "publish",
        "postName": "about",
        "postParent": "",
        "template": "",
        "menuOrder": ""
      }
    },
    {
      "id": "addPage-4",
      "type": "addPage",
      "data": {
        "postTitle": "Contact",
        "postContent": "<!-- wp:paragraph -->\n<p>Ready to transform your digital marketing? We'd love to hear about your business and discuss how we can help you achieve your goals. Reach out today for a free consultation.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Get in Touch</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>Fill out the form below and one of our marketing specialists will get back to you within 24 hours. Whether you have questions about our services, want to discuss a specific project, or just want to learn more about what we do, we're here to help.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:paragraph -->\n<p><strong>Email:</strong> hello@digitalmarketingpro.com<br><strong>Phone:</strong> (555) 123-4567<br><strong>Location:</strong> New York, NY</p>\n<!-- /wp:paragraph -->",
        "postStatus": "publish",
        "postName": "contact",
        "postParent": "",
        "template": "",
        "menuOrder": ""
      }
    },
    {
      "id": "setHomepage-1",
      "type": "setHomepage",
      "data": {
        "option": "existing",
        "pageSlug": "home"
      }
    },
    {
      "id": "createNavigationMenu-1",
      "type": "createNavigationMenu",
      "data": {
        "menuName": "Main Menu",
        "menuLocation": "primary",
        "menuItems": [
          { "type": "custom", "title": "Home", "url": "/" },
          { "type": "page", "pageSlug": "services" },
          { "type": "page", "pageSlug": "about" },
          { "type": "page", "pageSlug": "contact" }
        ]
      }
    }
  ],
  "explanation": "Created a complete digital marketing agency website with services, about, and contact pages, plus navigation menu and static homepage"
}
```

### Example 3: Portfolio Website

**User Prompt:** "Build a portfolio site for a web developer"

**Generated Blueprint:**
```json
{
  "blueprintTitle": "Developer Portfolio",
  "landingPageType": "front-page",
  "customLandingUrl": "",
  "steps": [
    {
      "id": "setSiteOption-1",
      "type": "setSiteOption",
      "data": {
        "option": "blogname",
        "value": "Jane Smith - Web Developer"
      }
    },
    {
      "id": "setSiteOption-2",
      "type": "setSiteOption",
      "data": {
        "option": "blogdescription",
        "value": "Full-stack developer specializing in React and Node.js"
      }
    },
    {
      "id": "installTheme-1",
      "type": "installTheme",
      "data": {
        "themeZipFile": {
          "resource": "wordpress.org/themes",
          "wordpress.org/themes": "neve"
        },
        "options": { "activate": true }
      }
    },
    {
      "id": "addPage-1",
      "type": "addPage",
      "data": {
        "postTitle": "Home",
        "postContent": "<!-- wp:paragraph -->\n<p>Hi, I'm Jane Smith, a full-stack web developer passionate about creating beautiful, performant web applications. With 7 years of experience in the industry, I specialize in React, Node.js, and modern JavaScript frameworks.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>What I Do</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>I build responsive web applications that solve real problems. From e-commerce platforms to SaaS products, I focus on writing clean, maintainable code and creating exceptional user experiences. My approach combines technical expertise with a deep understanding of user needs.</p>\n<!-- /wp:paragraph -->",
        "postStatus": "publish",
        "postName": "home",
        "postParent": "",
        "template": "",
        "menuOrder": ""
      }
    },
    {
      "id": "addPost-1",
      "type": "addPost",
      "data": {
        "postTitle": "E-Commerce Platform",
        "postContent": "<!-- wp:paragraph -->\n<p>A full-featured e-commerce platform built with React, Node.js, and MongoDB. This project handles thousands of products, real-time inventory management, and secure payment processing.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Technologies Used</h2>\n<!-- /wp:heading -->\n\n<!-- wp:list -->\n<ul>\n<li>React with Redux for state management</li>\n<li>Node.js and Express backend</li>\n<li>MongoDB database</li>\n<li>Stripe payment integration</li>\n<li>AWS S3 for image storage</li>\n</ul>\n<!-- /wp:list -->\n\n<!-- wp:heading -->\n<h2>Key Features</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>The platform includes advanced search and filtering, user reviews, wishlist functionality, order tracking, and an admin dashboard for inventory management. Performance optimization techniques like code splitting and lazy loading ensure fast load times.</p>\n<!-- /wp:paragraph -->",
        "postType": "post",
        "postStatus": "publish",
        "postDate": "now",
        "featuredImageUrl": "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg"
      }
    },
    {
      "id": "addPost-2",
      "type": "addPost",
      "data": {
        "postTitle": "Task Management App",
        "postContent": "<!-- wp:paragraph -->\n<p>A collaborative task management application designed for remote teams. Built with modern web technologies, it offers real-time updates, team collaboration features, and an intuitive interface.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Project Overview</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>This SaaS application serves over 500 teams worldwide. Features include drag-and-drop task boards, real-time notifications, file attachments, time tracking, and comprehensive reporting. The responsive design works seamlessly across devices.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Technical Highlights</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>Built with React and TypeScript for type safety, Socket.io for real-time updates, and PostgreSQL for data persistence. The application uses JWT authentication, implements comprehensive error handling, and includes a complete test suite with 90% coverage.</p>\n<!-- /wp:paragraph -->",
        "postType": "post",
        "postStatus": "publish",
        "postDate": "now",
        "featuredImageUrl": "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg"
      }
    },
    {
      "id": "addPage-2",
      "type": "addPage",
      "data": {
        "postTitle": "About",
        "postContent": "<!-- wp:paragraph -->\n<p>I'm a full-stack developer with a passion for building elegant solutions to complex problems. My journey in web development started 7 years ago, and I've been fortunate to work on diverse projects ranging from startups to enterprise applications.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading -->\n<h2>Skills & Technologies</h2>\n<!-- /wp:heading -->\n\n<!-- wp:list -->\n<ul>\n<li>Frontend: React, TypeScript, Next.js, Vue.js</li>\n<li>Backend: Node.js, Express, Python, Django</li>\n<li>Database: PostgreSQL, MongoDB, Redis</li>\n<li>DevOps: Docker, AWS, CI/CD pipelines</li>\n<li>Testing: Jest, React Testing Library, Cypress</li>\n</ul>\n<!-- /wp:list -->\n\n<!-- wp:heading -->\n<h2>Experience</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>Currently working as a Senior Full-Stack Developer at Tech Solutions Inc. Previously held positions at innovative startups where I led development teams and architected scalable applications. I'm committed to continuous learning and staying current with emerging technologies.</p>\n<!-- /wp:paragraph -->",
        "postStatus": "publish",
        "postName": "about",
        "postParent": "",
        "template": "",
        "menuOrder": ""
      }
    },
    {
      "id": "addPage-3",
      "type": "addPage",
      "data": {
        "postTitle": "Contact",
        "postContent": "<!-- wp:paragraph -->\n<p>I'm always interested in hearing about new projects and opportunities. Whether you have a question, want to collaborate, or just want to say hello, feel free to reach out.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:paragraph -->\n<p><strong>Email:</strong> jane@example.com<br><strong>GitHub:</strong> github.com/janesmith<br><strong>LinkedIn:</strong> linkedin.com/in/janesmith<br><strong>Location:</strong> San Francisco, CA</p>\n<!-- /wp:paragraph -->",
        "postStatus": "publish",
        "postName": "contact",
        "postParent": "",
        "template": "",
        "menuOrder": ""
      }
    },
    {
      "id": "setHomepage-1",
      "type": "setHomepage",
      "data": {
        "option": "existing",
        "pageSlug": "home"
      }
    },
    {
      "id": "setPostsPage-1",
      "type": "setPostsPage",
      "data": {
        "option": "create",
        "title": "Projects"
      }
    },
    {
      "id": "createNavigationMenu-1",
      "type": "createNavigationMenu",
      "data": {
        "menuName": "Main Menu",
        "menuLocation": "primary",
        "menuItems": [
          { "type": "custom", "title": "Home", "url": "/" },
          { "type": "custom", "title": "Projects", "url": "/projects/" },
          { "type": "page", "pageSlug": "about" },
          { "type": "page", "pageSlug": "contact" }
        ]
      }
    }
  ],
  "explanation": "Created a developer portfolio site with project showcases (as posts), about page, and contact information with navigation"
}
```

---

## WordPress Playground Conversion Notes

The frontend converts Pootle format steps to WordPress Playground format. Key conversions:

### Step Type Mapping

- `installPlugin` → `installPlugin` (with resource conversion)
- `installTheme` → `installTheme` (with resource conversion)
- `addPost` → `runPHP` with wp_insert_post code
- `addPage` → `runPHP` with wp_insert_post code
- `setSiteOption` → `runPHP` with update_option code
- `setHomepage` → Multiple `runPHP` steps
- `createNavigationMenu` → `runPHP` with wp-cli menu commands
- `defineWpConfigConst` → `defineWpConfigConsts` (WordPress Playground native)
- `login` → `login` (WordPress Playground native)

### Resource Format

Pootle uses a nested structure for clarity, but WordPress Playground uses a flatter structure:

**Pootle Format:**
```json
{
  "resource": "wordpress.org/plugins",
  "wordpress.org/plugins": "contact-form-7"
}
```

**WordPress Playground Format:**
```json
{
  "resource": "wordpress.org/plugins",
  "slug": "contact-form-7"
}
```

The frontend handles this conversion automatically.

### Page ID Calculation

When creating pages, WordPress assigns IDs sequentially. The converter tracks page creation order to calculate IDs for references in menus and homepage settings:

- First page: ID 2
- Second page: ID 3
- Third page: ID 4
- And so on...

This allows proper linking in navigation menus and homepage configuration.

### UTF-8 Encoding

All content is UTF-8 encoded and base64-encoded when embedded in PHP code to handle special characters properly.

---

## Common Patterns

### Static Homepage with Blog

```json
// Set static homepage
{
  "id": "setHomepage-1",
  "type": "setHomepage",
  "data": {
    "option": "create",
    "title": "Home",
    "content": "Welcome content..."
  }
}

// Set blog page
{
  "id": "setPostsPage-1",
  "type": "setPostsPage",
  "data": {
    "option": "create",
    "title": "Blog"
  }
}
```

### Multi-Level Navigation

```json
{
  "id": "createNavigationMenu-1",
  "type": "createNavigationMenu",
  "data": {
    "menuName": "Main Menu",
    "menuLocation": "primary",
    "menuItems": [
      { "type": "custom", "title": "Home", "url": "/" },
      { "type": "page", "pageSlug": "about" },
      { "type": "page", "pageSlug": "services" },
      { "type": "custom", "title": "Blog", "url": "/blog/" },
      { "type": "page", "pageSlug": "contact" }
    ]
  }
}
```

### Complete Site Setup

```json
{
  "steps": [
    // 1. Identity
    { "type": "setSiteOption", "data": { "option": "blogname", "value": "..." } },
    { "type": "setSiteOption", "data": { "option": "blogdescription", "value": "..." } },

    // 2. Appearance
    { "type": "installTheme", "data": { ... } },
    { "type": "installPlugin", "data": { ... } },

    // 3. Content
    { "type": "addPage", "data": { ... } },
    { "type": "addPost", "data": { ... } },

    // 4. Homepage
    { "type": "setHomepage", "data": { ... } },

    // 5. Navigation
    { "type": "createNavigationMenu", "data": { ... } },

    // 6. Settings
    { "type": "setSiteOption", "data": { "option": "permalink_structure", "value": "/%postname%/" } }
  ]
}
```

---

## Troubleshooting

### Common Issues

**Issue:** Menu items not appearing
- Ensure pages exist before creating menu
- Use correct page slugs in menu items
- Verify theme supports the menu location

**Issue:** Homepage not displaying
- Check setHomepage step comes after page creation
- Verify pageSlug matches actual page postName
- Ensure show_on_front is set to "page"

**Issue:** Plugins not activating
- Use exact wordpress.org slug (check wordpress.org/plugins)
- Don't invent plugin names
- Ensure activate option is set to true

**Issue:** Content appearing broken
- Use proper Gutenberg block format
- Escape special characters in content
- Use UTF-8 encoding for international characters

### Validation Checklist

Before submitting a blueprint, verify:
- [ ] All step IDs are unique
- [ ] All plugin/theme slugs are real wordpress.org slugs
- [ ] Post and page content is substantial (100+ words)
- [ ] Navigation menu references existing pages
- [ ] Homepage setup comes after page creation
- [ ] Site options (blogname, blogdescription) are set first
- [ ] Landing page type is appropriate
- [ ] Blueprint has a clear, descriptive title
- [ ] Explanation summarizes what was created

---

## Version History

### Version 1.0 (October 12, 2025)
- Initial comprehensive documentation
- All 14 step types documented
- Complete examples for blog, business, and portfolio sites
- Best practices and troubleshooting guide
- WordPress Playground conversion notes
