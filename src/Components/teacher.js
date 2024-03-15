import React, { useEffect, useMemo, useState } from "react";
import { Field, FieldArray, reduxForm } from "redux-form";
import styled from "styled-components";
import io from "socket.io-client";
import {
    RadiusBottomleftOutlined,
    RadiusBottomrightOutlined,
    RadiusUpleftOutlined,
    RadiusUprightOutlined,
} from "@ant-design/icons";
import { Button, Divider, notification, Space } from "antd";
const Context = React.createContext({
    name: "Default",
});

const TeacherForm = ({ handleSubmit }) => {
    const [api, contextHolder] = notification.useNotification();
    const [socket, setSocket] = useState(null);
    const [count, setCount] = useState(0);

    const contextValue = useMemo(
        () => ({
            name: "Ant Design",
        }),
        []
    );

    const requestQuestions = async (event) => {
        event.preventDefault();
        socket.emit("previousPolls", count);
    };

    const onSubmit = async (values) => {
        const apiUrl = "http://localhost:8080/create/poll";

        if (!values.question) {
            openNotification("Question is required", true);
            return;
        }

        if (values.timer && values.timer > 60) {
            openNotification(
                "Timer value can not be more than 60 seconds",
                true
            );
            return;
        }

        if (!values.options || values.options.length < 2) {
            openNotification("At least two options are required", true);
            return;
        }

        const hasCorrectOption = Object.values(values.options).some(
            (option) => option.isCorrect === true
        );
        if (!hasCorrectOption) {
            openNotification(
                "At least one option must be marked as correct",
                true
            );
            return;
        }

        const formattedData = {
            question: values.question,
            options: values.options.reduce((acc, option, index) => {
                acc[option.text] = option.isCorrect || false;
                return acc;
            }, {}),
            answerTime: values.timer || 120,
        };

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formattedData),
            });

            if (!response.ok) {
                openNotification(`${(await response.json()).message}`, true);
            } else {
                openNotification("Question Broadcasted Successfully!");
            }
        } catch (error) {
            console.error("Error:", error.message);
        }
    };

    const renderField = ({ input, label, type, meta: { touched, error } }) => (
        <RenderStyled>
            <div>
                <label>{label} </label>
                <input {...input} type={type} />
                {touched && error && <span>{error}</span>}
            </div>
        </RenderStyled>
    );

    const getAlphabet = (index) => String.fromCharCode(65 + index);

    const renderOptions = ({ fields }) => (
        <OptionsStyled>
            {fields.map((option, index) => (
                <div className="option" key={index}>
                    <div className="option-inputs">
                        <Field
                            name={`${option}.text`}
                            type="text"
                            component={renderField}
                            label={`${getAlphabet(index)}`}
                        />
                        <Field
                            name={`${option}.isCorrect`}
                            type="checkbox"
                            component={renderField}
                        />
                        <RenderStyled>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => fields.remove(index)}
                                >
                                    Remove
                                </button>
                            </div>
                        </RenderStyled>
                    </div>
                </div>
            ))}
            <button type="button" onClick={() => fields.push({})}>
                Add Option
            </button>
        </OptionsStyled>
    );

    const [pollResult, setPollResult] = useState(
        JSON.parse(sessionStorage.getItem("pollResult")) || null
    );
    const [addingQuestion, setAddingQuestion] = useState(false);
    const [perviousQuestions, setPreviousQuestions] = useState([]);

    useEffect(() => {
        const webSocketUrl = "http://localhost:8080";
        const newSocket = io(webSocketUrl);
        setSocket(newSocket);

        newSocket.on("connect", () => {});

        newSocket.on("error", (error) => {
            openNotification(error, true);
        });

        newSocket.on("previousPolls", (data) => {
            setPreviousQuestions(data.data);
        });

        newSocket.emit("isTeacher", true);

        newSocket.on("pollResult", (result) => {
            setPollResult(result);
            openNotification("Poll Result Received");
        });

        return () => {
            newSocket.disconnect();
            setPollResult(null);
        };
    }, []);

    const openNotification = (content, error = false) => {
        if (error) {
            notification.error({
                message: "Error",
                description: content,
                placement: "topRight",
            });
        } else {
            notification.info({
                message: "Success",
                description: content,
                placement: "topRight",
            });
        }
    };

    const handleAddQuestion = () => {
        setAddingQuestion(true);
        sessionStorage.clear();
        setPollResult(null);
    };

    const handleCountChange = (e) => {
        setCount(e.target.value);
    };

    const handleCancelAddQuestion = () => {
        setAddingQuestion(false);
    };

    return (
        <TeacherFormStyled>
            <h2>Teacher's Form</h2>
            {!addingQuestion && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Field
                        className="question-input"
                        name="question"
                        type="text"
                        component={renderField}
                        label="Question"
                        textarea
                    />
                    <Field
                        className="timer"
                        name="timer"
                        type="number"
                        component={renderField}
                        label="Timer"
                        max={60}
                    />
                    <FieldArray name="options" component={renderOptions} />
                    <button type="submit">Submit</button>
                </form>
            )}
            {addingQuestion && (
                <div>
                    <h3>Add a new question</h3>
                    <button onClick={handleCancelAddQuestion}>Cancel</button>
                </div>
            )}
            {pollResult?.options?.length &&
                pollResult.options.map((item) => (
                    <div key={item.option}>
                        <ProgBarStyles>
                            <OptionStylesLeft>{item.option}</OptionStylesLeft>
                            <OptionStylesRight>{item.votes}</OptionStylesRight>
                        </ProgBarStyles>
                    </div>
                ))}
            {!addingQuestion && (
                <button onClick={handleAddQuestion}>Add New Question</button>
            )}
            {
                <form onSubmit={requestQuestions}>
                    <label htmlFor="count">Count:</label>
                    <input
                        type="number"
                        id="count"
                        value={count}
                        onChange={handleCountChange}
                    />
                    <button type="submit">Get Previous Polls</button>
                </form>
            }
            {perviousQuestions.length > 0 &&
                perviousQuestions.map((poll) => {
                    return <PollCard poll={poll} key={poll.question} />;
                })}
        </TeacherFormStyled>
    );
};

const PollCard = ({ poll }) => {
    return (
        <div
            className="card"
            style={{
                backgroundColor: "#886f90",
                color: "#ffffff",
                padding: "1rem",
                margin: "1rem",
                borderRadius: "10px",
                border: "2px solid #eee",
                width: "60vw",
                margin: "0 auto",
                marginBottom: "20px",
                display: "inline-block",
                paddingLeft: "10px",
                textAlign: "left",
            }}
        >
            <h3>{poll.question}</h3>
            <ul>
                {poll.options.map((option, index) => (
                    <li key={index}>
                        {option.option} : {option.votes}
                    </li>
                ))}
            </ul>
        </div>
    );
};
const OptionStylesLeft = styled.span``;

const OptionStylesRight = styled.span`
    margin-left: 50vw;
`;

const ProgBarStyles = styled.span`
    border-radius: 10px;
    border: 2px solid #eee;
    width: 60vw;
    height: 60px;
    margin: 0 auto;
    margin-bottom: 20px;
    display: inline-block;
    padding-left: 10px;
    text-align: left;
`;

const TeacherFormStyled = styled.div`
    color: #ffffff;
    font-size: 2rem;
    text-align: center;
    margin-top: 2rem;
    background-color: #886f90;

    h2 {
        color: #ad8752;
    }

    form {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 1rem;

        .question-input {
            width: 10%;
            height: 3em;
            padding: 0.2rem;
            border-radius: 5px;
            border: none;
            margin-left: 0.5rem;
        }

        button {
            margin-top: 0.5rem;
            padding: 0.5rem 1rem;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
    }
`;

const OptionsStyled = styled.div`
    .option {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .option-inputs {
            display: flex;
            justify-content: space-between;
            flex-direction: row;
            align-items: center;
            padding: 0.5rem;
            border-radius: 5px;
        }

        button {
            background-color: #dc3545;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-left: 0.5rem;
        }
    }

    button:last-child {
        margin-top: 0.5rem;
    }
`;

const RenderStyled = styled.div`
    color: white;
    text-align: center;

    div {
        margin-bottom: 1rem;

        label {
            font-size: 1rem;
        }

        input {
            padding: 0.2rem;
            border-radius: 5px;
            border: none;
            margin-left: 0.5rem;
        }

        span {
            color: red;
        }

        textarea {
            padding: 0.2rem;
            resize: vertical;
            width: 100%;
            border-radius: 5px;
            border: none;
            margin-left: 0.5rem;
        }
    }
`;

export default reduxForm({
    form: "teacherForm",
})(TeacherForm);
