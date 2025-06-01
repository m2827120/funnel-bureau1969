import { supabase } from '../config/supabase';
import type { User } from '../config/supabase';

export const userService = {
  async saveNewUser(telegramUsername: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            telegram_username: telegramUsername,
            first_launch: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error saving user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in saveNewUser:', error);
      return null;
    }
  },

  async getUserByTelegramUsername(telegramUsername: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_username', telegramUsername)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserByTelegramUsername:', error);
      return null;
    }
  },
}; 