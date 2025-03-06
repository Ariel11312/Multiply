export const fetchReferrals = async (setReferralList, setReferralStats) => {
    try {
        // Make API request to fetch referrals
        const response = await fetch(import.meta.env.VITE_API_URL+'/api/member/view-referrals', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // This will send cookies automatically
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch referral list: ${response.statusText}`);
        }

        const referralData = await response.json();

        // Ensure response data is an array
        if (!Array.isArray(referralData.data)) {
            throw new Error("Unexpected response format: Expected an array.");
        }

        // Initialize counters for referral lengths
        const referralCounts = {
            X1: 0,
            X2: 0,
            X3: 0,
            X5: 0
        };

        // Map through the referral data and extract user details
        const referralList = referralData.data.map(referral => {
            // Count referral types
            if (referral.memberType && referralCounts.hasOwnProperty(referral.memberType)) {
                referralCounts[referral.memberType]++;
            }

            return {
                firstName: referral?.userDetails?.firstName || "N/A",
                lastName: referral?.userDetails?.lastName || "N/A",
                memberDate: referral?.memberDate || "Unknown Date",
                email: referral?.userDetails?.email || "No email",
                transactionCount: referral?.statistics?.transactionCount || 0,
                totalEarnings: referral?.statistics?.totalEarnings || 0,
                commission: referral?.statistics?.commission || 0,
                memberType: referral?.memberType || "Unknown",
            };
        });

        // Set the referral list and stats in the component state
        setReferralList(referralList);
        setReferralStats(referralCounts);

    } catch (error) {
        console.error("Error retrieving referrals:", error.message);
    }
};
