import { initialExpenses } from '../initialData';

function ExpenseList() {
  const expenses = initialExpenses;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-gray-50 rounded-lg mb-4 border border-gray-200 overflow-hidden"
            >
              <div className="p-4 flex justify-between items-center cursor-pointer transition-colors hover:bg-gray-100">
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
                    className="bg-transparent text-gray-600 px-2 py-1 transition-colors hover:bg-gray-50"
                    aria-label="Expand"
                  >
                    ▶
                  </button>
                </div>
              </div>
            </div>
          ))}
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
