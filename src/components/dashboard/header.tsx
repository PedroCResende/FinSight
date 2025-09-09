import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LogOut, PiggyBank, Settings, Target } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="flex w-full flex-row items-center justify-between">
        <div className='flex items-center gap-4'>
            <a
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
            >
            <PiggyBank className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl">FinSight</span>
            </a>
            <div className="hidden md:flex items-center gap-2">
                 <Button variant="link" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="link" asChild>
                    <Link href="/budgets">Orçamentos</Link>
                </Button>
            </div>
        </div>


        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="https://picsum.photos/40/40" alt="@user" data-ai-hint="person face" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="sr-only">Alternar menu do usuário</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/settings">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem>Suporte</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  )
}
