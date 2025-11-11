import { Expense, SimplifiedDebt } from '../types';

interface BalanceViewProps {
  people: string[];
  expenses: Expense[];
}

function BalanceView({ people, expenses }: BalanceViewProps) {
  // Calculate individual balances
  const calculateBalances = () => {
    const balances: { [person: string]: { paid: number; owes: number; balance: number } } = {};

    // Initialize balances for all people
    people.forEach(person => {
      balances[person] = { paid: 0, owes: 0, balance: 0 };
    });

    // Calculate what each person paid and owes
    expenses.forEach(expense => {
      // Add to what the payer paid
      if (balances[expense.paidBy]) {
        balances[expense.paidBy].paid += expense.amount;
      }

      // Calculate what each person owes
      if (expense.splitType === 'equal') {
        const perPerson = expense.amount / expense.splitBetween.length;
        expense.splitBetween.forEach(person => {
          if (balances[person]) {
            balances[person].owes += perPerson;
          }
        });
      } else if (expense.splitType === 'custom' && expense.customAmounts) {
        expense.splitBetween.forEach(person => {
          if (balances[person]) {
            balances[person].owes += expense.customAmounts![person] || 0;
          }
        });
      }
    });

    // Calculate net balance (positive = owed money, negative = owes money)
    Object.keys(balances).forEach(person => {
      balances[person].balance = balances[person].paid - balances[person].owes;
    });

    return balances;
  };

  // Simplify debts to minimize transactions
  const simplifyDebts = (): SimplifiedDebt[] => {
    const balances = calculateBalances();
    
    // Create arrays of creditors (owed money) and debtors (owe money)
    const creditors: { person: string; amount: number }[] = [];
    const debtors: { person: string; amount: number }[] = [];

    Object.entries(balances).forEach(([person, data]) => {
      if (data.balance > 0.01) {
        creditors.push({ person, amount: data.balance });
      } else if (data.balance < -0.01) {
        debtors.push({ person, amount: -data.balance });
      }
    });

    const settlements: SimplifiedDebt[] = [];

    // Sort to process largest amounts first
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    let i = 0, j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const amount = Math.min(creditor.amount, debtor.amount);

      if (amount > 0.01) {
        settlements.push({
          from: debtor.person,
          to: creditor.person,
          amount: amount
        });
      }

      creditor.amount -= amount;
      debtor.amount -= amount;

      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    return settlements;
  };

  const balances = calculateBalances();
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const settlements = simplifyDebts();

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
      <h2 className="text-gray-700 mb-4 text-2xl border-b-2 border-gray-200 pb-2">
        💰 Balances
      </h2>

      <div className="flex justify-between items-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg mb-6">
        <span>Total Group Spending:</span>
        <strong className="text-2xl">${totalSpending.toFixed(2)}</strong>
      </div>

      <div className="mb-6">
        <h3 className="text-gray-600 my-2 text-lg">Individual Balances</h3>
        {people.map((person) => {
          const balance = balances[person]?.balance || 0;
          let status = 'settled up';
          let colorClass = 'bg-gray-100 border-gray-300 text-gray-600';

          if (balance > 0.01) {
            status = 'is owed';
            colorClass = 'bg-green-50 border-green-300 text-green-700';
          } else if (balance < -0.01) {
            status = 'owes';
            colorClass = 'bg-red-50 border-red-300 text-red-700';
          }

          return (
            <div
              key={person}
              className={`flex justify-between items-center px-3 py-3 mb-2 rounded-md transition-all hover:translate-x-1 border ${colorClass}`}
            >
              <span className="font-medium text-gray-800">{person}</span>
              <span className="flex items-center gap-2">
                <span className="text-sm">{status}</span>
                <strong className="text-lg">${Math.abs(balance).toFixed(2)}</strong>
              </span>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-gray-600 my-2 text-lg">Suggested Settlements</h3>
        {settlements.length === 0 ? (
          <div className="text-center py-8 bg-green-100 rounded-lg text-green-900 font-medium">
            <p>✅ All balances are settled!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {settlements.map((settlement, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md"
              >
                <span className="text-gray-800">
                  <strong>{settlement.from}</strong> pays <strong>{settlement.to}</strong>
                </span>
                <strong className="text-blue-700 text-lg">
                  ${settlement.amount.toFixed(2)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BalanceView;
