export const allUsers = async (setData) => {
    try {
        // Make a fetch request to get the users with member details
        const response = await fetch(import.meta.env.VITE_API_URL+'/api/user/all-users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json(); // Parse the response as JSON

        if (data.success && Array.isArray(data.users)) {
            setData(data.users);  // Set only the users array
        } else {
            console.error('Error fetching users:', data.message);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};
