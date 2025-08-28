import React from 'react';
import { ArrowLeft, Play, FileText, Globe, Store, Briefcase, Camera, Users, Calendar, Utensils } from 'lucide-react';

interface BlueprintTemplate {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  data: {
    blueprintTitle: string;
    landingPageType: 'wp-admin' | 'front-page';
    steps: any[];
  };
}

interface BlueprintGalleryProps {
  onSelectBlueprint: (blueprintData: any) => void;
  onBack: () => void;
}

const BLUEPRINT_TEMPLATES: BlueprintTemplate[] = [
  {
    id: 'basic-blog',
    title: 'Basic Blog Setup',
    description: 'A simple blog with sample posts, pages, and navigation menu',
    icon: FileText,
    color: 'blue',
    data: {
      blueprintTitle: 'My Awesome Blog',
      landingPageType: 'front-page' as const,
      steps: [
        {
          id: 'blog-home-page',
          type: 'addPage',
          data: {
            postTitle: 'Home',
            postContent: '<!-- wp:heading {"level":1} --><h1>Welcome to My Blog</h1><!-- /wp:heading --><!-- wp:paragraph --><p>This is where I share my thoughts and experiences.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'blog-about-page',
          type: 'addPage',
          data: {
            postTitle: 'About',
            postContent: '<!-- wp:heading {"level":1} --><h1>About Me</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Learn more about who I am and what I do.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'blog-post-1',
          type: 'addPost',
          data: {
            postTitle: 'My First Blog Post',
            postContent: '<!-- wp:paragraph --><p>Welcome to my blog! This is my very first post.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'blog-homepage',
          type: 'setHomepage',
          data: {
            option: 'existing',
            stepId: 'blog-home-page'
          }
        },
        {
          id: 'blog-menu',
          type: 'createNavigationMenu',
          data: {
            menuName: 'Main Navigation',
            menuLocation: 'primary',
            menuItems: [
              {
                id: 'menu-home',
                type: 'page',
                pageStepId: 'blog-home-page',
                title: 'Home'
              },
              {
                id: 'menu-about',
                type: 'page',
                pageStepId: 'blog-about-page',
                title: 'About'
              }
            ]
          }
        }
      ]
    }
  },
  {
    id: 'business-website',
    title: 'Business Website',
    description: 'Professional business site with services and contact pages',
    icon: Briefcase,
    color: 'green',
    data: {
      blueprintTitle: 'Acme Business Solutions',
      landingPageType: 'front-page' as const,
      steps: [
        {
          id: 'biz-home',
          type: 'addPage',
          data: {
            postTitle: 'Home',
            postContent: '<!-- wp:heading {"level":1} --><h1>Welcome to Acme Business Solutions</h1><!-- /wp:heading --><!-- wp:paragraph --><p>We provide innovative solutions for modern businesses.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'biz-services',
          type: 'addPage',
          data: {
            postTitle: 'Our Services',
            postContent: '<!-- wp:heading {"level":1} --><h1>Our Services</h1><!-- /wp:heading --><!-- wp:list --><ul><li>Consulting</li><li>Implementation</li><li>Support</li></ul><!-- /wp:list -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'biz-contact',
          type: 'addPage',
          data: {
            postTitle: 'Contact Us',
            postContent: '<!-- wp:heading {"level":1} --><h1>Get in Touch</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Email: info@acmebusiness.com<br>Phone: (555) 123-4567</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'biz-homepage',
          type: 'setHomepage',
          data: {
            option: 'existing',
            stepId: 'biz-home'
          }
        },
        {
          id: 'biz-menu',
          type: 'createNavigationMenu',
          data: {
            menuName: 'Business Menu',
            menuLocation: 'primary',
            menuItems: [
              {
                id: 'menu-home',
                type: 'page',
                pageStepId: 'biz-home',
                title: 'Home'
              },
              {
                id: 'menu-services',
                type: 'page',
                pageStepId: 'biz-services',
                title: 'Services'
              },
              {
                id: 'menu-contact',
                type: 'page',
                pageStepId: 'biz-contact',
                title: 'Contact'
              }
            ]
          }
        }
      ]
    }
  },
  {
    id: 'portfolio-site',
    title: 'Creative Portfolio',
    description: 'Showcase your creative work with a stunning portfolio layout',
    icon: Camera,
    color: 'purple',
    data: {
      blueprintTitle: 'Creative Portfolio',
      landingPageType: 'front-page' as const,
      steps: [
        {
          id: 'portfolio-home',
          type: 'addPage',
          data: {
            postTitle: 'Portfolio',
            postContent: '<!-- wp:heading {"level":1} --><h1>My Creative Work</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Welcome to my portfolio. Here you\'ll find my latest creative projects.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'portfolio-about',
          type: 'addPage',
          data: {
            postTitle: 'About',
            postContent: '<!-- wp:heading {"level":1} --><h1>About the Artist</h1><!-- /wp:heading --><!-- wp:paragraph --><p>I\'m a passionate creative professional with years of experience.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'portfolio-media',
          type: 'addMedia',
          data: {
            downloadUrl: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg',
            title: 'Featured Artwork',
            altText: 'Beautiful creative artwork'
          }
        },
        {
          id: 'portfolio-homepage',
          type: 'setHomepage',
          data: {
            option: 'existing',
            stepId: 'portfolio-home'
          }
        }
      ]
    }
  },
  {
    id: 'ecommerce-ready',
    title: 'E-commerce Ready',
    description: 'WooCommerce-powered online store with essential pages',
    icon: Store,
    color: 'orange',
    data: {
      blueprintTitle: 'My Online Store',
      landingPageType: 'front-page' as const,
      steps: [
        {
          id: 'store-plugin',
          type: 'installPlugin',
          data: {
            pluginZipFile: {
              resource: 'wordpress.org/plugins',
              'wordpress.org/plugins': 'woocommerce'
            },
            options: { activate: true }
          }
        },
        {
          id: 'store-home',
          type: 'addPage',
          data: {
            postTitle: 'Shop Home',
            postContent: '<!-- wp:heading {"level":1} --><h1>Welcome to Our Store</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Discover amazing products at great prices.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'store-about',
          type: 'addPage',
          data: {
            postTitle: 'About Our Store',
            postContent: '<!-- wp:heading {"level":1} --><h1>Our Story</h1><!-- /wp:heading --><!-- wp:paragraph --><p>We\'re passionate about providing quality products.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'store-homepage',
          type: 'setHomepage',
          data: {
            option: 'existing',
            stepId: 'store-home'
          }
        }
      ]
    }
  },
  {
    id: 'landing-page',
    title: 'Marketing Landing',
    description: 'High-converting single-page marketing site',
    icon: Globe,
    color: 'red',
    data: {
      blueprintTitle: 'Product Launch',
      landingPageType: 'front-page' as const,
      steps: [
        {
          id: 'landing-home',
          type: 'addPage',
          data: {
            postTitle: 'Launch Page',
            postContent: '<!-- wp:heading {"level":1} --><h1>Revolutionary New Product</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Get early access to the future of technology.</p><!-- /wp:paragraph --><!-- wp:buttons --><div class="wp-block-buttons"><!-- wp:button --><div class="wp-block-button"><a class="wp-block-button__link">Sign Up Now</a></div><!-- /wp:button --></div><!-- /wp:buttons -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'landing-homepage',
          type: 'setHomepage',
          data: {
            option: 'existing',
            stepId: 'landing-home'
          }
        }
      ]
    }
  },
  {
    id: 'multi-author-blog',
    title: 'Multi-Author Blog',
    description: 'Collaborative blog with custom user roles and permissions',
    icon: Users,
    color: 'indigo',
    data: {
      blueprintTitle: 'Tech Writers Hub',
      landingPageType: 'front-page' as const,
      steps: [
        {
          id: 'writer-role',
          type: 'addClientRole',
          data: {
            name: 'Tech Writer',
            capabilities: ['read', 'edit_posts', 'edit_published_posts', 'publish_posts', 'delete_posts', 'upload_files']
          }
        },
        {
          id: 'blog-home',
          type: 'addPage',
          data: {
            postTitle: 'Tech Hub',
            postContent: '<!-- wp:heading {"level":1} --><h1>Welcome to Tech Writers Hub</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Your source for the latest in technology writing and insights.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'sample-post-1',
          type: 'addPost',
          data: {
            postTitle: 'The Future of Web Development',
            postContent: '<!-- wp:paragraph --><p>Exploring the latest trends in web development...</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'blog-homepage',
          type: 'setHomepage',
          data: {
            option: 'existing',
            stepId: 'blog-home'
          }
        }
      ]
    }
  },
  {
    id: 'event-website',
    title: 'Event Website',
    description: 'Perfect for conferences, meetups, and special events',
    icon: Calendar,
    color: 'teal',
    data: {
      blueprintTitle: 'WordCamp 2024',
      landingPageType: 'front-page' as const,
      steps: [
        {
          id: 'event-home',
          type: 'addPage',
          data: {
            postTitle: 'WordCamp 2024',
            postContent: '<!-- wp:heading {"level":1} --><h1>WordCamp 2024</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Join us for the biggest WordPress event of the year!</p><!-- /wp:paragraph --><!-- wp:paragraph --><p><strong>Date:</strong> March 15-16, 2024<br><strong>Location:</strong> Convention Center</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'event-schedule',
          type: 'addPage',
          data: {
            postTitle: 'Schedule',
            postContent: '<!-- wp:heading {"level":1} --><h1>Event Schedule</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Day 1: March 15<br>9:00 AM - Registration<br>10:00 AM - Keynote</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'event-speakers',
          type: 'addPage',
          data: {
            postTitle: 'Speakers',
            postContent: '<!-- wp:heading {"level":1} --><h1>Featured Speakers</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Meet our amazing lineup of WordPress experts.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'event-homepage',
          type: 'setHomepage',
          data: {
            option: 'existing',
            stepId: 'event-home'
          }
        },
        {
          id: 'event-menu',
          type: 'createNavigationMenu',
          data: {
            menuName: 'Event Menu',
            menuLocation: 'primary',
            menuItems: [
              {
                id: 'menu-home',
                type: 'page',
                pageStepId: 'event-home',
                title: 'Home'
              },
              {
                id: 'menu-schedule',
                type: 'page',
                pageStepId: 'event-schedule',
                title: 'Schedule'
              },
              {
                id: 'menu-speakers',
                type: 'page',
                pageStepId: 'event-speakers',
                title: 'Speakers'
              }
            ]
          }
        }
      ]
    }
  },
  {
    id: 'restaurant-site',
    title: 'Restaurant Website',
    description: 'Delicious website for restaurants with menu and contact info',
    icon: Utensils,
    color: 'yellow',
    data: {
      blueprintTitle: 'Bella Vista Restaurant',
      landingPageType: 'front-page' as const,
      steps: [
        {
          id: 'restaurant-home',
          type: 'addPage',
          data: {
            postTitle: 'Welcome',
            postContent: '<!-- wp:heading {"level":1} --><h1>Bella Vista Restaurant</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Experience authentic Italian cuisine in the heart of the city.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'restaurant-menu',
          type: 'addPage',
          data: {
            postTitle: 'Our Menu',
            postContent: '<!-- wp:heading {"level":1} --><h1>Our Menu</h1><!-- /wp:heading --><!-- wp:heading {"level":2} --><h2>Appetizers</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Bruschetta - $8<br>Calamari - $12</p><!-- /wp:paragraph --><!-- wp:heading {"level":2} --><h2>Main Courses</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Spaghetti Carbonara - $18<br>Chicken Parmigiana - $22</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'restaurant-contact',
          type: 'addPage',
          data: {
            postTitle: 'Contact & Hours',
            postContent: '<!-- wp:heading {"level":1} --><h1>Visit Us</h1><!-- /wp:heading --><!-- wp:paragraph --><p><strong>Address:</strong> 123 Main Street, Downtown<br><strong>Phone:</strong> (555) 123-FOOD<br><strong>Hours:</strong> Mon-Sun 5PM-11PM</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'restaurant-homepage',
          type: 'setHomepage',
          data: {
            option: 'existing',
            stepId: 'restaurant-home'
          }
        },
        {
          id: 'restaurant-menu-nav',
          type: 'createNavigationMenu',
          data: {
            menuName: 'Restaurant Menu',
            menuLocation: 'primary',
            menuItems: [
              {
                id: 'menu-home',
                type: 'page',
                pageStepId: 'restaurant-home',
                title: 'Home'
              },
              {
                id: 'menu-menu',
                type: 'page',
                pageStepId: 'restaurant-menu',
                title: 'Menu'
              },
              {
                id: 'menu-contact',
                type: 'page',
                pageStepId: 'restaurant-contact',
                title: 'Contact'
              }
            ]
          }
        }
      ]
    }
  },
  {
    id: 'agency-website',
    title: 'Digital Agency',
    description: 'Professional agency site with services and portfolio',
    icon: Briefcase,
    color: 'gray',
    data: {
      blueprintTitle: 'Digital Dreams Agency',
      landingPageType: 'front-page' as const,
      steps: [
        {
          id: 'agency-home',
          type: 'addPage',
          data: {
            postTitle: 'Home',
            postContent: '<!-- wp:heading {"level":1} --><h1>Digital Dreams Agency</h1><!-- /wp:heading --><!-- wp:paragraph --><p>We create digital experiences that drive results for your business.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'agency-services',
          type: 'addPage',
          data: {
            postTitle: 'Services',
            postContent: '<!-- wp:heading {"level":1} --><h1>Our Services</h1><!-- /wp:heading --><!-- wp:list --><ul><li>Web Design & Development</li><li>Digital Marketing</li><li>Brand Strategy</li><li>SEO Optimization</li></ul><!-- /wp:list -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'agency-portfolio',
          type: 'addPage',
          data: {
            postTitle: 'Portfolio',
            postContent: '<!-- wp:heading {"level":1} --><h1>Our Work</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Check out some of our recent client projects and success stories.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'agency-team',
          type: 'addPage',
          data: {
            postTitle: 'Team',
            postContent: '<!-- wp:heading {"level":1} --><h1>Meet Our Team</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Our talented team of designers, developers, and strategists.</p><!-- /wp:paragraph -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'agency-homepage',
          type: 'setHomepage',
          data: {
            option: 'existing',
            stepId: 'agency-home'
          }
        },
        {
          id: 'agency-menu',
          type: 'createNavigationMenu',
          data: {
            menuName: 'Agency Menu',
            menuLocation: 'primary',
            menuItems: [
              {
                id: 'menu-home',
                type: 'page',
                pageStepId: 'agency-home',
                title: 'Home'
              },
              {
                id: 'menu-services',
                type: 'page',
                pageStepId: 'agency-services',
                title: 'Services'
              },
              {
                id: 'menu-portfolio',
                type: 'page',
                pageStepId: 'agency-portfolio',
                title: 'Portfolio'
              },
              {
                id: 'menu-team',
                type: 'page',
                pageStepId: 'agency-team',
                title: 'Team'
              }
            ]
          }
        }
      ]
    }
  }
];

export function BlueprintGallery({ onSelectBlueprint, onBack }: BlueprintGalleryProps) {
  const handleSelectBlueprint = (template: BlueprintTemplate) => {
    // Store blueprint data and signal to load it
    localStorage.setItem('loadBlueprint', JSON.stringify(template.data));
    onSelectBlueprint(template.data);
  };

  return (
    <div className="min-h-screen bg-blueprint-paper blueprint-grid relative">
      {/* Header */}
      <div className="blueprint-paper border-b border-blueprint-accent/30 sticky top-0 z-50 backdrop-blur-lg">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 blueprint-button rounded-lg transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Builder
              </button>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-blueprint-text">Blueprint Gallery</h1>
                <p className="text-xs lg:text-sm text-blueprint-text/70">Choose a template to get started</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-blueprint-text mb-4">
            Pre-Built WordPress Blueprints
          </h2>
          <p className="text-blueprint-text/80 max-w-2xl mx-auto">
            Select from our collection of professionally designed WordPress setups. 
            Each blueprint includes pages, posts, plugins, and configurations ready to launch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLUEPRINT_TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                onClick={() => handleSelectBlueprint(template)}
                className="blueprint-component border-2 border-blueprint-grid/50 hover:border-blueprint-accent/70 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group backdrop-blur-sm"
              >
                {/* Blueprint-style header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 blueprint-accent rounded-xl flex items-center justify-center shadow-lg border border-blueprint-accent/50 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-blueprint-paper" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blueprint-accent opacity-60">
                    <div className="w-2 h-2 rounded-full blueprint-accent"></div>
                    <div className="w-2 h-2 rounded-full blueprint-accent"></div>
                    <div className="w-2 h-2 rounded-full blueprint-accent"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-blueprint-text mb-2 group-hover:text-blueprint-accent transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-sm text-blueprint-text/70 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Blueprint-style footer */}
                <div className="flex items-center justify-between pt-4 border-t border-blueprint-grid/30">
                  <div className="text-xs text-blueprint-text/60">
                    {template.data.steps.length} steps
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blueprint-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-3 h-3" />
                    <span>Load Blueprint</span>
                  </div>
                </div>

                {/* Blueprint-style decorative elements */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 right-2 w-16 h-8 blueprint-grid/20 rounded-lg opacity-50"></div>
                  <div className="absolute bottom-2 left-2 w-8 h-4 blueprint-grid/20 rounded opacity-30"></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="blueprint-component border rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blueprint-text mb-2">
              Can't find what you're looking for?
            </h3>
            <p className="text-sm text-blueprint-text/70 mb-4">
              Start with a blank blueprint and create your own custom WordPress setup from scratch.
            </p>
            <button
              onClick={onBack}
              className="blueprint-button px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Start from Scratch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}