import React, { useState, useEffect } from 'react';
import Button from './Button';
import { solveMathExpression } from '../services/geminiService';
import { Loader2, Sparkles, Calculator as CalculatorIcon, History, Copy, RotateCcw, Trash2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  query: string;
  result: string;
  timestamp: number;
}

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<HistoryItem[]>([]);

  // Standard Calculator Logic
  const handleNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (nextOperator: string) => {
    const value = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(display);
    } else if (operator) {
      const result = calculate(parseFloat(prevValue), value, operator);
      setDisplay(String(result));
      setPrevValue(String(result));
    }

    setWaitingForNewValue(true);
    setOperator(nextOperator);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return a / b;
      default: return b;
    }
  };

  const handleEqual = () => {
    if (!operator || prevValue === null) return;

    const result = calculate(parseFloat(prevValue), parseFloat(display), operator);
    setDisplay(String(result));
    setPrevValue(null);
    setOperator(null);
    setWaitingForNewValue(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  const handleBackspace = () => {
    if (waitingForNewValue) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  const handlePercent = () => {
    const num = parseFloat(display);
    setDisplay(String(num / 100));
  };

  const handleToggleSign = () => {
    const num = parseFloat(display);
    setDisplay(String(num * -1));
  };

  // AI Logic
  const handleAiSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!aiInput.trim()) return;

    setIsLoading(true);
    const result = await solveMathExpression(aiInput);
    
    // Add to history
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      query: aiInput,
      result: result,
      timestamp: Date.now()
    };
    
    setAiHistory(prev => [newItem, ...prev]);
    setDisplay(result);
    setIsLoading(false);
    setAiInput(''); 
    setIsAiMode(false); 
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setAiInput(item.query);
    setDisplay(item.result);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClearHistory = () => {
    setAiHistory([]);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isAiMode) return;

      const { key } = event;
      
      if (/[0-9]/.test(key)) handleNumber(key);
      if (key === '.') handleDecimal();
      if (key === '+') handleOperator('+');
      if (key === '-') handleOperator('-');
      if (key === '*') handleOperator('*');
      if (key === '/') handleOperator('/');
      if (key === 'Enter' || key === '=') {
        event.preventDefault();
        handleEqual();
      }
      if (key === 'Backspace') handleBackspace();
      if (key === 'Escape') handleClear();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, prevValue, operator, waitingForNewValue, isAiMode]);


  return (
    <div className="w-full max-w-sm mx-auto p-4">
      {/* Container */}
      <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-800 transition-all duration-300">
        
        {/* Header / Mode Switcher */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-gray-400 text-sm font-semibold tracking-wider uppercase flex items-center gap-2">
                {isAiMode ? <Sparkles size={16} className="text-emerald-400" /> : <CalculatorIcon size={16} className="text-indigo-400"/>}
                {isAiMode ? "AI Solver" : "Calculator"}
            </h1>
            <button 
                onClick={() => setIsAiMode(!isAiMode)}
                className={`p-2 rounded-xl transition-colors duration-300 ${isAiMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}
                title="Toggle AI Mode"
            >
                {isAiMode ? <CalculatorIcon size={20} /> : <Sparkles size={20} />}
            </button>
        </div>

        {/* Display Area */}
        <div className="mb-6 relative">
          <div className="h-24 flex flex-col items-end justify-end px-4 text-right break-all">
             <span className="text-gray-500 text-sm h-6 mb-1">
                {!isAiMode && prevValue !== null && operator ? `${prevValue} ${operator}` : ''}
             </span>
             {isLoading ? (
                 <div className="flex items-center gap-2 text-emerald-400">
                     <Loader2 className="animate-spin" />
                     <span className="text-2xl">Thinking...</span>
                 </div>
             ) : (
                <span className={`text-5xl font-light text-white tracking-tight ${display.length > 9 ? 'text-3xl' : ''}`}>
                    {display}
                </span>
             )}
          </div>
        </div>

        {/* Controls */}
        {isAiMode ? (
            <div className="h-[384px] flex flex-col">
                <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 mb-3 flex-shrink-0">
                    <label className="block text-gray-400 text-xs mb-2 font-medium">ASK GEMINI MATH</label>
                    <textarea 
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="e.g. sqrt(144) + 10%"
                        className="w-full bg-gray-900 text-white rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none h-20"
                    />
                </div>
                
                <button 
                    onClick={() => handleAiSubmit()}
                    disabled={!aiInput.trim() || isLoading}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 transition-all flex-shrink-0 mb-4"
                >
                    <Sparkles size={16} />
                    Solve
                </button>

                {/* History Section */}
                <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                            <History size={12} />
                            <span>History</span>
                        </div>
                        {aiHistory.length > 0 && (
                            <button onClick={handleClearHistory} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                    
                    <div className="overflow-y-auto no-scrollbar flex-1 -mx-2 px-2 space-y-2">
                        {aiHistory.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                                <p className="text-xs text-center italic">No recent queries.</p>
                                <p className="text-[10px] text-center max-w-[150px]">Try asking "How many seconds in a year?"</p>
                            </div>
                        ) : (
                            aiHistory.map((item) => (
                                <div key={item.id} className="bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 group transition-colors border border-transparent hover:border-gray-700">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-emerald-400 font-medium text-lg">{item.result}</p>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleCopy(item.result)} 
                                                className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                                                title="Copy Result"
                                            >
                                                <Copy size={12} />
                                            </button>
                                            <button 
                                                onClick={() => handleRestoreHistory(item)} 
                                                className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-emerald-400 transition-colors"
                                                title="Use this query"
                                            >
                                                <RotateCcw size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{item.query}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-4 gap-3 h-[384px]">
            {/* Row 1 */}
            <Button label="AC" onClick={handleClear} variant="action" />
            <Button label="+/-" onClick={handleToggleSign} variant="action" />
            <Button label="%" onClick={handlePercent} variant="action" />
            <Button label="÷" onClick={() => handleOperator('/')} variant="operator" />

            {/* Row 2 */}
            <Button label="7" onClick={() => handleNumber('7')} />
            <Button label="8" onClick={() => handleNumber('8')} />
            <Button label="9" onClick={() => handleNumber('9')} />
            <Button label="×" onClick={() => handleOperator('*')} variant="operator" />

            {/* Row 3 */}
            <Button label="4" onClick={() => handleNumber('4')} />
            <Button label="5" onClick={() => handleNumber('5')} />
            <Button label="6" onClick={() => handleNumber('6')} />
            <Button label="-" onClick={() => handleOperator('-')} variant="operator" />

            {/* Row 4 */}
            <Button label="1" onClick={() => handleNumber('1')} />
            <Button label="2" onClick={() => handleNumber('2')} />
            <Button label="3" onClick={() => handleNumber('3')} />
            <Button label="+" onClick={() => handleOperator('+')} variant="operator" />

            {/* Row 5 */}
            <Button label="0" onClick={() => handleNumber('0')} colSpan={2} className="w-full" />
            <Button label="." onClick={handleDecimal} />
            <Button label="=" onClick={handleEqual} variant="accent" />
            </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;