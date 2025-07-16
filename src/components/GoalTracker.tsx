// SVG icon for INR text
const InrTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <text x="0" y="13" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fill="currentColor">INR</text>
  </svg>
);
import React from 'react';
import { Target, Plus, RefreshCcw } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createGoal, fetchGoals } from '../api';
import type { Goal } from '../types';

const GoalTracker: React.FC = () => {
  const queryClient = useQueryClient();
  const [name, setName] = React.useState('');
  const [targetAmount, setTargetAmount] = React.useState('');
  const [currentAmount, setCurrentAmount] = React.useState('');
  const [deadline, setDeadline] = React.useState('');

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: fetchGoals
  });

  const mutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setDeadline('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      id: Date.now().toString(),
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      deadline,
    });
  };

  const totalTargetAmount = goals.reduce((sum: number, goal: Goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum: number, goal: Goal) => sum + goal.currentAmount, 0);
  const overallProgress = (totalCurrentAmount / totalTargetAmount) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Target className="h-6 w-6 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold">Financial Goals</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Overall Progress</p>
                <p className="text-xl font-semibold">
                  <InrTextIcon className="h-5 w-8 mr-1 text-gray-700 inline" />&nbsp;{totalCurrentAmount.toFixed(2)} / <InrTextIcon className="h-5 w-8 mr-1 text-gray-700 inline" />&nbsp;{totalTargetAmount.toFixed(2)}
            <span className="text-sm text-gray-500 ml-2">
              ({isNaN(overallProgress) ? 0 : overallProgress.toFixed(1)}%)
            </span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-5 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Goal Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            placeholder="New Car"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Target Amount</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <InrTextIcon className="h-4 w-7 text-gray-500 sm:text-sm" />
            </div>
            <input
              type="number"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Current Amount</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <InrTextIcon className="h-4 w-7 text-gray-500 sm:text-sm" />
            </div>
            <input
              type="number"
              required
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Target Date</label>
          <input
            type="date"
            required
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Plus className="h-5 w-5 mr-2" />
            {mutation.isPending ? 'Adding...' : 'Add Goal'}
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <RefreshCcw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal: Goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = Math.ceil(
              (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{goal.name}</h3>
                  <span className="text-sm text-gray-500">
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Past deadline'}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span><InrTextIcon className="h-4 w-7 mr-1 inline text-gray-700" />&nbsp;{goal.currentAmount.toFixed(2)} saved</span>
                    <span><InrTextIcon className="h-4 w-7 mr-1 inline text-gray-700" />&nbsp;{goal.targetAmount.toFixed(2)} goal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {progress.toFixed(1)}% complete
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalTracker;