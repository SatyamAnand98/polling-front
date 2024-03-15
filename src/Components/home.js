import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <HomeStyled>
            <div className="container">
                <div className="row">
                    <Link to="/teacher" className="teacher">
                        <h1>Teacher</h1>
                    </Link>
                    <Link to="/student" className="student">
                        <h1>Student</h1>
                    </Link>
                </div>
            </div>
        </HomeStyled>
    );
}

const HomeStyled = styled.div`
    .container {
        justify-content: center;
        align-items: center;
        height: 90vh;
        padding: 1rem;

        .row {
            display: flex;
            justify-content: space-around;
            align-items: center;
            flex-wrap: wrap;
            height: 100%;
            gap: 4rem;

            .teacher,
            .student {
                display: flex;
                justify-content: center;
                flex: 1;
                cursor: pointer;
                text-decoration: none;
                color: white;
                background: #77906f;
                height: 50%;
                align-items: center;
                border-radius: 10px;
            }
        }
    }
`;
