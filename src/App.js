import "./App.css";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import Home from "./Components/home.js";
import Teacher from "./Components/teacher.js";
import Student from "./Components/student.js";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const rootReducer = combineReducers({
    form: formReducer,
});

const store = configureStore({
    reducer: rootReducer,
});

function App() {
    return (
        <Provider store={store}>
            <div className="App">
                <header className="App-header">
                    <Router>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/teacher" element={<Teacher />} />
                            <Route path="/student" element={<Student />} />
                            <Route path="*" element={<h1>404 Not Found</h1>} />
                        </Routes>
                    </Router>
                </header>
            </div>
        </Provider>
    );
}

export default App;
