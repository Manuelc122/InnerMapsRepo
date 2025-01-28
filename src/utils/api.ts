import { supabase } from './supabase';
import { AuthError, DatabaseError } from './errors';

export async function withAuth<T>(
  operation: (userId: string) => Promise<T>
): Promise<T> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new AuthError('Authentication required');
  }

  try {
    return await operation(user.id);
  } catch (error) {
    if (error instanceof AuthError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('Operation failed', error);
  }
}