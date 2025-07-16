// SVG icon for INR text
const InrTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <text x="0" y="13" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fill="currentColor">INR</text>
  </svg>
);
import React from 'react';
import { TrendingUp, Plus, RefreshCcw } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createInvestment, fetchInvestments } from '../api';
import type { Investment } from '../types';

const InvestmentTracker: React.FC = () => {
  const queryClient = useQueryClient();
  const [symbol, setSymbol] = React.useState('');
  const [shares, setShares] = React.useState('');
  const [purchasePrice, setPurchasePrice] = React.useState('');

  const { data: investments = [], isLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: fetchInvestments
  });

  const mutation = useMutation({
    mutationFn: createInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      setSymbol('');
      setShares('');
      setPurchasePrice('');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Fetch current price from Yahoo Finance API (mock for now)
      const mockCurrentPrice = parseFloat(purchasePrice) * 1.1; // Mock 10% gain
      
      mutation.mutate({
        id: Date.now().toString(),
        symbol: symbol.toUpperCase(),
        shares: parseFloat(shares),
        purchasePrice: parseFloat(purchasePrice),
        currentPrice: mockCurrentPrice,
      });
    } catch (error) {
      console.error('Error adding investment:', error);
    }
  };

  const totalValue = investments.reduce(
    (sum, inv) => sum + inv.shares * inv.currentPrice,
    0
  );

  const totalCost = investments.reduce(
    (sum, inv) => sum + inv.shares * inv.purchasePrice,
    0
  );

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercentage = (totalGainLoss / totalCost) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp className="h-6 w-6 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold">Investment Tracker</h2>
        </div>
        <div className="flex space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Portfolio Value</p>
            <p className="text-xl font-semibold flex items-center"><InrTextIcon className="h-5 w-8 mr-1 text-gray-700" />{' '}{totalValue.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Gain/Loss</p>
            <p className={`text-xl font-semibold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <InrTextIcon className="h-4 w-7 mr-1 inline text-gray-700" />{' '}{totalGainLoss.toFixed(2)} ({totalGainLossPercentage.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Symbol</label>
          <input
            type="text"
            required
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            placeholder="AAPL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Shares</label>
          <input
            type="number"
            required
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            placeholder="100"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <InrTextIcon className="h-4 w-7 text-gray-500 sm:text-sm" />
            </div>
            <input
              type="number"
              required
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Plus className="h-5 w-5 mr-2" />
            {mutation.isPending ? 'Adding...' : 'Add Investment'}
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <RefreshCcw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gain/Loss
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {investments.map((investment) => {
                const marketValue = investment.shares * investment.currentPrice;
                const cost = investment.shares * investment.purchasePrice;
                const gainLoss = marketValue - cost;
                const gainLossPercentage = (gainLoss / cost) * 100;
                
                return (
                  <tr key={investment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {investment.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {investment.shares.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <InrTextIcon className="h-4 w-7 mr-1 inline text-gray-700" />{' '}{investment.purchasePrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <InrTextIcon className="h-4 w-7 mr-1 inline text-gray-700" />{' '}{investment.currentPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <InrTextIcon className="h-4 w-7 mr-1 inline text-gray-700" />{' '}{marketValue.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <InrTextIcon className="h-4 w-7 mr-1 inline text-gray-700" />{' '}{gainLoss.toFixed(2)} ({gainLossPercentage.toFixed(2)}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvestmentTracker;