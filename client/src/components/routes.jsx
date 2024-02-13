import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import App from "./App";
import Cubo from "./cubo";

const Routes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigation />}>
                <Route path="/cubo" element={<Cubo />} />
            </Route>
        </Routes>
    );
};

export default Routes;