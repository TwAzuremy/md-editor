import {createContext, useContext, useState} from "react";

const TempContext = createContext({});


/**
 * TempProvider component that provides temporary data storage and retrieval functionality
 * using React Context API.
 *
 * This component maintains a state object for temporary data, offering methods to get, set,
 * and clear temporary values. It should be used as a wrapper around components that need access
 * to the temporary data.
 *
 * @param {React.ReactNode} children - The child components that will have access to the temporary data.
 *
 * @returns {React.ReactElement} A provider component wrapping its children, giving them access to temporary data methods.
 */
export function TempProvider({children}) {
    const [tempData, setTempData] = useState({});

    // Encapsulation operation method
    /**
     * @type {{getTemp: (function(string): *), setTemp: (function(string, *): void), clearTemp: (function(): void)}}
     */
    const contextValue = {
        getTemp: (key) => tempData[key],
        setTemp: (key, value) => {
            setTempData(prev => ({...prev, [key]: value}));
        },
        clearTemp: () => setTempData({})
    };

    return (
        <TempContext.Provider value={contextValue}>
            {children}
        </TempContext.Provider>
    );
}

// Create portable hooks
/**
 * @returns {{getTemp: (function(string): *), setTemp: (function(string, *): void), clearTemp: (function(): void)}|{}}
 */
export const useTemp = () => {
    const context = useContext(TempContext);

    if (!context) {
        throw new Error("useTemp must be used within the TempProvider!");
    }

    return context;
};