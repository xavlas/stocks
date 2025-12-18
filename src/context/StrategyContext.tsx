
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Strategy, Rule } from '../types/engine';

interface StrategyContextType {
    strategy: Strategy;
    addRule: (rule: Rule) => void;
    updateRule: (rule: Rule) => void;
    removeRule: (id: string) => void;
    setStrategyName: (name: string) => void;
    setStrategy: (strategy: Strategy) => void;
    resetStrategy: () => void;
}

const StrategyContext = createContext<StrategyContextType | undefined>(undefined);

const DEFAULT_STRATEGY: Strategy = {
    id: 'default',
    name: 'My Strategy',
    rules: []
};

export const StrategyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [strategy, setStrategy] = useState<Strategy>(() => {
        try {
            const saved = localStorage.getItem('strategy');
            return saved ? JSON.parse(saved) : DEFAULT_STRATEGY;
        } catch {
            return DEFAULT_STRATEGY;
        }
    });

    useEffect(() => {
        localStorage.setItem('strategy', JSON.stringify(strategy));
    }, [strategy]);

    const addRule = (rule: Rule) => {
        setStrategy(prev => ({
            ...prev,
            rules: [...prev.rules, rule]
        }));
    };

    const updateRule = (rule: Rule) => {
        setStrategy(prev => ({
            ...prev,
            rules: prev.rules.map(r => r.id === rule.id ? rule : r)
        }));
    };

    const removeRule = (id: string) => {
        setStrategy(prev => ({
            ...prev,
            rules: prev.rules.filter(r => r.id !== id)
        }));
    };

    const setStrategyName = (name: string) => {
        setStrategy(prev => ({ ...prev, name }));
    };

    const resetStrategy = () => setStrategy(DEFAULT_STRATEGY);

    return (
        <StrategyContext.Provider value={{ strategy, addRule, updateRule, removeRule, setStrategyName, setStrategy, resetStrategy }}>
            {children}
        </StrategyContext.Provider>
    );
};

export const useStrategy = () => {
    const context = useContext(StrategyContext);
    if (!context) throw new Error('useStrategy must be used within a StrategyProvider');
    return context;
};
