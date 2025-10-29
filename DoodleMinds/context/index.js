import { createContext, useState } from "react";

export const GlobalContext = createContext(null);

function GlobalState({ children }) {
    const [showJoiningView, setShowJoiningView] = useState(false);
    const [currentUsername, setCurrentUsername] = useState("");
    const [currentUser, setCurrentUser] = useState("");
    const [allUsers, setAllUsers] = useState([]);

    return
    (<GlobalContext.Provider value={{ showJoiningView, setShowJoiningView, currentUsername, setCurrentUsername, }}> {children}</GlobalContext.Provider>
    );
}