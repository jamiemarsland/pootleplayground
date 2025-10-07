import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, FileText, Globe, Store, Briefcase, Camera, Users, Calendar, Utensils, Database, Trash2, Shield, ThumbsUp } from 'lucide-react';
import { supabase, BlueprintRecord } from '../lib/supabase';
import { isAdminAuthenticated, promptAdminPassword, clearAdminSession } from '../utils/adminAuth';

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
          id: 'agency-theme',
          type: 'installTheme',
          data: {
            themeZipFile: {
              resource: 'wordpress.org/themes',
              'wordpress.org/themes': 'twentytwentyfour'
            },
            options: { activate: true }
          }
        },
        {
          id: 'agency-media-logo',
          type: 'addMedia',
          data: {
            downloadUrl: 'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg',
            title: 'Agency Logo',
            altText: 'Digital Dreams Agency Logo'
          }
        },
        {
          id: 'agency-media-hero',
          type: 'addMedia',
          data: {
            downloadUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
            title: 'Agency Hero Image',
            altText: 'Creative team working on digital projects'
          }
        },
        {
          id: 'agency-media-portfolio1',
          type: 'addMedia',
          data: {
            downloadUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg',
            title: 'Portfolio Project 1',
            altText: 'Modern website design showcase'
          }
        },
        {
          id: 'agency-media-portfolio2',
          type: 'addMedia',
          data: {
            downloadUrl: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg',
            title: 'Portfolio Project 2',
            altText: 'Brand identity design project'
          }
        },
        {
          id: 'agency-media-team',
          type: 'addMedia',
          data: {
            downloadUrl: 'https://images.pexels.com/photos/1367276/pexels-photo-1367276.jpeg',
            title: 'Agency Team Photo',
            altText: 'Digital Dreams Agency team members'
          }
        },
        {
          id: 'agency-home',
          type: 'addPage',
          data: {
            postTitle: 'Home',
            postContent: '<!-- wp:cover {"url":"https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg","id":4,"dimRatio":40,"overlayColor":"black","focalPoint":{"x":0.5,"y":0.3},"minHeight":80,"minHeightUnit":"vh","contentPosition":"center center","isDark":false} --><div class="wp-block-cover is-light" style="min-height:80vh"><span aria-hidden="true" class="wp-block-cover__background has-black-background-color has-background-dim-40"></span><img class="wp-block-cover__image-background wp-image-4" alt="" src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg" style="object-position:50% 30%" data-object-fit="cover" data-object-position="50% 30%"/><div class="wp-block-cover__inner-container"><!-- wp:heading {"textAlign":"center","level":1,"fontSize":"xx-large"} --><h1 class="wp-block-heading has-text-align-center has-xx-large-font-size">Digital Dreams Agency</h1><!-- /wp:heading --><!-- wp:paragraph {"align":"center","fontSize":"large"} --><p class="has-text-align-center has-large-font-size">We create digital experiences that drive results for your business</p><!-- /wp:paragraph --><!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} --><div class="wp-block-buttons"><!-- wp:button {"backgroundColor":"primary","textColor":"white","style":{"border":{"radius":"50px"},"spacing":{"padding":{"left":"2rem","right":"2rem","top":"1rem","bottom":"1rem"}}}} --><div class="wp-block-button"><a class="wp-block-button__link has-white-color has-primary-background-color has-text-color has-background wp-element-button" href="#contact" style="border-radius:50px;padding-top:1rem;padding-right:2rem;padding-bottom:1rem;padding-left:2rem">Start Your Project</a></div><!-- /wp:button --></div><!-- /wp:buttons --></div></div><!-- /wp:cover --><!-- wp:group {"style":{"spacing":{"padding":{"top":"4rem","bottom":"4rem"}}},"layout":{"type":"constrained"}} --><div class="wp-block-group" style="padding-top:4rem;padding-bottom:4rem"><!-- wp:heading {"textAlign":"center","level":2} --><h2 class="wp-block-heading has-text-align-center">What We Do</h2><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">From concept to launch, we deliver digital solutions that exceed expectations</p><!-- /wp:paragraph --><!-- wp:columns {"style":{"spacing":{"margin":{"top":"3rem"}}}} --><div class="wp-block-columns" style="margin-top:3rem"><!-- wp:column {"style":{"spacing":{"padding":{"top":"2rem","bottom":"2rem","left":"1.5rem","right":"1.5rem"}},"border":{"width":"1px","style":"solid","color":"#e2e8f0","radius":"12px"}}} --><div class="wp-block-column has-border-color" style="border-color:#e2e8f0;border-style:solid;border-width:1px;border-radius:12px;padding-top:2rem;padding-right:1.5rem;padding-bottom:2rem;padding-left:1.5rem"><!-- wp:heading {"textAlign":"center","level":3} --><h3 class="wp-block-heading has-text-align-center">🎨 Design</h3><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">Beautiful, user-centered design that converts visitors into customers</p><!-- /wp:paragraph --></div><!-- /wp:column --><!-- wp:column {"style":{"spacing":{"padding":{"top":"2rem","bottom":"2rem","left":"1.5rem","right":"1.5rem"}},"border":{"width":"1px","style":"solid","color":"#e2e8f0","radius":"12px"}}} --><div class="wp-block-column has-border-color" style="border-color:#e2e8f0;border-style:solid;border-width:1px;border-radius:12px;padding-top:2rem;padding-right:1.5rem;padding-bottom:2rem;padding-left:1.5rem"><!-- wp:heading {"textAlign":"center","level":3} --><h3 class="wp-block-heading has-text-align-center">⚡ Development</h3><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">Fast, secure, and scalable web applications built with modern technology</p><!-- /wp:paragraph --></div><!-- /wp:column --><!-- wp:column {"style":{"spacing":{"padding":{"top":"2rem","bottom":"2rem","left":"1.5rem","right":"1.5rem"}},"border":{"width":"1px","style":"solid","color":"#e2e8f0","radius":"12px"}}} --><div class="wp-block-column has-border-color" style="border-color:#e2e8f0;border-style:solid;border-width:1px;border-radius:12px;padding-top:2rem;padding-right:1.5rem;padding-bottom:2rem;padding-left:1.5rem"><!-- wp:heading {"textAlign":"center","level":3} --><h3 class="wp-block-heading has-text-align-center">📈 Strategy</h3><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">Data-driven digital strategies that grow your business and reach your goals</p><!-- /wp:paragraph --></div><!-- /wp:column --></div><!-- /wp:columns --></div><!-- /wp:group -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'agency-services',
          type: 'addPage',
          data: {
            postTitle: 'Services',
            postContent: '<!-- wp:group {"style":{"spacing":{"padding":{"top":"3rem","bottom":"3rem"}}},"layout":{"type":"constrained"}} --><div class="wp-block-group" style="padding-top:3rem;padding-bottom:3rem"><!-- wp:heading {"textAlign":"center","level":1} --><h1 class="wp-block-heading has-text-align-center">Our Services</h1><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">Comprehensive digital solutions tailored to your business needs</p><!-- /wp:paragraph --></div><!-- /wp:group --><!-- wp:group {"style":{"spacing":{"padding":{"top":"2rem","bottom":"4rem"}}},"layout":{"type":"constrained"}} --><div class="wp-block-group" style="padding-top:2rem;padding-bottom:4rem"><!-- wp:columns {"style":{"spacing":{"blockGap":{"top":"3rem","left":"3rem"}}}} --><div class="wp-block-columns"><!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":3,"style":{"color":{"text":"#2563eb"}}} --><h3 class="wp-block-heading has-text-color" style="color:#2563eb">🌐 Web Development</h3><!-- /wp:heading --><!-- wp:paragraph --><p>Custom websites and web applications built with modern frameworks. We create fast, secure, and scalable solutions that grow with your business.</p><!-- /wp:paragraph --><!-- wp:list --><ul><li>Custom WordPress Development</li><li>E-commerce Solutions</li><li>Progressive Web Apps</li><li>API Integration</li></ul><!-- /wp:list --></div><!-- /wp:column --><!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":3,"style":{"color":{"text":"#2563eb"}}} --><h3 class="wp-block-heading has-text-color" style="color:#2563eb">🎨 UI/UX Design</h3><!-- /wp:heading --><!-- wp:paragraph --><p>User-centered design that converts. We craft beautiful interfaces that provide exceptional user experiences across all devices.</p><!-- /wp:paragraph --><!-- wp:list --><ul><li>User Interface Design</li><li>User Experience Research</li><li>Prototyping & Wireframing</li><li>Design Systems</li></ul><!-- /wp:list --></div><!-- /wp:column --></div><!-- /wp:columns --><!-- wp:columns {"style":{"spacing":{"blockGap":{"top":"3rem","left":"3rem"},"margin":{"top":"3rem"}}}} --><div class="wp-block-columns" style="margin-top:3rem"><!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":3,"style":{"color":{"text":"#2563eb"}}} --><h3 class="wp-block-heading has-text-color" style="color:#2563eb">📱 Digital Marketing</h3><!-- /wp:heading --><!-- wp:paragraph --><p>Data-driven marketing strategies that deliver results. We help you reach your target audience and convert them into loyal customers.</p><!-- /wp:paragraph --><!-- wp:list --><ul><li>SEO & Content Strategy</li><li>Social Media Marketing</li><li>PPC Campaign Management</li><li>Email Marketing</li></ul><!-- /wp:list --></div><!-- /wp:column --><!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":3,"style":{"color":{"text":"#2563eb"}}} --><h3 class="wp-block-heading has-text-color" style="color:#2563eb">🚀 Brand Strategy</h3><!-- /wp:heading --><!-- wp:paragraph --><p>Complete brand identity development from concept to implementation. We help define your brand voice and visual identity.</p><!-- /wp:paragraph --><!-- wp:list --><ul><li>Brand Identity Design</li><li>Logo & Visual Assets</li><li>Brand Guidelines</li><li>Marketing Collateral</li></ul><!-- /wp:list --></div><!-- /wp:column --></div><!-- /wp:columns --></div><!-- /wp:group -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'agency-portfolio',
          type: 'addPage',
          data: {
            postTitle: 'Portfolio',
            postContent: '<!-- wp:group {"style":{"spacing":{"padding":{"top":"3rem","bottom":"3rem"}}},"layout":{"type":"constrained"}} --><div class="wp-block-group" style="padding-top:3rem;padding-bottom:3rem"><!-- wp:heading {"textAlign":"center","level":1} --><h1 class="wp-block-heading has-text-align-center">Our Portfolio</h1><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">Discover how we\'ve helped businesses transform their digital presence</p><!-- /wp:paragraph --></div><!-- /wp:group --><!-- wp:group {"style":{"spacing":{"padding":{"top":"2rem","bottom":"4rem"}}},"layout":{"type":"constrained"}} --><div class="wp-block-group" style="padding-top:2rem;padding-bottom:4rem"><!-- wp:columns {"style":{"spacing":{"blockGap":{"top":"2rem","left":"2rem"}}}} --><div class="wp-block-columns"><!-- wp:column --><div class="wp-block-column"><!-- wp:image {"id":6,"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"8px"}}} --><figure class="wp-block-image size-large has-custom-border"><img src="https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg" alt="Modern website design showcase" class="wp-image-6" style="border-radius:8px"/></figure><!-- /wp:image --><!-- wp:heading {"level":3} --><h3 class="wp-block-heading">E-commerce Platform</h3><!-- /wp:heading --><!-- wp:paragraph --><p>A complete e-commerce solution that increased online sales by 300% for a local retailer.</p><!-- /wp:paragraph --><!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"},"color":{"text":"#64748b"}}} --><p class="has-text-color" style="color:#64748b;font-size:14px"><strong>Technologies:</strong> WordPress, WooCommerce, Custom Theme</p><!-- /wp:paragraph --></div><!-- /wp:column --><!-- wp:column --><div class="wp-block-column"><!-- wp:image {"id":7,"sizeSlug":"large","linkDestination":"none","style":{"border":{"radius":"8px"}}} --><figure class="wp-block-image size-large has-custom-border"><img src="https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg" alt="Brand identity design project" class="wp-image-7" style="border-radius:8px"/></figure><!-- /wp:image --><!-- wp:heading {"level":3} --><h3 class="wp-block-heading">Brand Identity Redesign</h3><!-- /wp:heading --><!-- wp:paragraph --><p>Complete brand overhaul for a tech startup, including logo, website, and marketing materials.</p><!-- /wp:paragraph --><!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"},"color":{"text":"#64748b"}}} --><p class="has-text-color" style="color:#64748b;font-size:14px"><strong>Services:</strong> Brand Strategy, Logo Design, Web Design</p><!-- /wp:paragraph --></div><!-- /wp:column --></div><!-- /wp:columns --><!-- wp:separator {"style":{"spacing":{"margin":{"top":"3rem","bottom":"3rem"}}}} --><hr class="wp-block-separator has-alpha-channel-opacity" style="margin-top:3rem;margin-bottom:3rem"/><!-- /wp:separator --><!-- wp:heading {"textAlign":"center","level":2} --><h2 class="wp-block-heading has-text-align-center">Ready to Start Your Project?</h2><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">Let\'s discuss how we can help transform your digital presence</p><!-- /wp:paragraph --><!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"2rem"}}}} --><div class="wp-block-buttons" style="margin-top:2rem"><!-- wp:button {"backgroundColor":"primary","textColor":"white"} --><div class="wp-block-button"><a class="wp-block-button__link has-white-color has-primary-background-color has-text-color has-background wp-element-button" href="/contact">Get In Touch</a></div><!-- /wp:button --></div><!-- /wp:buttons --></div><!-- /wp:group -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'agency-team',
          type: 'addPage',
          data: {
            postTitle: 'Team',
            postContent: '<!-- wp:group {"style":{"spacing":{"padding":{"top":"3rem","bottom":"3rem"}}},"layout":{"type":"constrained"}} --><div class="wp-block-group" style="padding-top:3rem;padding-bottom:3rem"><!-- wp:heading {"textAlign":"center","level":1} --><h1 class="wp-block-heading has-text-align-center">Meet Our Team</h1><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">Passionate professionals dedicated to delivering exceptional digital experiences</p><!-- /wp:paragraph --></div><!-- /wp:group --><!-- wp:group {"style":{"spacing":{"padding":{"top":"2rem","bottom":"4rem"}}},"layout":{"type":"constrained"}} --><div class="wp-block-group" style="padding-top:2rem;padding-bottom:4rem"><!-- wp:image {"align":"center","id":8,"width":300,"height":200,"sizeSlug":"medium","linkDestination":"none","style":{"border":{"radius":"12px"}}} --><figure class="wp-block-image aligncenter size-medium is-resized has-custom-border"><img src="https://images.pexels.com/photos/1367276/pexels-photo-1367276.jpeg" alt="Digital Dreams Agency team members" class="wp-image-8" style="border-radius:12px;width:300px;height:200px"/></figure><!-- /wp:image --><!-- wp:heading {"textAlign":"center","level":2,"style":{"spacing":{"margin":{"top":"2rem"}}}} --><h2 class="wp-block-heading has-text-align-center" style="margin-top:2rem">Our Values</h2><!-- /wp:heading --><!-- wp:columns {"style":{"spacing":{"margin":{"top":"2rem"}}}} --><div class="wp-block-columns" style="margin-top:2rem"><!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"textAlign":"center","level":3} --><h3 class="wp-block-heading has-text-align-center">🎯 Purpose-Driven</h3><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">We believe every project should have a clear purpose and measurable impact on your business goals.</p><!-- /wp:paragraph --></div><!-- /wp:column --><!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"textAlign":"center","level":3} --><h3 class="wp-block-heading has-text-align-center">🤝 Collaborative</h3><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">Your success is our success. We work closely with you throughout every step of the process.</p><!-- /wp:paragraph --></div><!-- /wp:column --><!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"textAlign":"center","level":3} --><h3 class="wp-block-heading has-text-align-center">⚡ Innovative</h3><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">We stay ahead of digital trends to ensure your brand remains competitive and relevant.</p><!-- /wp:paragraph --></div><!-- /wp:column --></div><!-- /wp:columns --><!-- wp:separator {"style":{"spacing":{"margin":{"top":"3rem","bottom":"3rem"}}}} --><hr class="wp-block-separator has-alpha-channel-opacity" style="margin-top:3rem;margin-bottom:3rem"/><!-- /wp:separator --><!-- wp:heading {"textAlign":"center","level":2} --><h2 class="wp-block-heading has-text-align-center">Join Our Team</h2><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">We\'re always looking for talented individuals who share our passion for digital excellence.</p><!-- /wp:paragraph --><!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"2rem"}}}} --><div class="wp-block-buttons" style="margin-top:2rem"><!-- wp:button {"style":{"color":{"background":"#1f2937","text":"#ffffff"}}} --><div class="wp-block-button"><a class="wp-block-button__link has-text-color has-background wp-element-button" href="mailto:careers@digitaldreams.com" style="color:#ffffff;background-color:#1f2937">View Open Positions</a></div><!-- /wp:button --></div><!-- /wp:buttons --></div><!-- /wp:group -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'agency-contact',
          type: 'addPage',
          data: {
            postTitle: 'Contact',
            postContent: '<!-- wp:group {"style":{"spacing":{"padding":{"top":"3rem","bottom":"3rem"}}},"layout":{"type":"constrained"}} --><div class="wp-block-group" style="padding-top:3rem;padding-bottom:3rem"><!-- wp:heading {"textAlign":"center","level":1} --><h1 class="wp-block-heading has-text-align-center">Get In Touch</h1><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">Ready to transform your digital presence? Let\'s start a conversation about your project.</p><!-- /wp:paragraph --></div><!-- /wp:group --><!-- wp:group {"style":{"spacing":{"padding":{"top":"2rem","bottom":"4rem"}}},"layout":{"type":"constrained"}} --><div class="wp-block-group" style="padding-top:2rem;padding-bottom:4rem"><!-- wp:columns {"style":{"spacing":{"blockGap":{"top":"3rem","left":"3rem"}}}} --><div class="wp-block-columns"><!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":3} --><h3 class="wp-block-heading">📍 Visit Our Studio</h3><!-- /wp:heading --><!-- wp:paragraph --><p><strong>Digital Dreams Agency</strong><br>123 Creative Boulevard<br>Suite 456<br>Innovation District<br>San Francisco, CA 94102</p><!-- /wp:paragraph --><!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"2rem"}}}} --><h3 class="wp-block-heading" style="margin-top:2rem">📞 Call Us</h3><!-- /wp:heading --><!-- wp:paragraph --><p><strong>Phone:</strong> (555) 123-DREAM<br><strong>Email:</strong> hello@digitaldreams.com</p><!-- /wp:paragraph --></div><!-- /wp:column --><!-- wp:column --><div class="wp-block-column"><!-- wp:heading {"level":3} --><h3 class="wp-block-heading">💬 Start a Project</h3><!-- /wp:heading --><!-- wp:paragraph --><p>Ready to bring your vision to life? Fill out our project brief and we\'ll get back to you within 24 hours.</p><!-- /wp:paragraph --><!-- wp:buttons {"style":{"spacing":{"margin":{"top":"1.5rem"}}}} --><div class="wp-block-buttons" style="margin-top:1.5rem"><!-- wp:button {"backgroundColor":"primary","textColor":"white","style":{"border":{"radius":"8px"}}} --><div class="wp-block-button"><a class="wp-block-button__link has-white-color has-primary-background-color has-text-color has-background wp-element-button" href="mailto:hello@digitaldreams.com" style="border-radius:8px">Send Us a Message</a></div><!-- /wp:button --></div><!-- /wp:buttons --><!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"2rem"}}}} --><h3 class="wp-block-heading" style="margin-top:2rem">⏰ Office Hours</h3><!-- /wp:heading --><!-- wp:paragraph --><p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM PST<br><strong>Weekend:</strong> By appointment only</p><!-- /wp:paragraph --></div><!-- /wp:column --></div><!-- /wp:columns --><!-- wp:separator {"style":{"spacing":{"margin":{"top":"3rem","bottom":"3rem"}}}} --><hr class="wp-block-separator has-alpha-channel-opacity" style="margin-top:3rem;margin-bottom:3rem"/><!-- /wp:separator --><!-- wp:heading {"textAlign":"center","level":2} --><h2 class="wp-block-heading has-text-align-center">Follow Our Journey</h2><!-- /wp:heading --><!-- wp:paragraph {"align":"center"} --><p class="has-text-align-center">Stay updated with our latest projects and insights</p><!-- /wp:paragraph --><!-- wp:social-links {"iconColor":"primary","iconColorValue":"#2563eb","size":"has-large-icon-size","className":"is-style-logos-only","layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"2rem"}}}} --><ul class="wp-block-social-links has-large-icon-size has-icon-color is-style-logos-only" style="margin-top:2rem"><!-- wp:social-link {"url":"#","service":"twitter"} --><li class="wp-block-social-link wp-social-link-twitter has-primary-color"><a href="#" class="wp-block-social-link-anchor"><svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"></path></svg><span class="wp-block-social-link-label screen-reader-text">Twitter</span></a></li><!-- /wp:social-link --><!-- wp:social-link {"url":"#","service":"instagram"} --><li class="wp-block-social-link wp-social-link-instagram has-primary-color"><a href="#" class="wp-block-social-link-anchor"><svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.234,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z"></path></svg><span class="wp-block-social-link-label screen-reader-text">Instagram</span></a></li><!-- /wp:social-link --><!-- wp:social-link {"url":"#","service":"linkedin"} --><li class="wp-block-social-link wp-social-link-linkedin has-primary-color"><a href="#" class="wp-block-social-link-anchor"><svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M19.7,3H4.3C3.582,3,3,3.582,3,4.3v15.4C3,20.418,3.582,21,4.3,21h15.4c0.718,0,1.3-0.582,1.3-1.3V4.3 C21,3.582,20.418,3,19.7,3z M8.339,18.338H5.667v-8.59h2.672V18.338z M7.004,8.574c-0.857,0-1.549-0.694-1.549-1.548 c0-0.855,0.691-1.548,1.549-1.548c0.854,0,1.547,0.694,1.547,1.548C8.551,7.881,7.858,8.574,7.004,8.574z M18.339,18.338h-2.669 v-4.177c0-0.996-0.017-2.278-1.387-2.278c-1.389,0-1.601,1.086-1.601,2.206v4.249h-2.667v-8.59h2.559v1.174h0.037 c0.356-0.675,1.227-1.387,2.526-1.387c2.703,0,3.203,1.779,3.203,4.092V18.338z"></path></svg><span class="wp-block-social-link-label screen-reader-text">LinkedIn</span></a></li><!-- /wp:social-link --></ul><!-- /wp:social-links --></div><!-- /wp:group -->',
            postStatus: 'publish'
          }
        },
        {
          id: 'agency-blog-post-1',
          type: 'addPost',
          data: {
            postTitle: '5 Essential Web Design Trends for 2024',
            postContent: '<!-- wp:paragraph --><p>The digital landscape is constantly evolving, and staying ahead of web design trends is crucial for creating engaging user experiences. Here are the top 5 trends that are shaping web design in 2024.</p><!-- /wp:paragraph --><!-- wp:heading {"level":2} --><h2>1. Minimalist Design with Bold Typography</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Clean, minimalist layouts paired with striking typography create powerful visual impact while maintaining excellent usability.</p><!-- /wp:paragraph --><!-- wp:heading {"level":2} --><h2>2. Dark Mode Integration</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Dark mode isn\'t just a trend—it\'s becoming an expected feature that reduces eye strain and saves battery life on mobile devices.</p><!-- /wp:paragraph --><!-- wp:heading {"level":2} --><h2>3. Micro-Interactions</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Subtle animations and interactive elements provide feedback and guide users through their journey, creating more engaging experiences.</p><!-- /wp:paragraph --><!-- wp:heading {"level":2} --><h2>4. Sustainable Web Design</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Eco-friendly design practices that reduce carbon footprint are becoming increasingly important to both businesses and users.</p><!-- /wp:paragraph --><!-- wp:heading {"level":2} --><h2>5. AI-Powered Personalization</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Artificial intelligence is enabling websites to deliver personalized experiences at scale, adapting content and design to individual user preferences.</p><!-- /wp:paragraph -->',
            postStatus: 'publish',
            featuredImageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'
          }
        },
        {
          id: 'agency-blog-post-2',
          type: 'addPost',
          data: {
            postTitle: 'The ROI of Professional Web Design',
            postContent: '<!-- wp:paragraph --><p>Investing in professional web design isn\'t just about aesthetics—it\'s about driving real business results. Let\'s explore how quality design translates to measurable ROI.</p><!-- /wp:paragraph --><!-- wp:heading {"level":2} --><h2>Conversion Rate Improvements</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Well-designed websites typically see 200-400% higher conversion rates compared to poorly designed alternatives. Strategic placement of call-to-action buttons and optimized user flows make a significant difference.</p><!-- /wp:paragraph --><!-- wp:heading {"level":2} --><h2>Reduced Bounce Rates</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Professional design keeps visitors engaged longer, reducing bounce rates by up to 40%. This means more opportunities to convert visitors into customers.</p><!-- /wp:paragraph --><!-- wp:heading {"level":2} --><h2>Brand Credibility</h2><!-- /wp:heading --><!-- wp:paragraph --><p>75% of users judge a company\'s credibility based on website design alone. Professional design builds trust and confidence in your brand.</p><!-- /wp:paragraph --><!-- wp:heading {"level":2} --><h2>SEO Benefits</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Modern web design practices improve site speed, mobile responsiveness, and user experience—all factors that search engines reward with better rankings.</p><!-- /wp:paragraph -->',
            postStatus: 'publish',
            featuredImageUrl: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg'
          }
        },
        {
          id: 'agency-site-options',
          type: 'setSiteOption',
          data: {
            option: 'blogdescription',
            value: 'Creating digital experiences that drive results'
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
                id: 'menu-work',
                type: 'page',
                pageStepId: 'agency-portfolio',
                title: 'Work'
              },
              {
                id: 'menu-team',
                type: 'page',
                pageStepId: 'agency-team',
                title: 'Team'
              },
              {
                id: 'menu-contact',
                type: 'page',
                pageStepId: 'agency-contact',
                title: 'Contact'
              }
            ]
          }
        }
      ]
    }
  }
];

export function BlueprintGallery({ onSelectBlueprint, onBack }: BlueprintGalleryProps) {
  const [savedBlueprints, setSavedBlueprints] = useState<BlueprintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'community'>('templates');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminAuthenticated());
  }, []);

  useEffect(() => {
    loadSavedBlueprints();
  }, []);

  const loadSavedBlueprints = async () => {
    try {
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('is_public', true)
        .order('votes', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedBlueprints(data || []);
    } catch (error) {
      console.error('Error loading blueprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBlueprint = (template: BlueprintTemplate) => {
    localStorage.setItem('loadBlueprint', JSON.stringify(template.data));
    onSelectBlueprint(template.data);
  };

  const handleSelectSavedBlueprint = (blueprint: BlueprintRecord) => {
    localStorage.setItem('loadBlueprint', JSON.stringify(blueprint.blueprint_data));
    onSelectBlueprint(blueprint.blueprint_data);
  };

  const handleDeleteBlueprint = async (blueprintId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!isAdmin) {
      const authenticated = promptAdminPassword();
      if (!authenticated) {
        return;
      }
      setIsAdmin(true);
    }

    if (!confirm('Are you sure you want to delete this blueprint? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blueprints')
        .delete()
        .eq('id', blueprintId);

      if (error) throw error;

      setSavedBlueprints(savedBlueprints.filter(bp => bp.id !== blueprintId));
    } catch (error) {
      console.error('Error deleting blueprint:', error);
      alert('Failed to delete blueprint. Please try again.');
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      clearAdminSession();
      setIsAdmin(false);
    } else {
      const authenticated = promptAdminPassword();
      if (authenticated) {
        setIsAdmin(true);
      }
    }
  };

  const handleUpvote = async (blueprintId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    const votedKey = `voted_${blueprintId}`;
    if (localStorage.getItem(votedKey)) {
      return;
    }

    try {
      const blueprint = savedBlueprints.find(bp => bp.id === blueprintId);
      if (!blueprint) return;

      const { error } = await supabase
        .from('blueprints')
        .update({ votes: blueprint.votes + 1 })
        .eq('id', blueprintId);

      if (error) throw error;

      localStorage.setItem(votedKey, 'true');
      setSavedBlueprints(savedBlueprints.map(bp =>
        bp.id === blueprintId ? { ...bp, votes: bp.votes + 1 } : bp
      ).sort((a, b) => b.votes - a.votes));
    } catch (error) {
      console.error('Error upvoting blueprint:', error);
      alert('Failed to upvote blueprint. Please try again.');
    }
  };

  const hasVoted = (blueprintId: string) => {
    return localStorage.getItem(`voted_${blueprintId}`) !== null;
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
            <button
              onClick={handleAdminToggle}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                isAdmin
                  ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30'
                  : 'blueprint-button'
              }`}
              title={isAdmin ? 'Admin mode active' : 'Enable admin mode'}
            >
              <Shield className="w-4 h-4" />
              {isAdmin ? 'Admin' : 'Login'}
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-blueprint-text mb-4">
            Blueprint Gallery
          </h2>
          <p className="text-blueprint-text/80 max-w-2xl mx-auto">
            Select from our collection or browse community blueprints
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'templates'
                ? 'blueprint-accent text-blueprint-paper shadow-lg'
                : 'blueprint-button'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates ({BLUEPRINT_TEMPLATES.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'community'
                ? 'blueprint-accent text-blueprint-paper shadow-lg'
                : 'blueprint-button'
            }`}
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Community ({savedBlueprints.length})
            </div>
          </button>
        </div>

        {activeTab === 'templates' && (
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
        )}

        {activeTab === 'community' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-blueprint-accent/30 border-t-blueprint-accent rounded-full animate-spin"></div>
                <p className="text-blueprint-text/70 mt-4">Loading community blueprints...</p>
              </div>
            ) : savedBlueprints.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Database className="w-16 h-16 text-blueprint-accent/30 mx-auto mb-4" />
                <p className="text-blueprint-text/70">No community blueprints yet. Be the first to save one!</p>
              </div>
            ) : (
              savedBlueprints.map((blueprint) => (
                <div
                  key={blueprint.id}
                  onClick={() => handleSelectSavedBlueprint(blueprint)}
                  className="blueprint-component border-2 border-blueprint-grid/50 hover:border-blueprint-accent/70 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group backdrop-blur-sm relative"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 blueprint-accent rounded-xl flex items-center justify-center shadow-lg border border-blueprint-accent/50 group-hover:scale-110 transition-transform">
                      <Database className="w-6 h-6 text-blueprint-paper" />
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteBlueprint(blueprint.id, e)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                        title="Delete blueprint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-blueprint-text mb-2 group-hover:text-blueprint-accent transition-colors">
                      {blueprint.blueprint_data.blueprintTitle || blueprint.title}
                    </h3>
                    <p className="text-sm text-blueprint-text/70 leading-relaxed line-clamp-2">
                      {blueprint.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-blueprint-grid/30">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => handleUpvote(blueprint.id, e)}
                        disabled={hasVoted(blueprint.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                          hasVoted(blueprint.id)
                            ? 'bg-blueprint-accent/20 text-blueprint-accent cursor-not-allowed'
                            : 'blueprint-button hover:bg-blueprint-accent/10'
                        }`}
                        title={hasVoted(blueprint.id) ? 'Already voted' : 'Upvote this blueprint'}
                      >
                        <ThumbsUp className={`w-3 h-3 ${hasVoted(blueprint.id) ? 'fill-current' : ''}`} />
                        <span>{blueprint.votes}</span>
                      </button>
                      <div className="text-xs text-blueprint-text/60">
                        {blueprint.step_count} steps
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blueprint-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-3 h-3" />
                      <span>Load Blueprint</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-2 right-2 w-16 h-8 blueprint-grid/20 rounded-lg opacity-50"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-4 blueprint-grid/20 rounded opacity-30"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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