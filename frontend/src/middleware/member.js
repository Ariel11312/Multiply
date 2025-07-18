export const checkMember = async (setMemberData) => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL+`/api/auth/check-member`, {
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
    const member = data.user;
    
    // Set the full member data
    setMemberData(member);
    

    
    return member;
  } catch (error) {
    console.error('Member check error:', error);
  }
};