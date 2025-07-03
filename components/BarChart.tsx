import React from 'react';
import { AnswerDistribution } from '../types';
import CheckIcon from './icons/CheckIcon';

interface BarChartProps {
  distribution: AnswerDistribution;
  options: string[];
  correctAnswerIndex: number;
  totalPlayers: number;
}

const BarChart: React.FC<BarChartProps> = ({ distribution, options, correctAnswerIndex, totalPlayers }) => {
  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const count = distribution[index] || 0;
        const percentage = totalPlayers > 0 ? (count / totalPlayers) * 100 : 0;
        const isCorrect = index === correctAnswerIndex;

        return (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className={`font-semibold ${isCorrect ? 'text-green-300' : 'text-gray-300'}`}>{option}</span>
                <span className="font-bold text-white">{count} ({Math.round(percentage)}%)</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-6">
                <div
                  className={`h-6 rounded-full transition-all duration-500 ${isCorrect ? 'bg-green-500' : 'bg-indigo-500'}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
            {isCorrect && (
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckIcon className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;