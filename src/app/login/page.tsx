
'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="absolute top-8 left-8 flex items-center gap-2 text-lg font-semibold md:text-base">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl">FinSight</span>
        </div>
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="signup">Cadastrar</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo de volta!</CardTitle>
              <CardDescription>
                Acesse sua conta para gerenciar suas finanças.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href="/dashboard">Entrar</Link>
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Crie sua conta</CardTitle>
              <CardDescription>
                Comece a organizar sua vida financeira hoje mesmo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
               <div className="space-y-1">
                <Label htmlFor="name-signup">Nome</Label>
                <Input id="name-signup" placeholder="Seu Nome Completo" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email-signup">Email</Label>
                <Input id="email-signup" type="email" placeholder="seu@email.com" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password-signup">Senha</Label>
                <Input id="password-signup" type="password" />
              </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" variant="secondary" asChild>
                    <Link href="/dashboard">Criar Conta</Link>
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
