'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function GenerateReportPage() {
  const router = useRouter();

  useEffect(() => {
    const reportDataString = sessionStorage.getItem('reportDataForGenerate');
    
    if (reportDataString) {
      // Move from sessionStorage to localStorage
      localStorage.setItem('reportData', reportDataString);
      sessionStorage.removeItem('reportDataForGenerate');

      // Open the report page and then go back
      const reportWindow = window.open('/report', '_blank');
      if (reportWindow) {
        // Allow time for the new tab to open and read from localStorage
        setTimeout(() => {
            router.back();
        }, 500);
      } else {
        alert('Por favor, habilite pop-ups para gerar o relatório.');
        router.back();
      }
    } else {
      // No data found, go back to dashboard
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
