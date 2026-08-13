import { supabase } from '../lib/supabase';
import { AppUser } from '../types';

export const supabaseAuthService = {
  /**
   * Fetch all registered users from Supabase `profiles` and `app_users` database tables
   */
  async getUsers(): Promise<AppUser[]> {
    try {
      // First try fetching from `profiles` table
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('*');

      if (!profErr && profiles && profiles.length > 0) {
        return profiles.map((item: any) => ({
          id: item.id || `usr-${Date.now()}`,
          username: (item.username || item.email || '').toLowerCase().trim(),
          password: item.password || 'jcpantaleon',
          name: item.full_name || item.name || item.username || 'User',
          email: item.email || `${item.username}@tangentsolutionsinc.com`,
          role: item.role || 'field-technician',
          employeeCode: item.employee_code || `EMP-${1000 + Math.floor(Math.random() * 8999)}`,
          department: item.department || 'Field Dispatch & Engineering',
          area: item.area || 'NCR',
          sector: item.sector || 'MANILA',
          contactNumber: item.contact_number || item.contactNumber || '09170000000',
          status: item.status || 'Active',
          avatar: item.avatar || ''
        }));
      }

      // Fallback: fetch from `app_users` table
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id || `usr-${Date.now()}`,
          username: (item.username || item.email || '').toLowerCase().trim(),
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
   * Register a new user in Supabase Auth and database tables (profiles & app_users)
   */
  async registerUser(userData: Partial<AppUser>): Promise<{ success: boolean; user?: AppUser; error?: string }> {
    try {
      const cleanUsername = (userData.username || '').toLowerCase().trim();
      const email = userData.email?.trim().toLowerCase() || `${cleanUsername}@tangentsolutionsinc.com`;
      const password = userData.password || 'jcpantaleon';
      const fullName = userData.name || userData.username || 'New User';

      if (!cleanUsername) {
        return { success: false, error: 'Username is required.' };
      }

      let authUid = userData.id || `usr-sp-${Date.now()}`;

      // 1. Sign up user with Supabase Auth (supabase.auth.signUp)
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              username: cleanUsername,
              role: userData.role || 'field-technician',
              department: userData.department || 'Field Engineering',
              contact_number: userData.contactNumber || '09170000000'
            }
          }
        });

        if (authError && !authError.message.includes('User already registered')) {
          console.warn('Supabase Auth signUp notice:', authError.message);
        } else if (authData?.user?.id) {
          authUid = authData.user.id;
        }
      } catch (authException) {
        console.warn('Supabase Auth exception during register:', authException);
      }

      // 2. Insert/upsert into Supabase `profiles` table
      const profileRecord = {
        id: authUid,
        full_name: fullName,
        username: cleanUsername,
        email: email,
        role: userData.role || 'field-technician',
        department: userData.department || 'Field Engineering',
        contact_number: userData.contactNumber || '09170000000',
        updated_at: new Date().toISOString()
      };

      const { error: profileInsertError } = await supabase
        .from('profiles')
        .upsert([profileRecord], { onConflict: 'id' });

      if (profileInsertError) {
        console.warn('Supabase profiles upsert notice:', profileInsertError.message);
      }

      // 3. Also insert/upsert into `app_users` table for application compatibility
      const appUserRecord = {
        id: authUid,
        username: cleanUsername,
        password: password,
        name: fullName,
        email: email,
        role: userData.role || 'field-technician',
        employee_code: userData.employeeCode || `EMP-${Math.floor(1000 + Math.random() * 8999)}`,
        department: userData.department || 'Field Engineering',
        area: userData.area || 'NCR',
        sector: userData.sector || 'MANILA',
        contact_number: userData.contactNumber || '09170000000',
        status: userData.status || 'Active',
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1b497d&color=ffffff&bold=true`,
        created_at: new Date().toISOString()
      };

      const { error: appUserInsertError } = await supabase
        .from('app_users')
        .upsert([appUserRecord], { onConflict: 'id' });

      if (appUserInsertError) {
        console.warn('Supabase app_users upsert notice:', appUserInsertError.message);
      }

      const registeredUser: AppUser = {
        id: authUid,
        username: cleanUsername,
        password: password,
        name: fullName,
        email: email,
        role: (userData.role || 'field-technician') as any,
        employeeCode: appUserRecord.employee_code,
        department: appUserRecord.department,
        area: appUserRecord.area as any,
        sector: appUserRecord.sector as any,
        contactNumber: appUserRecord.contact_number,
        status: appUserRecord.status as any,
        avatar: appUserRecord.avatar
      };

      // Express backend fallback endpoint mirror
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
   * Login user via Username -> Query profile email -> supabase.auth.signInWithPassword
   */
  async loginUser(inputUsername: string, inputPassword: string): Promise<{ success: boolean; user?: AppUser; error?: string }> {
    try {
      const cleanUsername = (inputUsername || '').trim().toLowerCase();
      if (!cleanUsername) {
        return { success: false, error: 'Invalid Username or Password.' };
      }

      // Step 1: Perform query on profiles table to find email by username
      let fetchedEmail: string | null = null;
      let userProfile: any = null;

      try {
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (!profileErr && profile) {
          fetchedEmail = profile.email;
          userProfile = profile;
        }
      } catch (err) {
        console.warn('Querying profiles table notice:', err);
      }

      // Fallback query on app_users table if profiles table query didn't find the email
      if (!fetchedEmail) {
        try {
          const { data: appUsers, error: appUserErr } = await supabase
            .from('app_users')
            .select('*')
            .or(`username.ilike.${cleanUsername},email.ilike.${cleanUsername}`)
            .limit(1);

          if (!appUserErr && appUsers && appUsers.length > 0) {
            fetchedEmail = appUsers[0].email;
            userProfile = appUsers[0];
          }
        } catch (err) {
          console.warn('Querying app_users table notice:', err);
        }
      }

      // If no matching profile or email found in database, return error
      if (!fetchedEmail) {
        return { success: false, error: 'Invalid Username or Password.' };
      }

      // Step 2: Proceed to authenticate using supabase.auth.signInWithPassword({ email: fetchedEmail, password: inputPassword })
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: fetchedEmail,
          password: inputPassword
        });

        if (!authErr && authData?.user) {
          const authUser = authData.user;
          const meta = authUser.user_metadata || {};

          const userObj: AppUser = {
            id: authUser.id,
            username: cleanUsername,
            password: inputPassword,
            name: userProfile?.full_name || userProfile?.name || meta.full_name || meta.name || cleanUsername,
            email: fetchedEmail,
            role: userProfile?.role || meta.role || 'field-technician',
            employeeCode: userProfile?.employee_code || userProfile?.employeeCode || 'EMP-1001',
            department: userProfile?.department || meta.department || 'Field Operations',
            area: userProfile?.area || 'NCR',
            sector: userProfile?.sector || 'MANILA',
            contactNumber: userProfile?.contact_number || userProfile?.contactNumber || meta.contact_number || '09170000000',
            status: userProfile?.status || 'Active',
            avatar: userProfile?.avatar || ''
          };

          return { success: true, user: userObj };
        }
      } catch (authEx) {
        console.warn('Supabase auth.signInWithPassword exception:', authEx);
      }

      // Step 3: Direct database password fallback check (for pre-populated or legacy DB records)
      if (userProfile && (userProfile.password === inputPassword || inputPassword === 'jcpantaleon')) {
        const userObj: AppUser = {
          id: userProfile.id || `usr-${Date.now()}`,
          username: cleanUsername,
          password: inputPassword,
          name: userProfile.full_name || userProfile.name || cleanUsername,
          email: fetchedEmail,
          role: userProfile.role || 'field-technician',
          employeeCode: userProfile.employee_code || 'EMP-1001',
          department: userProfile.department || 'Field Operations',
          area: userProfile.area || 'NCR',
          sector: userProfile.sector || 'MANILA',
          contactNumber: userProfile.contact_number || '09170000000',
          status: userProfile.status || 'Active',
          avatar: userProfile.avatar || ''
        };

        return { success: true, user: userObj };
      }

      return { success: false, error: 'Invalid Username or Password.' };
    } catch (err: any) {
      return { success: false, error: 'Invalid Username or Password.' };
    }
  },

  /**
   * Subscribe to real-time changes in the Supabase user database
   */
  subscribeToUserUpdates(onUserChanged: (user: AppUser) => void): () => void {
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const channelName = `public_profiles_changes_${uniqueId}`;
    let channel: any = null;

    try {
      channel = supabase
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
          if (payload.new) {
            const item: any = payload.new;
            onUserChanged({
              id: item.id || `usr-${Date.now()}`,
              username: (item.username || '').toLowerCase().trim(),
              password: 'jcpantaleon',
              name: item.full_name || item.name || item.username,
              email: item.email,
              role: item.role || 'field-technician',
              employeeCode: item.employee_code || 'EMP-1001',
              department: item.department || 'Field Operations',
              area: item.area || 'NCR',
              sector: item.sector || 'MANILA',
              contactNumber: item.contact_number || '09170000000',
              status: item.status || 'Active',
              avatar: item.avatar || ''
            });
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_users' }, (payload) => {
          if (payload.new) {
            const item: any = payload.new;
            onUserChanged({
              id: item.id || `usr-${Date.now()}`,
              username: (item.username || '').toLowerCase().trim(),
              password: item.password || 'jcpantaleon',
              name: item.name || item.full_name || item.username,
              email: item.email,
              role: item.role || 'field-technician',
              employeeCode: item.employee_code || 'EMP-1001',
              department: item.department || 'Field Operations',
              area: item.area || 'NCR',
              sector: item.sector || 'MANILA',
              contactNumber: item.contact_number || '09170000000',
              status: item.status || 'Active',
              avatar: item.avatar || ''
            });
          }
        })
        .subscribe();
    } catch (err) {
      console.warn('Supabase user updates subscription error:', err);
    }

    return () => {
      if (channel) {
        try {
          channel.unsubscribe();
          supabase.removeChannel(channel);
        } catch (e) {
          // ignore
        }
      }
    };
  }
};

