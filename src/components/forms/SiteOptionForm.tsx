import React from 'react';

interface SiteOptionFormProps {
  data: any;
  onChange: (data: any) => void;
}

const COMMON_OPTIONS = [
  'blogname',
  'blogdescription',
  'admin_email',
  'start_of_week',
  'use_balanceTags',
  'use_smilies',
  'require_name_email',
  'comments_notify',
  'posts_per_rss',
  'rss_use_excerpt',
  'mailserver_url',
  'mailserver_port',
  'mailserver_login',
  'mailserver_pass',
  'mailserver_protocol',
  'posts_per_page',
  'date_format',
  'time_format',
  'links_updated_date_format',
  'comment_moderation',
  'moderation_notify',
  'permalink_structure',
  'rewrite_rules',
  'hack_file',
  'blog_charset',
  'moderation_keys',
  'active_plugins',
  'category_base',
  'ping_sites',
  'comment_max_links',
  'gmt_offset',
  'default_email_category',
  'recently_edited',
  'template',
  'stylesheet',
  'comment_whitelist',
  'blacklist_keys',
  'comment_registration',
  'html_type',
  'use_trackback',
  'default_role',
  'db_version',
  'uploads_use_yearmonth_folders',
  'upload_path',
  'blog_public',
  'default_link_category',
  'show_on_front',
  'tag_base',
  'show_avatars',
  'avatar_rating',
  'upload_url_path',
  'thumbnail_size_w',
  'thumbnail_size_h',
  'thumbnail_crop',
  'medium_size_w',
  'medium_size_h',
  'avatar_default',
  'large_size_w',
  'large_size_h',
  'image_default_link_type',
  'image_default_align',
  'close_comments_for_old_posts',
  'close_comments_days_old',
  'thread_comments',
  'thread_comments_depth',
  'page_comments',
  'comments_per_page',
  'default_comments_page',
  'comment_order',
  'sticky_posts',
  'widget_categories',
  'widget_text',
  'widget_rss',
  'uninstall_plugins',
  'timezone_string',
  'page_for_posts',
  'page_on_front',
  'default_post_format',
  'link_manager_enabled',
  'finished_splitting_shared_terms',
  'site_icon',
  'medium_large_size_w',
  'medium_large_size_h',
  'wp_page_for_privacy_policy',
  'show_comments_cookies_opt_in',
  'admin_email_lifespan',
  'disallowed_keys',
  'comment_previously_approved',
  'auto_plugin_theme_update_emails',
  'auto_update_core_dev',
  'auto_update_core_minor',
  'auto_update_core_major',
];

export function SiteOptionForm({ data, onChange }: SiteOptionFormProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const parseValue = (value: string) => {
    // Try to parse as JSON for arrays/objects
    if (value.startsWith('[') || value.startsWith('{')) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    
    // Parse booleans
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Parse numbers
    if (!isNaN(Number(value)) && value !== '') {
      return Number(value);
    }
    
    return value;
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-blueprint-text mb-6">Set Site Option</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Option Name *
          </label>
          <div className="relative">
            <input
              type="text"
              list="common-options"
              value={data.option || ''}
              onChange={(e) => updateField('option', e.target.value)}
              className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent"
              placeholder="e.g., blogname, posts_per_page"
            />
            <datalist id="common-options">
              {COMMON_OPTIONS.map(option => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-blueprint-text mb-2">
            Option Value *
          </label>
          <textarea
            value={typeof data.value === 'object' ? JSON.stringify(data.value, null, 2) : (data.value || '')}
            onChange={(e) => updateField('value', parseValue(e.target.value))}
            rows={4}
            className="w-full px-3 py-2 blueprint-input rounded-md focus:outline-none focus:ring-2 focus:ring-blueprint-accent font-mono text-sm"
            placeholder="Option value (string, number, boolean, JSON object/array)"
          />
          <p className="text-xs text-blueprint-text/60 mt-1">
            Supports strings, numbers, booleans, and JSON objects/arrays
          </p>
        </div>

        <div className="blueprint-component border rounded-md p-4">
          <h3 className="text-sm font-medium text-blueprint-text mb-2">Common Options</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-blueprint-text/80">
            <div><code>blogname</code> - Site title</div>
            <div><code>blogdescription</code> - Tagline</div>
            <div><code>admin_email</code> - Admin email</div>
            <div><code>posts_per_page</code> - Posts per page</div>
            <div><code>page_on_front</code> - Static front page ID</div>
            <div><code>show_on_front</code> - posts or page</div>
          </div>
        </div>
      </div>
    </div>
  );
}