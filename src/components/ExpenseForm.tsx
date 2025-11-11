import { initialPeople } from '../initialData';

function ExpenseForm() {
  const people = initialPeople;

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
      <h2 className="text-gray-700 mb-4 text-2xl border-b-2 border-gray-200 pb-2">
        💸 Add Expense
      </h2>

      <form>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block mb-1 text-gray-700 font-medium text-sm"
          >
            Description
          </label>
          <input
            id="description"
            type="text"
            placeholder="What was the expense for?"
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-base transition-colors focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 mb-4">
            <label
              htmlFor="amount"
              className="block mb-1 text-gray-700 font-medium text-sm"
            >
              Amount ($)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-base transition-colors focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex-1 mb-4">
            <label
              htmlFor="date"
              className="block mb-1 text-gray-700 font-medium text-sm"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-base transition-colors focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="paidBy"
            className="block mb-1 text-gray-700 font-medium text-sm"
          >
            Paid By
          </label>
          <select
            id="paidBy"
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-base transition-colors focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">Select person...</option>
            {people.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 font-medium text-sm">
            Split Type
          </label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer px-1 py-1 rounded transition-colors hover:bg-gray-50">
              <input
                type="radio"
                value="equal"
                name="splitType"
                className="cursor-pointer"
              />
              <span>Equal Split</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer px-1 py-1 rounded transition-colors hover:bg-gray-50">
              <input
                type="radio"
                value="custom"
                name="splitType"
                className="cursor-pointer"
              />
              <span>Custom Amounts</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 font-medium text-sm">
            Split Between
          </label>
          <div className="flex flex-col gap-2">
            {people.map((person) => (
              <div
                key={person}
                className="flex items-center justify-between p-2 bg-gray-50 rounded mb-1"
              >
                <label className="flex items-center gap-2 cursor-pointer px-1 py-1 rounded transition-colors hover:bg-gray-50">
                  <input type="checkbox" className="cursor-pointer" />
                  <span>{person}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-indigo-600 hover:-translate-y-px flex items-center justify-center gap-1"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;
