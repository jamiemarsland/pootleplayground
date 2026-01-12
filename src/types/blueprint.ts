export interface Step {
  id: string;
  type: StepType;
  data: any;
}

export type StepType = 
  | 'installPlugin'
  | 'installTheme'
  | 'addPost'
  | 'addPage'
  | 'addMedia'
  | 'setSiteOption'
  | 'defineWpConfigConst'
  | 'login'
  | 'importWxr'
  | 'addClientRole'
  | 'setHomepage'
  | 'setPostsPage'
  | 'createNavigationMenu'
  | 'setLandingPage';

export interface Blueprint {
  landingPage: string;
  preferredVersions: {
    wp: string;
    php: string;
  };
  phpExtensionBundles?: string[];
  features?: {
    networking?: boolean;
    multisite?: boolean;
  };
  steps: BlueprintStep[];
}

export interface BlueprintStep {
  step: string;
  [key: string]: any;
}

export interface StepCategory {
  name: string;
  steps: StepType[];
  color: string;
}