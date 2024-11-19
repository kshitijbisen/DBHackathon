import React from 'react';
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransaction } from '../api';

const TransactionForm: React.FC = () => {
  const queryClient = useQueryClient();
  const [type, setType] = React.useState<'income' | 'expense'>('income');
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [description, setDescription] = React.useState('');

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setAmount('');
      setCategory('');
      setDescription('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      id: Date.now().toString(),
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
      
      <div className="flex space-x-4">
        <button
          type="button"
          className={`flex-1 py-2 px-4 rounded-md ${
            type === 'income'
              ? 'bg-green-100 text-green-800 border-2 border-green-500'
              : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setType('income')}
        >
          Income
        </button>
        <button
          type="button"
          className={`flex-1 py-2 px-4 rounded-md ${
            type === 'expense'
              ? 'bg-red-100 text-red-800 border-2 border-red-500'
              : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setType('expense')}
        >
          Expense
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <input
          type="text"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <Plus className="h-5 w-5 mr-2" />
        {mutation.isPending ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
};

export default TransactionForm;