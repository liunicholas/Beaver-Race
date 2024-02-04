import React, { useState, useEffect, useRef } from "react";
import { get, post } from "../../utilities";
import "./MultiQuestion.css";
import { move } from "../../client-socket";
import * as math from 'mathjs';

// Page that displays all elements of a multiplayer race
const MultiQuestion = (props) => {
    const [currProblem, setCurrProblem] = useState(0);
    const inputRef = useRef();
    const [fontSize, setFontSize] = useState(24);
    const fontSizeRef = useRef(fontSize);
    const [inputValue, setInputValue] = useState('');

    let score = props.score;
    let setScore = props.setScore;
    let questions = props.questions;
    let answers = props.answers;
    let doneLoading = props.doneLoading;
    let game = props.game;

    useEffect(() => {
        if (doneLoading && props.raceStarted) {
            inputRef.current && inputRef.current.focus();
        }
    }, [doneLoading, props.raceStarted]);

    const handleInputChange = (event) => {
        // console.log(answers);
        if (answers[0] === "24" && answers[1] === "24" && answers[2] === "24") {
            let questionNumbers = questions[score].split(", ").map(Number);
            questionNumbers.sort((a, b) => a - b);
            // console.log(questionNumbers);

            try {
                // console.log(math.evaluate(event.target.value));
                if (math.evaluate(event.target.value) == 24) {
                    let numbers = event.target.value.match(/\d+/g).map(Number);
                    numbers.sort((a, b) => a - b);
                    // console.log(numbers);
                
                    if (numbers.length === questionNumbers.length && numbers.every((value, index) => value === questionNumbers[index])) {
                        setTimeout(() => {
                            setScore(score + 1);
                            // setCurrProblem(currProblem + 1);
                            event.target.value = "";
                            move();
                        }, 50); 
                    }
                }    
            } catch {}
        }
        else {
            if (event.target.value.toLowerCase() === answers[score].toLowerCase()) {
                setTimeout(() => {
                    setScore(score + 1);
                    // setCurrProblem(currProblem + 1);
                    event.target.value = "";
                }, 50);
                move();
            }    
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            if (inputValue) {
                if (inputValue.toLowerCase() === answers[score].toLowerCase()) {
                    setScore(score + 1);
                    setInputValue('');
                }
            }
        }, 200);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // console.log(score);
        if (questions.length > 0) {
            // console.log(questions[score]);
            const questionLength = questions[score].length;
            // console.log(questions[score]);
            // console.log(questionLength);

            if (questionLength < 10) {
                fontSizeRef.current = 40;
            }
            else if (questionLength < 30) {
                fontSizeRef.current = 30;
            } 
            else if (questionLength < 50) {
                fontSizeRef.current = 20;
            } 
            else {
                fontSizeRef.current = 16;
            }
        }
    }, [score, questions]);

    useEffect(() => {
        inputRef.current && inputRef.current.focus();
    }, [props.showAnswer])

    return (
        <div>
            {!doneLoading ? (
                <div> </div>
            ) : (
                <>
                    {props.raceStarted ? (
                        <div>
                            <div className="MultiQuestion-container">
                                <div className="MultiQuestion-score">Question {score + 1} of {game.questions_per_round}</div>
                                <div className="MultiQuestion-problem" style={{ fontSize: `${fontSizeRef.current}pt`}}>{questions[score]}</div>
                                <div className="MultiQuestion-answer-box">
                                    { props.showAnswer ? <div className="MultiQuestion-show-answer"> {answers[score]} </div> : 
                                    <input
                                        type="text"
                                        placeholder=""
                                        onChange={handleInputChange}
                                        ref={inputRef}
                                        style={{ fontSize: "24pt" }}
                                    />
                                    }
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div> </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MultiQuestion;
