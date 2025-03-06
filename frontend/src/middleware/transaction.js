export const checkTransaction = async (setTransactions) => {
    try {
        const response = await fetch(import.meta.env.VITE_API_URL+'/api/trans/transaction', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',  // Ensure cookies are included with the request
        });

        if (!response.ok) {
            // Enhanced error handling with response status code
            throw new Error(`Failed to fetch member data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Ensure that 'transactions' exists in the response
        if (!data.transactions) {
            throw new Error("No transactions found in the response.");
        }

        const member = data.transactions;
        setTransactions(member);  // Update state with fetched member data

        return member;
    } catch (error) {
        // Handle errors with more detailed logs
        console.error('Member check error:', error.message);

        // Optional: Update the UI state to show an error message to the user
        setTransactions([]);  // Clear or reset the state on error
        return null;
    }
};
