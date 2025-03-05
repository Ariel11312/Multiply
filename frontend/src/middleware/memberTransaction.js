export const checkMemberTransaction = async (setMemberTransaction) => {
  try {
    const response = await fetch(`https://156.67.214.197:3001/api/auth/check-transaction`, {
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
