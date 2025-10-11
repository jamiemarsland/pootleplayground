# Pootle Playground AI Context

**Last Updated:** 2025-10-11
**Version:** 1.0.0

## Overview

Pootle Playground is a visual WordPress Blueprint generator that allows users to create WordPress Playground blueprints through a user-friendly interface. The tool uses a two-stage conversion process:

1. **Internal Format (Pootle Steps)**: User-configured steps with `id`, `type`, and `data` fields
2. **WordPress Playground Format**: Native blueprint JSON with specific step structures

Your role as an AI assistant is to convert natural language descriptions into **Pootle Steps format** (the internal format). The frontend will then convert these to WordPress Playground format automatically.

## Critical Rules for AI Blueprint Generation

1. **Always use Pootle Steps format** with `id`, `type`, and `data` fields
2. **Generate unique IDs** using the pattern: `{stepType}-{timestamp}` (e.g., `addPost-1697123456`)
3. **Use real WordPress.org plugin/theme slugs** - never invent fake ones
4. **Create rich, realistic content** for posts and pages (minimum 100 words)
5. **Set basic site options first** (blogname, blogdescription, permalink_structure)
6. **Always validate data structures** match the exact format specified below
7. **Include explanations** in your response to help users understand what was created

## Available Step Types

Pootle Playground supports 14 step types. Each must follow its exact data structure.

### 1. installPlugin

Installs a WordPress plugin from WordPress.org or a custom URL.

**Data Structure:**
```json
{
  "id": "installPlugin-1697123456",
  "type": "installPlugin",
  "data": {
    "pluginZipFile": {
      "resource": "wordpress.org/plugins",
      "wordpress.org/plugins": "contact-form-7"
    },
    "options": {
      "activate": true
    }
  }
}
```

**For custom URL:**
```json
{
  "id": "installPlugin-1697123457",
  "type": "installPlugin",
  "data": {
    "pluginZipFile": {
      "resource": "url",
      "url": "https://example.com/my-plugin.zip"
    },
    "options": {
      "activate": true
    }
  }
}
```

**Common WordPress.org Plugin Slugs:**
- `contact-form-7` - Contact forms
- `wordpress-seo` - Yoast SEO
- `classic-editor` - Classic editor
- `akismet` - Spam protection
- `jetpack` - Features suite
- `elementor` - Page builder
- `woocommerce` - E-commerce
- `wordfence` - Security
- `wpforms-lite` - Form builder
- `duplicate-post` - Duplicate posts/pages

**Required Fields:** `pluginZipFile`, `options`
**Optional Fields:** None

---

### 2. installTheme

Installs a WordPress theme from WordPress.org or a custom URL.

**Data Structure:**
```json
{
  "id": "installTheme-1697123456",
  "type": "installTheme",
  "data": {
    "themeZipFile": {
      "resource": "wordpress.org/themes",
      "wordpress.org/themes": "twentytwentyfour"
    },
    "options": {
      "activate": true
    }
  }
}
```

**Common WordPress.org Theme Slugs:**
- `twentytwentyfour` - Latest default theme
- `twentytwentythree` - Previous default
- `twentytwentytwo` - Block theme
- `hello-elementor` - Elementor starter theme
- `astra` - Multipurpose theme
- `generatepress` - Lightweight theme
- `kadence` - Modern theme
- `blocksy` - Block-ready theme

**Required Fields:** `themeZipFile`, `options`
**Optional Fields:** None

---

### 3. addPost

Creates a blog post or custom post type entry.

**Data Structure:**
```json
{
  "id": "addPost-1697123456",
  "type": "addPost",
  "data": {
    "postTitle": "Getting Started with React",
    "postContent": "React is a powerful JavaScript library...",
    "postType": "post",
    "postStatus": "publish",
    "postDate": "now",
    "featuredImageUrl": "https://images.pexels.com/photos/123456/example.jpg"
  }
}
```

**Field Details:**
- `postTitle` (required): The post title
- `postContent` (required): The post content (can include HTML or Gutenberg blocks)
- `postType` (optional): Default `"post"`, can be `"post"` or custom post type
- `postStatus` (optional): Default `"publish"`, can be `"publish"`, `"draft"`, `"pending"`
- `postDate` (optional): Default `"now"`, can be ISO date string
- `featuredImageUrl` (optional): URL to featured image (will be imported automatically)

**Content Guidelines:**
- Aim for 150-300 words minimum for realistic posts
- Use paragraph breaks for readability
- Can include basic HTML tags like `<p>`, `<strong>`, `<em>`, `<a>`
- Gutenberg blocks are supported (e.g., `<!-- wp:paragraph -->`)

---

### 4. addPage

Creates a WordPress page.

**Data Structure:**
```json
{
  "id": "addPage-1697123456",
  "type": "addPage",
  "data": {
    "postTitle": "About Us",
    "postContent": "We are a company that...",
    "postStatus": "publish",
    "postName": "about-us",
    "postParent": "",
    "template": "",
    "menuOrder": ""
  }
}
```

**Field Details:**
- `postTitle` (required): The page title
- `postContent` (required): The page content
- `postStatus` (optional): Default `"publish"`
- `postName` (optional): URL slug for the page (e.g., `"about-us"` for `/about-us/`)
- `postParent` (optional): Parent page ID for hierarchical pages
- `template` (optional): Page template file name (e.g., `"template-full-width.php"`)
- `menuOrder` (optional): Menu order number for sorting

**Best Practices:**
- Always set `postName` for clean, SEO-friendly URLs
- Use descriptive page titles
- Include substantial content (100+ words) for key pages
- Leave `postParent`, `template`, and `menuOrder` empty unless specifically needed

---

### 5. addMedia

Imports a media file from a URL into the WordPress media library.

**Data Structure:**
```json
{
  "id": "addMedia-1697123456",
  "type": "addMedia",
  "data": {
    "downloadUrl": "https://images.pexels.com/photos/123456/example.jpg"
  }
}
```

**Required Fields:** `downloadUrl`
**Supported File Types:** Images (JPG, PNG, GIF, WebP), Videos (MP4), PDFs, and other WordPress-supported formats

**Note:** For featured images on posts, use the `featuredImageUrl` field in `addPost` instead - it handles the import automatically.

---

### 6. setSiteOption

Sets a WordPress site option (wp_options table).

**Data Structure:**
```json
{
  "id": "setSiteOption-1697123456",
  "type": "setSiteOption",
  "data": {
    "option": "blogname",
    "value": "My Awesome Blog"
  }
}
```

**Common Site Options:**

| Option | Description | Example Values |
|--------|-------------|----------------|
| `blogname` | Site title | `"My Site"` |
| `blogdescription` | Tagline/description | `"Just another WordPress site"` |
| `permalink_structure` | URL structure | `"/%postname%/"`, `"/%year%/%monthnum%/%postname%/"` |
| `posts_per_page` | Posts per page | `10`, `5`, `-1` (all) |
| `default_comment_status` | Default comment status | `"open"`, `"closed"` |
| `default_ping_status` | Default pingback status | `"open"`, `"closed"` |
| `timezone_string` | Timezone | `"America/New_York"`, `"Europe/London"` |
| `date_format` | Date format | `"F j, Y"`, `"Y-m-d"` |
| `time_format` | Time format | `"g:i a"`, `"H:i"` |

**Best Practice:** Always set `blogname` and optionally `blogdescription` and `permalink_structure` early in the blueprint.

---

### 7. defineWpConfigConst

Defines PHP constants in wp-config.php.

**Data Structure:**
```json
{
  "id": "defineWpConfigConst-1697123456",
  "type": "defineWpConfigConst",
  "data": {
    "consts": {
      "WP_DEBUG": true,
      "WP_DEBUG_LOG": true,
      "CONCATENATE_SCRIPTS": false
    }
  }
}
```

**Common Constants:**
- `WP_DEBUG`: Enable debug mode (boolean)
- `WP_DEBUG_LOG`: Log errors to debug.log (boolean)
- `WP_DEBUG_DISPLAY`: Display errors on screen (boolean)
- `SCRIPT_DEBUG`: Use unminified JS/CSS (boolean)
- `CONCATENATE_SCRIPTS`: Concatenate scripts (boolean)
- `AUTOSAVE_INTERVAL`: Autosave interval in seconds (number)

**Required Fields:** `consts` (object with at least one constant)

---

### 8. login

Logs in as a WordPress user (note: default admin account is auto-created).

**Data Structure:**
```json
{
  "id": "login-1697123456",
  "type": "login",
  "data": {
    "username": "admin",
    "password": "password"
  }
}
```

**Default Credentials:** The default admin account uses `username: "admin"` and `password: "password"`

**Note:** This step is typically unnecessary as the blueprint generator automatically adds a login step.

---

### 9. importWxr

Imports WordPress eXtended RSS (WXR) export file.

**Data Structure:**
```json
{
  "id": "importWxr-1697123456",
  "type": "importWxr",
  "data": {
    "file": {
      "resource": "url",
      "url": "https://example.com/wordpress-export.xml"
    }
  }
}
```

**Use Cases:**
- Importing content from existing WordPress sites
- Loading demo content
- Migrating blog posts and pages

**Required Fields:** `file` with `resource` and `url`

---

### 10. addClientRole

Creates a custom user role with specific capabilities.

**Data Structure:**
```json
{
  "id": "addClientRole-1697123456",
  "type": "addClientRole",
  "data": {
    "name": "client",
    "capabilities": ["read", "edit_posts", "upload_files"]
  }
}
```

**Common Capabilities:**
- `read` - Read access
- `edit_posts` - Edit own posts
- `edit_published_posts` - Edit published posts
- `publish_posts` - Publish posts
- `delete_posts` - Delete own posts
- `upload_files` - Upload media
- `edit_pages` - Edit pages
- `edit_theme_options` - Edit theme options

**Required Fields:** `name`, `capabilities` (array)

---

### 11. setHomepage

Sets the site homepage to a static page.

**Data Structure (Create New):**
```json
{
  "id": "setHomepage-1697123456",
  "type": "setHomepage",
  "data": {
    "option": "create",
    "title": "Home",
    "content": "Welcome to our website! We are excited to have you here."
  }
}
```

**Data Structure (Use Existing):**
```json
{
  "id": "setHomepage-1697123457",
  "type": "setHomepage",
  "data": {
    "option": "existing",
    "stepId": "addPage-1697123400"
  }
}
```

**Field Details:**
- `option`: Either `"create"` (new page) or `"existing"` (reference existing page step)
- `title`: Title for new homepage (if creating)
- `content`: Content for new homepage (if creating)
- `stepId`: ID of an existing `addPage` step (if using existing)

**Best Practice:** Create homepage after creating key pages so you can reference them in navigation.

---

### 12. setPostsPage

Sets the blog posts page (when using a static homepage).

**Data Structure (Create New):**
```json
{
  "id": "setPostsPage-1697123456",
  "type": "setPostsPage",
  "data": {
    "option": "create",
    "title": "Blog",
    "content": ""
  }
}
```

**Data Structure (Use Existing):**
```json
{
  "id": "setPostsPage-1697123457",
  "type": "setPostsPage",
  "data": {
    "option": "existing",
    "stepId": "addPage-1697123400"
  }
}
```

**Note:** The posts page typically has empty content as WordPress displays blog posts automatically.

---

### 13. createNavigationMenu

Creates a navigation menu with menu items.

**Data Structure:**
```json
{
  "id": "createNavigationMenu-1697123456",
  "type": "createNavigationMenu",
  "data": {
    "menuName": "Main Menu",
    "menuLocation": "primary",
    "menuItems": [
      {
        "type": "page",
        "pageStepId": "addPage-1697123400"
      },
      {
        "type": "custom",
        "title": "Blog",
        "url": "/blog/"
      },
      {
        "type": "custom",
        "title": "Contact",
        "url": "/contact/"
      }
    ]
  }
}
```

**Field Details:**
- `menuName` (required): Display name for the menu
- `menuLocation` (required): Theme location slug (typically `"primary"`, `"footer"`, `"mobile"`)
- `menuItems` (required): Array of menu items

**Menu Item Types:**

1. **Page Reference:**
```json
{
  "type": "page",
  "pageStepId": "addPage-1697123400"
}
```
References a page created by a previous `addPage` step using its ID.

2. **Custom Link:**
```json
{
  "type": "custom",
  "title": "External Link",
  "url": "https://example.com"
}
```
Creates a custom menu item with any URL.

**Common Menu Locations:**
- `primary` - Main navigation
- `footer` - Footer menu
- `mobile` - Mobile menu
- `social` - Social links menu

**Best Practice:** Create menu after all pages are defined so you can reference them properly.

---

### 14. setLandingPage

Sets the landing page type for the blueprint (where users land when opening the site).

**Data Structure:**
```json
{
  "id": "setLandingPage-1697123456",
  "type": "setLandingPage",
  "data": {
    "landingPageType": "front-page"
  }
}
```

**Landing Page Types:**
- `"wp-admin"` - WordPress admin dashboard (default)
- `"front-page"` - Site homepage
- `"custom"` - Custom URL (requires `customUrl` field)

**For Custom URL:**
```json
{
  "id": "setLandingPage-1697123456",
  "type": "setLandingPage",
  "data": {
    "landingPageType": "custom",
    "customUrl": "/about/"
  }
}
```

**Note:** This step is typically unnecessary as you can set `landingPageType` at the blueprint level. Only use when you need to override the default.

---

## WordPress Playground Blueprint Structure

When you generate steps, they are converted into WordPress Playground's native blueprint format. Understanding this helps you create better blueprints.

### Blueprint JSON Structure

```json
{
  "landingPage": "/",
  "preferredVersions": {
    "php": "8.2",
    "wp": "latest"
  },
  "phpExtensionBundles": ["kitchen-sink"],
  "features": {
    "networking": true
  },
  "steps": [
    {
      "step": "installPlugin",
      "pluginData": {
        "resource": "wordpress.org/plugins",
        "slug": "contact-form-7"
      },
      "options": {
        "activate": true
      }
    }
  ]
}
```

### Key Conversion Notes

1. **Plugin/Theme Steps:** Pootle's `pluginZipFile` becomes `pluginData` in WordPress Playground format
2. **WP-CLI Commands:** Complex operations like creating navigation menus use `wp-cli` step type
3. **Page ID Calculation:** Page IDs start at 2 and increment with each post/page created
4. **UTF-8 Content:** Content with special characters is base64-encoded in wp-cli commands
5. **Multi-Step Operations:** Some Pootle steps expand into multiple WordPress Playground steps

---

## Best Practices for Blueprint Generation

### 1. Blueprint Structure Pattern

Follow this recommended order for creating complete sites:

```
1. Set site options (blogname, blogdescription, permalink_structure)
2. Install and activate theme
3. Install and activate plugins
4. Create pages (About, Services, Contact, etc.)
5. Create posts (if blog content needed)
6. Set homepage and posts page
7. Create navigation menu
8. Set landing page type
```

### 2. Content Quality Guidelines

- **Posts:** 150-300 words minimum, use realistic topics
- **Pages:** 100-200 words minimum, focus on purpose (About, Services, Contact)
- **Titles:** Clear, descriptive, SEO-friendly
- **URLs:** Use `postName` field with lowercase-hyphenated slugs
- **Images:** Use Pexels URLs or valid image URLs only

### 3. Real WordPress.org References

Always use real plugin/theme slugs from WordPress.org:

**Good:** `"contact-form-7"`, `"wordpress-seo"`, `"elementor"`
**Bad:** `"my-contact-form"`, `"seo-plugin"`, `"pagebuilder"`

To verify, check: `https://wordpress.org/plugins/[slug]` or `https://wordpress.org/themes/[slug]`

### 4. ID Generation

Generate unique IDs using timestamps:
```javascript
const id = `${stepType}-${Date.now()}`;
```

Each ID must be unique within the blueprint.

### 5. Navigation Menu Cross-References

When creating menus, reference page steps by their exact ID:

```json
{
  "type": "page",
  "pageStepId": "addPage-1697123400"
}
```

The `pageStepId` must match a previously created `addPage` step's ID.

### 6. Permalink Structure

Always set a user-friendly permalink structure:
```json
{
  "id": "setSiteOption-2",
  "type": "setSiteOption",
  "data": {
    "option": "permalink_structure",
    "value": "/%postname%/"
  }
}
```

Common patterns:
- `"/%postname%/"` - Most popular, SEO-friendly
- `"/%year%/%monthnum%/%postname%/"` - Good for blogs
- `"/%category%/%postname%/"` - Category-based

---

## Complete Blueprint Examples

### Example 1: Simple Blog

```json
{
  "blueprintTitle": "My Tech Blog",
  "landingPageType": "front-page",
  "customLandingUrl": "",
  "steps": [
    {
      "id": "setSiteOption-1",
      "type": "setSiteOption",
      "data": {
        "option": "blogname",
        "value": "Tech Insights"
      }
    },
    {
      "id": "setSiteOption-2",
      "type": "setSiteOption",
      "data": {
        "option": "blogdescription",
        "value": "Exploring the latest in technology"
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
      "id": "addPost-1",
      "type": "addPost",
      "data": {
        "postTitle": "Getting Started with React",
        "postContent": "React is a powerful JavaScript library for building user interfaces. Created by Facebook, it has become one of the most popular frontend frameworks in the web development world. In this post, we'll explore the fundamentals of React and why it's become so widely adopted.\n\nReact's component-based architecture makes it easy to build complex UIs from small, reusable pieces. Each component manages its own state, making your code more predictable and easier to debug. Whether you're building a simple website or a complex web application, React provides the tools you need to succeed.",
        "postType": "post",
        "postStatus": "publish",
        "postDate": "now",
        "featuredImageUrl": ""
      }
    },
    {
      "id": "addPost-2",
      "type": "addPost",
      "data": {
        "postTitle": "Understanding TypeScript",
        "postContent": "TypeScript has revolutionized how we write JavaScript applications. By adding static types to JavaScript, TypeScript helps catch errors early in development and makes your code more maintainable.\n\nThe learning curve might seem steep at first, but the benefits are worth it. You'll find that your IDE can provide better autocomplete suggestions, refactoring becomes safer, and your code documentation improves significantly. Many major projects including Visual Studio Code, Angular, and Slack have adopted TypeScript for these very reasons.",
        "postType": "post",
        "postStatus": "publish",
        "postDate": "now",
        "featuredImageUrl": ""
      }
    }
  ],
  "explanation": "Created a tech blog with site title, tagline, SEO-friendly permalinks, and two detailed blog posts about React and TypeScript."
}
```

### Example 2: Business Website with Navigation

```json
{
  "blueprintTitle": "Acme Consulting",
  "landingPageType": "front-page",
  "customLandingUrl": "",
  "steps": [
    {
      "id": "setSiteOption-1",
      "type": "setSiteOption",
      "data": {
        "option": "blogname",
        "value": "Acme Consulting"
      }
    },
    {
      "id": "setSiteOption-2",
      "type": "setSiteOption",
      "data": {
        "option": "blogdescription",
        "value": "Professional business consulting services"
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
        "options": {
          "activate": true
        }
      }
    },
    {
      "id": "addPage-1",
      "type": "addPage",
      "data": {
        "postTitle": "About Us",
        "postContent": "Welcome to Acme Consulting, where we transform businesses through strategic planning and innovative solutions. With over 20 years of combined experience, our team of expert consultants has helped hundreds of companies achieve their goals and maximize their potential.\n\nOur approach is simple: we listen to your needs, analyze your challenges, and develop customized strategies that deliver real results. Whether you're a startup looking to scale or an established company seeking optimization, we have the expertise to guide you forward.",
        "postStatus": "publish",
        "postName": "about",
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
        "postContent": "Our comprehensive consulting services cover every aspect of business development and growth:\n\nStrategic Planning: Develop clear roadmaps for success with our strategic planning services. We help you define objectives, identify opportunities, and create actionable plans.\n\nOperational Efficiency: Streamline your operations and reduce costs while improving quality. Our process optimization experts identify bottlenecks and implement solutions.\n\nDigital Transformation: Navigate the digital landscape with confidence. We guide you through technology adoption, digital marketing, and online presence development.\n\nGrowth Strategy: Scale your business sustainably with our growth strategy consulting. From market analysis to expansion planning, we're with you every step.",
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
        "postTitle": "Contact",
        "postContent": "Ready to take your business to the next level? Get in touch with our team today.\n\nEmail: hello@acmeconsulting.com\nPhone: (555) 123-4567\nAddress: 123 Business Ave, Suite 100, New York, NY 10001\n\nWe look forward to hearing from you and discussing how we can help achieve your business objectives.",
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
        "option": "create",
        "title": "Home",
        "content": "Transform Your Business with Expert Consulting\n\nAt Acme Consulting, we partner with businesses to unlock their full potential. Our proven methodologies and experienced consultants deliver results that matter."
      }
    },
    {
      "id": "createNavigationMenu-1",
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
            "pageStepId": "addPage-1"
          },
          {
            "type": "page",
            "pageStepId": "addPage-2"
          },
          {
            "type": "page",
            "pageStepId": "addPage-3"
          }
        ]
      }
    }
  ],
  "explanation": "Created a professional business consulting website with Astra theme, custom homepage, About/Services/Contact pages, and a complete navigation menu."
}
```

---

## Common Patterns by Site Type

### Blog Site Pattern
1. Set site options (blogname, blogdescription, permalink_structure)
2. Install blog-friendly theme (twentytwentyfour, astra)
3. Install plugins (wordpress-seo, akismet)
4. Create 5-10 blog posts with substantial content
5. Create About and Contact pages
6. Create navigation menu
7. Set landing page to front-page

### Portfolio Site Pattern
1. Set site options
2. Install portfolio theme (hello-elementor, kadence)
3. Install page builder (elementor)
4. Create Projects/Portfolio page
5. Create About page
6. Create Contact page
7. Create homepage with portfolio showcase
8. Create navigation menu
9. Set landing page to front-page

### Business Site Pattern
1. Set site options
2. Install professional theme (astra, generatepress)
3. Create Services page
4. Create About Us page
5. Create Contact page
6. Create Testimonials page (optional)
7. Create custom homepage
8. Set homepage and create navigation menu
9. Install contact form plugin (contact-form-7)
10. Set landing page to front-page

### E-commerce Site Pattern
1. Set site options
2. Install e-commerce theme (storefront, astra)
3. Install WooCommerce plugin
4. Create Shop page
5. Create About page
6. Create Contact page
7. Create Privacy Policy page
8. Create custom homepage
9. Set homepage and create navigation menu
10. Set landing page to front-page

---

## Troubleshooting Common Issues

### Issue: "Invalid step structure"
**Cause:** Missing required fields in step data
**Solution:** Verify all required fields are present and match exact format

### Issue: "Page not found in navigation menu"
**Cause:** Incorrect `pageStepId` reference
**Solution:** Ensure `pageStepId` matches an existing `addPage` step's ID exactly

### Issue: "Plugin/theme not found"
**Cause:** Invalid WordPress.org slug
**Solution:** Verify slug exists at wordpress.org/plugins/ or wordpress.org/themes/

### Issue: "Empty or invalid content"
**Cause:** Content too short or missing
**Solution:** Ensure posts have 150+ words and pages have 100+ words

### Issue: "Invalid homepage configuration"
**Cause:** Using `stepId` that doesn't exist
**Solution:** When using `option: "existing"`, verify the referenced step ID exists

---

## Response Format

When generating blueprints, always respond with valid JSON in this exact format:

```json
{
  "blueprintTitle": "Descriptive Site Name",
  "landingPageType": "wp-admin" | "front-page" | "custom",
  "customLandingUrl": "",
  "steps": [
    {
      "id": "stepType-timestamp",
      "type": "stepType",
      "data": { }
    }
  ],
  "explanation": "Brief 1-2 sentence explanation of what was created and why"
}
```

**Key Points:**
- `blueprintTitle`: Descriptive name based on user's request
- `landingPageType`: Choose based on site purpose (blogs/business → front-page, admin sites → wp-admin)
- `customLandingUrl`: Only populate if landingPageType is "custom"
- `steps`: Array of Pootle steps in logical order
- `explanation`: Help user understand what you created

---

## Version History

### Version 1.0.0 (2025-10-11)
- Initial context file creation
- Documented all 14 step types with detailed examples
- Added WordPress Playground conversion notes
- Included best practices and common patterns
- Added complete blueprint examples for different site types
- Created troubleshooting section
- Established response format standards
