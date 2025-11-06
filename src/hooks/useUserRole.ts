import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'student' | 'faculty';

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching role:', error);
          setRole('student'); // Default to student
        } else {
          setRole(data?.role as UserRole);
        }
      } catch (error) {
        console.error('Error in useUserRole:', error);
        setRole('student');
      } finally {
        setLoading(false);
      }
    }

    fetchRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { role, loading };
}