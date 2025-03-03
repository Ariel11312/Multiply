export const checkMember = async (setMemberData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/auth/check-member`, {
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
      const member = data.user    
      setMemberData(member)
    return member
   } catch (error) {
      console.error('Member check error:', error);

    }
  };
