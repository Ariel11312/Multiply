export const fetchItems = async (setItems) => {
    try {
        const response = await fetch(import.meta.env.VITE_API_URL+'/api/item/get-all', {
            method: 'GET',
            headers: { "Content-Type": "application/json" },
            credentials: 'include'
        })
        if (!response.ok) throw new Error("authentication failed")

        const items = await response.json()

        setItems(items)


    } catch (error) {

    }
}