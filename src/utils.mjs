const asyncFunc = async (promise) => {
    try {
        const data = await promise;
        return { data };
    } catch (error) {
        return { error };
    }
};

export { asyncFunc };
