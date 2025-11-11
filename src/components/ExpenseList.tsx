import { useState } from 'react';
import { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: number) => void;
}

function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
    if (expense.splitType === 'equal') {
      const perPerson = expense.amount / expense.splitBetween.length;
      return expense.splitBetween.map(person => ({
        person,
        amount: perPerson
      }));
    } else {
      return expense.splitBetween.map(person => ({
        person,
        amount: expense.customAmounts?.[person] || 0
      }));
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
      <h2 className="text-gray-700 mb-4 text-2xl border-b-2 border-gray-200 pb-2">
        📝 Expense History
      </h2>

      {expenses.length === 0 ? (
        <p className="text-center text-gray-400 py-8 italic">
          No expenses added yet. Add your first expense to get started!
        </p>
      ) : (
        <div>
          {expenses.map((expense) => {
            const isExpanded = expandedId === expense.id;
            const splits = calculateSplit(expense);

            return (
              <div
                key={expense.id}
                className="bg-gray-50 rounded-lg mb-4 border border-gray-200 overflow-hidden"
              >
                <div 
                  onClick={() => toggleExpand(expense.id)}
                  className="p-4 flex justify-between items-center cursor-pointer transition-colors hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <h4 className="text-gray-800 mb-1 text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                      {expense.description}
                    </h4>
                    <div className="flex gap-4 text-gray-600 text-sm">
                      <span>{formatDate(expense.date)}</span>
                      <span>Paid by {expense.paidBy}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-semibold text-gray-700">
                      ${expense.amount.toFixed(2)}
                    </span>
                    <button
                      className={`bg-transparent text-gray-600 px-2 py-1 transition-all hover:bg-gray-50 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                      aria-label="Expand"
                    >
                      ▶
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200 pt-4 bg-white">
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-700 mb-2">Split Details:</h5>
                      <p className="text-sm text-gray-600 mb-2">
                        Type: <span className="font-medium">{expense.splitType === 'equal' ? 'Equal Split' : 'Custom Split'}</span>
                      </p>
                      <div className="space-y-1">
                        {splits.map(({ person, amount }) => (
                          <div key={person} className="flex justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                            <span className="text-gray-700">{person}</span>
                            <span className="font-medium text-gray-800">${amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this expense?')) {
                          onDeleteExpense(expense.id);
                          setExpandedId(null);
                        }
                      }}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-red-600"
                    >
                      Delete Expense
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-700">
        <p>
          Total Expenses: <strong>{expenses.length}</strong>
        </p>
      </div>
    </div>
  );
}

export default ExpenseList;
