import { useState, useCallback } from 'react'

export default function useApiCache(initialData = []) {
    const [data, setData] = useState(initialData)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    // Optimistic update functions
    const optimisticUpdate = useCallback((operation, payload, apiCall) => {
        let prevData = null;
        // For temporary IDs in add operations
        const tempId = `temp-${Date.now()}`;

        // Apply optimistic update based on operation type
        if (operation === 'add') {
            const newItem = {
                id: tempId, // Temporary ID until real one comes from server
                ...payload
            };
            console.log('Adding item optimistically:', newItem);
            setData(current => {
                prevData = [...current];
                return [...current, newItem];
            });
        } else if (operation === 'remove') {
            console.log('Removing item optimistically:', payload);
            setData(current => {
                prevData = [...current];
                // Log the item we're trying to filter out and the current data
                console.log('Current data:', current);
                console.log('Filtering out item with id:', payload.id);
                return current.filter(item => {
                    const matches = item.id !== payload.id;
                    if (!matches) {
                        console.log('Found item to remove:', item);
                    }
                    return matches;
                });
            });
        } else if (operation === 'update') {
            console.log('Updating item optimistically:', payload);
            setData(current => {
                prevData = [...current];
                return current.map(item =>
                    item.id === payload.id ? { ...item, ...payload } : item
                );
            });
        }    // Make the actual API call
        return apiCall()
            .then(response => {
                // Safely log the response, handling potential undefined
                console.log(`API ${operation} response:`, response || 'No response data');

                // If successful, update with real data if needed
                if (operation === 'add' && response && response.data) {
                    // Get the real ID from the response if available
                    const newId = response.data.id || response.data.task_id;

                    // Replace temp item with real one if API returns the created item
                    setData(current => {
                        const updated = current.map(item => {
                            if (item.id === tempId) {
                                // Create a new object with the server's ID and other data
                                return {
                                    ...item,
                                    id: newId || item.id,  // Use real ID from server or keep temp if not available
                                    ...response.data
                                };
                            }
                            return item;
                        });
                        console.log('Updated data after API response:', updated);
                        return updated;
                    });
                }
                return response;
            })
            .catch(err => {
                // Rollback on error
                console.error(`Error during ${operation} operation:`, err);
                setData(prevData);
                setError(err.message || 'An error occurred');
                throw err;
            })
    }, [])

    // Function to fetch data with loading state
    const fetchData = useCallback(async (apiCall) => {
        setLoading(true)
        setError(null)

        try {
            const response = await apiCall()
            // Support API calls that may not return an object with data
            const payload = response && response.data !== undefined
                ? response.data
                : response
            setData(Array.isArray(payload) || payload == null ? payload || [] : payload)
            return response
        } catch (err) {
            setError(err.message || 'An error occurred')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        data,
        loading,
        error,
        setData,
        optimisticUpdate,
        fetchData
    }
}
