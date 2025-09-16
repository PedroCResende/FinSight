
'use client';

import { useState } from 'react';
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
import { PiggyBank, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthError = (error: any, action: 'login' | 'signup') => {
    const title = action === 'login' ? 'Erro ao entrar' : 'Erro ao criar conta';
    let description = 'Ocorreu um erro inesperado. Tente novamente.';

    if (error.code) {
        switch (error.code) {
            case 'auth/wrong-password':
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
              description = 'E-mail ou senha inválidos.';
              break;
            case 'auth/email-already-in-use':
              description = 'Este e-mail já está em uso por outra conta.';
              break;
            case 'auth/weak-password':
              description = 'A senha é muito fraca. Ela deve ter no mínimo 6 caracteres.';
              break;
            case 'auth/invalid-email':
                description = 'O formato do e-mail é inválido.';
                break;
            default:
              description = error.message;
              break;
        }
    }


    toast({
      variant: 'destructive',
      title: title,
      description: description,
    });
  };

  const handleLogin = async () => {
    if (!isLoginFormComplete) return;
    setLoading(true);
    try {
      await login({ email: loginEmail, password: loginPassword });
    } catch (error: any) {
      handleAuthError(error, 'login');
    } finally {
        setLoading(false);
    }
  };
  
  const handleSignup = async () => {
    if (!isSignupFormComplete) return;
    setLoading(true);
    try {
      await signup({ name: signupName, email: signupEmail, password: signupPassword });
    } catch (error: any) {
      handleAuthError(error, 'signup');
    } finally {
        setLoading(false);
    }
  };

  const isLoginFormComplete = loginEmail.trim() !== '' && loginPassword.trim() !== '';
  const isSignupFormComplete = signupName.trim() !== '' && signupEmail.trim() !== '' && signupPassword.trim() !== '';


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="absolute top-8 left-8 flex items-center gap-2 text-lg font-semibold md:text-base">
            <PiggyBank className="h-6 w-6 text-primary" />
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
                <Input id="email" type="email" placeholder="seu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={loading} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={loading} />
              </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleLogin} disabled={loading || !isLoginFormComplete}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
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
                <Input id="name-signup" placeholder="Seu Nome Completo" value={signupName} onChange={(e) => setSignupName(e.target.value)} disabled={loading} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email-signup">Email</Label>
                <Input id="email-signup" type="email" placeholder="seu@email.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} disabled={loading} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password-signup">Senha</Label>
                <Input id="password-signup" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} disabled={loading} />
              </div>
            </CardContent>
            <CardFooter>
                <Button 
                    className="w-full" 
                    onClick={handleSignup} 
                    disabled={loading || !isSignupFormComplete}
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Conta
                </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
