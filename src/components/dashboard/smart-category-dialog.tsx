'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { suggestTransactionCategory } from '@/ai/flows/smart-transaction-categorization';
import type { SuggestTransactionCategoryOutput } from '@/ai/flows/smart-transaction-categorization';
import type { Transaction, Category } from '@/lib/types';
import { Lightbulb, Check } from 'lucide-react';

interface SmartCategoryDialogProps {
  transaction: Transaction;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategorize: (transactionId: string, categoryId: string) => void;
}

export function SmartCategoryDialog({
  transaction,
  categories,
  open,
  onOpenChange,
  onCategorize,
}: SmartCategoryDialogProps) {
  const [suggestion, setSuggestion] = useState<SuggestTransactionCategoryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && transaction) {
      const fetchSuggestion = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestion(null);

        try {
          const result = await suggestTransactionCategory({
            description: transaction.description,
            availableCategories: categories.map((c) => c.name),
          });
          setSuggestion(result);
        } catch (e) {
          setError('Failed to get a suggestion. Please try again.');
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSuggestion();
    }
  }, [open, transaction, categories]);

  const handleAccept = () => {
    if (suggestion) {
      const category = categories.find((c) => c.name === suggestion.suggestedCategory);
      if (category) {
        onCategorize(transaction.id, category.id);
        onOpenChange(false);
      } else {
        setError(`Suggested category "${suggestion.suggestedCategory}" does not exist.`);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Category Suggestion</DialogTitle>
          <DialogDescription>For transaction: "{transaction.description}"</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {suggestion && (
            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
              <h3 className="font-semibold text-lg">Suggested: {suggestion.suggestedCategory}</h3>
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAccept} disabled={isLoading || !suggestion}>
            <Check className="mr-2 h-4 w-4" />
            Accept Suggestion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
