'use client';

import { useTheme } from 'next-themes';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Configurações</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência do aplicativo. Alterne entre o tema claro e escuro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={theme} onValueChange={setTheme} className="grid max-w-md grid-cols-3 gap-8 pt-2">
                <div>
                  <RadioGroupItem value="light" id="light" className="peer sr-only" />
                  <Label
                    htmlFor="light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Sun className="mb-2 h-6 w-6" />
                    Claro
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                  <Label
                    htmlFor="dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Moon className="mb-2 h-6 w-6" />
                    Escuro
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="system" id="system" className="peer sr-only" />
                  <Label
                    htmlFor="system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Monitor className="mb-2 h-6 w-6" />
                    Sistema
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
