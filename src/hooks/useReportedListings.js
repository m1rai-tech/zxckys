import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useReportedListings() {
  const { user } = useAuth();
  const [reportedIds, setReportedIds] = useState(new Set());

  useEffect(() => {
    if (!user) { setReportedIds(new Set()); return; }
    supabase
      .from('reports')
      .select('listing_id')
      .eq('reporter_id', user.id)
      .eq('status', 'pending')
      .then(({ data }) => {
        setReportedIds(new Set((data || []).map(r => r.listing_id)));
      });
  }, [user?.id]);

  return reportedIds;
}
