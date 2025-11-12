import { useState } from 'react';
import { Expense } from '../types';
import {
  CaretRight,
  Trash,
  Receipt,
  CaretDown,
  CaretUp
} from '@phosphor-icons/react';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: number) => void;
}

export default function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isFolded, setIsFolded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const calculateSplit = (expense: Expense) => {
    if (!expense.splitBetween || expense.splitBetween.length === 0) return [];
    if (expense.splitType === 'equal') {
      const perPerson = expense.amount / expense.splitBetween.length;
      return expense.splitBetween.map(person => ({ person, amount: perPerson }));
    } else {
      return expense.splitBetween.map(person => ({ person, amount: expense.customAmounts?.[person] || 0 }));
    }
  };

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-6 md:p-8">
      <header className="flex items-start justify-between max-w-md gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lime-300 text-xl md:text-2xl font-semibold leading-tight">Past Expenses</h2>
            <button
              onClick={() => setIsFolded(!isFolded)}
              className="p-1 rounded-sm hover:bg-white/4 transition-colors duration-200 text-neutral-400 hover:text-neutral-200 active:scale-95"
              aria-label={isFolded ? 'Expand' : 'Collapse'}
              aria-expanded={!isFolded}
            >
              {isFolded ? <CaretDown size={20} weight="bold" /> : <CaretUp size={20} weight="bold" />}
            </button>
          </div>
          <p className="text-neutral-400 text-sm md:text-base mt-1">
            Track your past expenses - {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} recorded
          </p>
        </div>
      </header>

      {!isFolded && (
        <>
      {expenses.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 rounded-full border border-neutral-700 flex items-center justify-center mx-auto mb-4 bg-neutral-900">
            <Receipt size={36} className="text-neutral-400" />
          </div>
          <p className="text-neutral-300 text-base">No expenses added yet</p>
          <p className="text-neutral-400 text-sm mt-1">Add your first expense to get started</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {expenses.map(expense => {
            const isExpanded = expandedId === expense.id;
            const splits = calculateSplit(expense);

            return (
              <div
                key={expense.id}
                className="rounded-sm bg-neutral-900 border border-neutral-800 overflow-hidden transition-all"
              >
                <div
                  onClick={() => toggleExpand(expense.id)}
                  className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(expense.id); }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-neutral-100 font-semibold text-sm sm:text-base truncate">{expense.description}</h4>
                    </div>

                    <div className="flex flex-wrap gap-3 text-neutral-400 text-xs sm:text-sm">
                      <span className="flex items-center gap-1">
                        {formatDate(expense.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        Paid by {expense.paidBy}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded-sm">
                      <span className="text-neutral-100 font-bold text-base sm:text-lg">${expense.amount.toFixed(2)}</span>
                    </div>

                    <div className={`text-lime-300 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                      <CaretRight size={18} weight="bold" />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3 sm:px-4 pb-4 pt-2 bg-neutral-800 border-t border-neutral-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      {splits.map(({ person, amount }) => (
                        <div
                          key={person}
                          className="flex items-center justify-between gap-3 p-3 rounded-sm bg-neutral-900 border border-neutral-800"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-neutral-100 truncate" title={person}>
                                {person}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <div className="font-semibold text-neutral-100 text-sm">${amount.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Delete this expense?')) {
                            onDeleteExpense(expense.id);
                            setExpandedId(null);
                          }
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-semibold transition-colors duration-200 active:scale-95 bg-red-900/20 text-red-300 hover:bg-red-900/30 border border-red-800/30"
                      >
                        <Trash size={16} weight="bold" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
        </>
      )}
    </div>
  );
}