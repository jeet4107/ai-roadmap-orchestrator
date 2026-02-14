import React, { useState } from 'react';
import { UserConstraints } from '../types';
import { ArrowRight, Loader2 } from 'lucide-react';

interface IntakeFormProps {
  onSubmit: (constraints: UserConstraints) => void;
  isLoading: boolean;
}

const IntakeForm: React.FC<IntakeFormProps> = ({ onSubmit, isLoading }) => {
  const [goal, setGoal] = useState('');
  const [hours, setHours] = useState(10);
  const [skill, setSkill] = useState('Beginner');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onSubmit({
        goal,
        hoursPerWeek: hours,
        currentSkillLevel: skill,
        deadline: deadline || undefined,
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-20 p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 mb-4">
          What do you want to build?
        </h1>
        <p className="text-slate-400 text-lg">
          The AI Orchestrator maps your path, estimates time, and adapts to reality.
        </p>
      </div>

      <form 
        onSubmit={handleSubmit}
        className="relative group bg-slate-900/50 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:border-white/20"
      >
        <div className="space-y-6">
          {/* Goal Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Primary Objective
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Become a Senior React Engineer, Launch a SaaS MVP, Learn Spanish to B2 level..."
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all h-32 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hours Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hours per Week
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <span className="absolute right-4 top-3.5 text-slate-500 text-sm">hrs</span>
              </div>
            </div>

            {/* Skill Level */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Experience
              </label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
              >
                <option value="Complete Beginner">Complete Beginner</option>
                <option value="Some Experience">Some Experience</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Deadline Optional */}
          <div>
             <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Deadline (Optional)
              </label>
              <input 
                type="text" 
                placeholder="e.g., In 3 months, Before 2025"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 
              ${isLoading 
                ? 'bg-indigo-600/20 text-indigo-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Orchestrating...
              </>
            ) : (
              <>
                Generate Roadmap
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IntakeForm;
