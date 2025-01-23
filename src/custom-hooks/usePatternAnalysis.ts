import { useState, useEffect } from 'react';
import { type JournalEntry } from '../types';
import { analyzePatterns } from '../lib/analysis/patterns';

interface PatternAnalysis {
  thoughtPatterns: string;
  growthAreas: string;
  coreValues: string;
  strengths: string;
}

export function usePatternAnalysis(entries: JournalEntry[]) {
  const [patterns, setPatterns] = useState<PatternAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function analyze() {
      if (entries.length === 0) {
        if (mounted) {
          setPatterns(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const analysis = await analyzePatterns(entries);
        if (mounted) {
          setPatterns(analysis);
        }
      } catch (err) {
        console.error('Pattern analysis error:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to analyze patterns'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    analyze();

    return () => {
      mounted = false;
    };
  }, [entries]);

  const retryAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const analysis = await analyzePatterns(entries);
      setPatterns(analysis);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to analyze patterns'));
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    patterns, 
    isLoading, 
    error,
    retryAnalysis 
  };
}