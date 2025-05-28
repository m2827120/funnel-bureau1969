import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.REACT_APP_AIRTABLE_API_KEY }).base(process.env.REACT_APP_AIRTABLE_BASE_ID || '');

export interface UserData {
  username: string;
  firstLaunchDate: string;
}

export const saveUserData = async (userData: UserData): Promise<void> => {
  try {
    await base('Users').create([
      {
        fields: {
          Username: userData.username,
          FirstLaunchDate: userData.firstLaunchDate,
        },
      },
    ]);
  } catch (error) {
    console.error('Error saving user data to Airtable:', error);
  }
}; 