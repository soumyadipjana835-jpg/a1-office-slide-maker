import { createContext, useContext } from "react";

// Live design values from DialKit, shared with every component.
export const TokensContext = createContext({ spring: { type: "spring", visualDuration: 0.3, bounce: 0.15 } });

export const useTokens = () => useContext(TokensContext);
