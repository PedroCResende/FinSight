'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Home,
  Car,
  UtensilsCrossed,
  ShoppingBag,
  Film,
  HeartPulse,
  BookOpen,
  Plane,
  Gift,
  LucideIcon,
  Smile,
} from 'lucide-react';

export const ICON_LIST = [
  { name: 'Home', icon: Home },
  { name: 'Car', icon: Car },
  { name: 'Food', icon: UtensilsCrossed },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Entertainment', icon: Film },
  { name: 'Health', icon: HeartPulse },
  { name: 'Education', icon: BookOpen },
  { name: 'Travel', icon: Plane },
  { name: 'Gift', icon: Gift },
  { name: 'Other', icon: Smile },
];

interface IconPickerProps {
  selectedIcon: LucideIcon;
  setSelectedIcon: (icon: LucideIcon) => void;
}

export function IconPicker({ selectedIcon: SelectedIcon, setSelectedIcon }: IconPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[280px] justify-start font-normal">
          <SelectedIcon className="mr-2 h-4 w-4" />
          Selecione um ícone
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="grid grid-cols-5 gap-2 p-2">
          {ICON_LIST.map(({ icon: Icon, name }) => (
            <Button
              key={name}
              variant="ghost"
              size="icon"
              onClick={() => setSelectedIcon(Icon)}
              className={SelectedIcon === Icon ? 'bg-accent text-accent-foreground' : ''}
            >
              <Icon className="h-5 w-5" />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
