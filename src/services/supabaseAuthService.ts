import { supabase } from '../lib/supabase';
import { AppUser } from '../types';

export const supabaseAuthService = {
  /**
   * Fetch all registered users from Supabase `app_users` database table
   */
  async getUsers(): Promise<AppUser[]> {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase getUsers error, using local fallback:', error.message);
        return [];
      }

      if (data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id || `usr-${Date.now()}`,
          username: item.username || item.email,
          password: item.password || 'jcpantaleon',
          name: item.name || item.full_name || 'User',
          email: item.email || `${item.username}@tangentsolutionsinc.com`,
          role: item.role || 'field-technician',
          employeeCode: item.employee_code || item.employeeCode || `EMP-${1000 + Math.floor(Math.random() * 8999)}`,
          department: item.department || 'Field Dispatch & Engineering',
          area: item.area || 'NCR',
          sector: item.sector || 'MANILA',
          contactNumber: item.contact_number || item.contactNumber || '09170000000',
          status: item.status || 'Active',
          avatar: item.avatar || '',
          assignedFTId: item.assigned_ft_id || item.assignedFTId || '',
          accountChannelId: item.account_channel_id || item.accountChannelId || ''
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch users from Supabase:', err);
    }
    return [];
  },

  /**
   * Register a new user in Supabase Database and Supabase Auth
   */
  async registerUser(userData: Partial<AppUser>): Promise<{ success: boolean; user?: AppUser; error?: string }> {
    try {
      const userId = userData.id || `usr-sp-${Date.now()}`;
      const newRecord = {
        id: userId,
        username: (userData.username || '').toLowerCase().trim(),
        password: userData.password || 'jcpantaleon',
        name: userData.name || userData.username || 'New User',
        email: userData.email || `${userData.username}@tangentsolutionsinc.com`,
        role: userData.role || 'field-technician',
        employee_code: userData.employeeCode || `EMP-${Math.floor(1000 + Math.random() * 8999)}`,
        department: userData.department || 'Field Engineering',
        area: userData.area || 'NCR',
        sector: userData.sector || 'MANILA',
        contact_number: userData.contactNumber || '09170000000',
        status: userData.status || 'Active',
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=1b497d&color=ffffff&bold=true`,
        created_at: new Date().toISOString()
      };

      // 1. Save directly in Supabase Database table `app_users`
      const { data, error } = await supabase
        .from('app_users')
        .insert([newRecord])
        .select()
        .single();

      if (error && !error.message.includes('relation "public.app_users" does not exist')) {
        console.warn('Supabase app_users table insert notice:', error.message);
      }

      // 2. Also register in Supabase Auth if email provided
      if (newRecord.email && newRecord.password) {
        try {
          await supabase.auth.signUp({
            email: newRecord.email,
            password: newRecord.password,
            options: {
              data: {
                name: newRecord.name,
                username: newRecord.username,
                role: newRecord.role
              }
            }
          });
        } catch (e) {
          // Ignore if auth sign-up rate limited or offline
        }
      }

      const registeredUser: AppUser = {
        id: userId,
        username: newRecord.username,
        password: newRecord.password,
        name: newRecord.name,
        email: newRecord.email,
        role: newRecord.role as any,
        employeeCode: newRecord.employee_code,
        department: newRecord.department,
        area: newRecord.area as any,
        sector: newRecord.sector as any,
        contactNumber: newRecord.contact_number,
        status: newRecord.status as any,
        avatar: newRecord.avatar
      };

      // Also post to backend Express /api/users endpoint for local mirror persistence
      try {
        await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registeredUser)
        });
      } catch (e) {
        // Express mirror fallback
      }

      return { success: true, user: registeredUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to register user in Supabase' };
    }
  },

  /**
   * Login user via Supabase Database query
   */
  async loginUser(username: string, pass: string): Promise<{ success: boolean; user?: AppUser; error?: string }> {
    try {
      const cleanUser = username.trim().toLowerCase();
      
      // Query Supabase app_users
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .or(`username.ilike.${cleanUser},email.ilike.${cleanUser}`)
        .eq('password', pass)
        .limit(1);

      if (!error && data && data.length > 0) {
        const item = data[0];
        const userObj: AppUser = {
          id: item.id || `usr-${Date.now()}`,
          username: item.username || cleanUser,
          password: item.password,
          name: item.name || item.full_name || item.username,
          email: item.email || `${cleanUser}@tangentsolutionsinc.com`,
          role: item.role || 'field-technician',
          employeeCode: item.employee_code || item.employeeCode || 'EMP-1001',
          department: item.department || 'Field Operations',
          area: item.area || 'NCR',
          sector: item.sector || 'MANILA',
          contactNumber: item.contact_number || item.contactNumber || '09170000000',
          status: item.status || 'Active',
          avatar: item.avatar || ''
        };
        return { success: true, user: userObj };
      }
    } catch (err) {
      console.warn('Supabase login check warning:', err);
    }

    return { success: false, error: 'User not found in Supabase' };
  },

  /**
   * Subscribe to real-time changes in the Supabase user database
   */
  subscribeToUserUpdates(onUserChanged: (user: AppUser) => void): () => void {
    const channel = supabase
      .channel('public_app_users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_users' }, (payload) => {
        if (payload.new) {
          const item: any = payload.new;
          onUserChanged({
            id: item.id || `usr-${Date.now()}`,
            username: item.username,
            password: item.password,
            name: item.name || item.username,
            email: item.email,
            role: item.role || 'field-technician',
            employeeCode: item.employee_code || 'EMP-1001',
            department: item.department || 'Field Operations',
            area: item.area || 'NCR',
            sector: item.sector || 'MANILA',
            contactNumber: item.contact_number || '09170000000',
            status: item.status || 'Active',
            avatar: item.avatar
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
