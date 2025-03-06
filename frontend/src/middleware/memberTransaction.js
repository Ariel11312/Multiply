export const checkMemberTransaction = async (setMemberTransaction) => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL+`/api/auth/check-transaction`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch member data: ${response.statusText}`);
    }

    const data = await response.json();

    if (data && data.user) {
      setMemberTransaction(data);  // Assuming data.user contains the expected data
    } else {
      console.error('Invalid data structure or missing user');
    }
  } catch (error) {
    console.error('Member check error:', error);
  }
};
