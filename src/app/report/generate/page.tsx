'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function GenerateReportPage() {
  const router = useRouter();

  useEffect(() => {
    // This effect runs on the client-side after the page loads.
    const reportDataString = sessionStorage.getItem('reportDataForGenerate');
    
    if (reportDataString) {
      // Data found. Move it from session to local storage.
      // localStorage is shared across tabs, sessionStorage is not.
      localStorage.setItem('reportData', reportDataString);
      sessionStorage.removeItem('reportDataForGenerate');

      // Open the final report page in a new tab.
      const reportWindow = window.open('/report', '_blank');
      
      if (reportWindow) {
        // If the window opened successfully, go back to the dashboard.
        // A small delay can help ensure the new tab is fully initialized.
        setTimeout(() => {
            router.back();
        }, 500);
      } else {
        // If a popup blocker prevented the window from opening, alert the user.
        alert('Por favor, habilite pop-ups para gerar o relatório.');
        router.back();
      }
    } else {
      // If this page is loaded directly without data, go back to the dashboard.
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen w-full items-center justify-center bg-background p-4 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Gerando seu relatório...</h1>
      <p className="text-muted-foreground">Por favor, aguarde. Uma nova aba será aberta.</p>
    </div>
  );
}

    