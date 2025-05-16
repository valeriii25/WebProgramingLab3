import {useContext} from "react";
import {AppContext} from "../contexts/AppContext.jsx";

export const useAppContext = () => useContext(AppContext);