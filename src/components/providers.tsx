'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { AchievementsProvider } from '@/contexts/achievements-context';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AchievementsProvider>
                {children}
            </AchievementsProvider>
          </AuthProvider>
        </ThemeProvider>
    );
}
