import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import type { SEOConfig } from '../types';

interface SEOContextType {
  config: SEOConfig;
  isDevelopment: boolean;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

/**
 * SEOProvider - Wraps the entire application with SEO context and react-helmet-async
 *
 * Usage:
 * ```tsx
 * <SEOProvider config={seoConfig}>
 *   <App />
 * </SEOProvider>
 * ```
 */
interface SEOProviderProps {
  config: SEOConfig;
  children: ReactNode;
}

export const SEOProvider: React.FC<SEOProviderProps> = ({ config, children }) => {
  const isDevelopment = config.environment === 'development';

  // Validate configuration in development
  useMemo(() => {
    if (isDevelopment) {
      const warnings: string[] = [];

      if (!config.hostname) {
        warnings.push('SEOConfig: hostname is required');
      }

      if (!config.appName) {
        warnings.push('SEOConfig: appName is required');
      }

      if (!config.routes || config.routes.length === 0) {
        warnings.push('SEOConfig: routes array is empty or not defined');
      }

      if (warnings.length > 0) {
        console.warn('[SEO Kit] Configuration warnings:', warnings);
      }
    }
  }, [config, isDevelopment]);

  const contextValue = useMemo<SEOContextType>(
    () => ({
      config,
      isDevelopment,
    }),
    [config, isDevelopment]
  );

  return (
    <HelmetProvider>
      <SEOContext.Provider value={contextValue}>
        {children}
      </SEOContext.Provider>
    </HelmetProvider>
  );
};

/**
 * useSEOContext - Hook to access SEO context values
 * @internal Use useSEO() for SEO data injection instead
 */
export const useSEOContext = (): SEOContextType => {
  const context = useContext(SEOContext);
  if (!context) {
    throw new Error('useSEOContext must be used within SEOProvider');
  }
  return context;
};
