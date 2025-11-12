import { useState } from 'react';
import { Expense, SimplifiedDebt } from '../types';
import { CaretDown, CaretUp } from '@phosphor-icons/react';

interface BalanceViewProps {
  people: string[];
  expenses: Expense[];
}

export default function BalanceView({ people, expenses }: BalanceViewProps) {
  const [isFolded, setIsFolded] = useState(false);
  const [isSettlementsFolded, setIsSettlementsFolded] = useState(false);

  const calculateBalances = () => {
    const balances: { [person: string]: { paid: number; owes: number; balance: number } } = {};

    people.forEach(person => {
      balances[person] = { paid: 0, owes: 0, balance: 0 };
    });

    expenses.forEach(expense => {
      if (balances[expense.paidBy]) {
        balances[expense.paidBy].paid += expense.amount;
      }

      if (expense.splitType === 'equal') {
        if (expense.splitBetween.length === 0) return;
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

    Object.keys(balances).forEach(person => {
      balances[person].balance = balances[person].paid - balances[person].owes;
    });

    return balances;
  };

  const simplifyDebts = (): SimplifiedDebt[] => {
    const balances = calculateBalances();

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
    <div className="bg-neutral-950 border border-neutral-800 rounded-sm p-6 md:p-8 space-y-8">
      <header className="flex items-start justify-between max-w-md gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lime-300 text-xl md:text-2xl font-semibold leading-tight">Balances</h2>
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
            Track spending and suggested settlements
          </p>
        </div>
      </header>

      {!isFolded && (
        <>
      <div className="rounded-sm border border-neutral-800 bg-neutral-900 p-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-neutral-400">Total Group Spending</span>
          <strong className="text-3xl font-bold text-neutral-50 leading-tight">${totalSpending.toFixed(2)}</strong>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-neutral-300">Individual Balances</h3>

        {people.length === 0 ? (
          <div className="">
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {people.map(person => {
              const data = balances[person] || { paid: 0, owes: 0, balance: 0 };
              const bal = data.balance;
              const isCreditor = bal > 0.01;
              const isDebtor = bal < -0.01;

              const amountColor = isCreditor
                ? 'text-emerald-300'
                : isDebtor
                  ? 'text-rose-300'
                  : 'text-neutral-200';
              const statusText = isCreditor ? 'is owed overall' : isDebtor ? 'owes overall' : 'settled up';
              const displayName = person.trim();
              const initial = displayName.charAt(0).toUpperCase() || '?';
              const formattedBalance = Math.abs(bal).toFixed(2);'';

              return (
                <div
                  key={person}
                  className="flex flex-col items-center gap-3 p-4 rounded-sm border border-neutral-800 bg-neutral-900 text-center"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-800 text-white text-lg border border-neutral-700 font-medium">
                    {initial}
                  </div>
                  <div className="text-sm font-medium text-neutral-100 truncate w-full">{displayName}</div>
                  
                  <div className="text-xs text-neutral-500">{statusText}</div>

                  <div className="w-full rounded-sm px-4 py-3">
                    <div className={`mt-1 text-4xl font-medium ${amountColor}`}>
                     ₹ {formattedBalance}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-neutral-300">Suggested Settlements</h3>
          <button
            onClick={() => setIsSettlementsFolded(!isSettlementsFolded)}
            className="p-1 rounded-sm hover:bg-white/4 transition-colors duration-200 text-neutral-400 hover:text-neutral-200 active:scale-95"
            aria-label={isSettlementsFolded ? 'Expand settlements' : 'Collapse settlements'}
            aria-expanded={!isSettlementsFolded}
          >
            {isSettlementsFolded ? <CaretDown size={16} weight="bold" /> : <CaretUp size={16} weight="bold" />}
          </button>
        </div>

        {!isSettlementsFolded && (
          <>
            {settlements.length === 0 ? (
              <div className="">
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {settlements.map((settlement, idx) => (
                  <div
                    key={idx}
                    className="rounded-sm border border-neutral-800 bg-neutral-900 p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <span className="font-semibold text-neutral-100">{settlement.from}</span>
                      <span className="text-neutral-500 text-xs uppercase tracking-wide">pays</span>
                      <span className="font-semibold text-neutral-100">{settlement.to}</span>
                    </div>
                    <strong className="text-2xl font-bold text-neutral-50 leading-none">${settlement.amount.toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
        </>
      )}
    </div>
  );
}