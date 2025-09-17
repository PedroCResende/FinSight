'use client';

import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, KeyRound, DatabaseZap, Lock, Bot } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SecurityPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-4xl gap-2">
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
            </Link>
            <h1 className="text-3xl font-semibold">Segurança e Privacidade</h1>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-4xl items-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Nossa Prioridade é a Sua Confiança</CardTitle>
              <CardDescription>
                Entenda as camadas de segurança que protegem suas informações financeiras no FinSight.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-muted-foreground">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Autenticação Segura</h3>
                  <p>Seu acesso é protegido pelo Firebase Authentication, um serviço do Google. Isso significa que sua senha é gerenciada com os mais altos padrões de segurança da indústria, sem que nós tenhamos acesso direto a ela.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Lock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Criptografia de Ponta a Ponta</h3>
                  <p>Toda a comunicação entre seu dispositivo e nossos servidores é criptografada usando TLS (Transport Layer Security). Isso garante que ninguém possa interceptar seus dados enquanto eles trafegam pela internet.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <DatabaseZap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Dados Criptografados no Banco de Dados</h3>
                  <p>Suas informações, como transações e metas, são armazenadas no Firestore, um banco de dados do Google. Todos os dados no Firestore são automaticamente criptografados em repouso, o que significa que, mesmo no servidor, eles estão protegidos.</p>
                </div>
              </div>

               <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Privacidade nas Interações com IA</h3>
                  <p>Quando você usa nossas funcionalidades de IA (como a categorização inteligente ou o chat), seus dados financeiros são usados apenas para processar sua solicitação específica naquele momento. Eles não são usados para treinar os modelos de IA e não são compartilhados com terceiros.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Você no Controle</h3>
                  <p>Seus dados são seus. Você tem controle total para visualizar, gerenciar e, se desejar, apagar todas as suas informações de transações diretamente pela tela de Configurações, na "Zona de Perigo".</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
