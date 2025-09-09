'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ALL_ACHIEVEMENTS, MOCK_USER_ACHIEVEMENTS } from '@/lib/achievements-data';
import type { UserAchievement } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trophy, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AchievementsPage() {
  const [unlockedAchievements] = useState<UserAchievement[]>(MOCK_USER_ACHIEVEMENTS);
  const unlockedAchievementIds = unlockedAchievements.map(a => a.achievementId);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Button>
                </Link>
                <h1 className="text-3xl font-semibold">Suas Conquistas</h1>
            </div>
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Galeria de Conquistas</CardTitle>
                    <CardDescription>
                        Explore todas as conquistas disponíveis e acompanhe seu progresso. {unlockedAchievementIds.length} de {ALL_ACHIEVEMENTS.length} desbloqueadas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {ALL_ACHIEVEMENTS.map((achievement) => {
                            const isUnlocked = unlockedAchievementIds.includes(achievement.id);
                            const Icon = achievement.icon;
                            return (
                                <Card key={achievement.id} className={cn(
                                    "flex flex-col transition-all",
                                    isUnlocked ? 'border-accent bg-accent/10' : 'border-dashed'
                                )}>
                                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                        <div className={cn("p-3 rounded-full", isUnlocked ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground')}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-xl">{achievement.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-muted-foreground">{achievement.description}</p>
                                    </CardContent>
                                    <CardFooter>
                                        {isUnlocked ? (
                                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                                <Trophy className="mr-2 h-4 w-4" />
                                                Desbloqueada
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <Lock className="mr-2 h-4 w-4" />
                                                Bloqueada
                                            </Badge>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
