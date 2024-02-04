import React, { useState, useEffect, useRef } from "react";
import { get, post } from "../../utilities";
import "./Question.css";
import * as math from 'mathjs';

// Page that displays all elements of a multiplayer race
const Question = (props) => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [doneLoading, setDoneLoading] = useState(false);
    const inputRef = useRef();
    const [fontSize, setFontSize] = useState(24);
    const fontSizeRef = useRef(fontSize);
    const [inputValue, setInputValue] = useState('');


    let score = props.score;
    let setScore = props.setScore;
    let game = props.game;

    const getRoundInfo = async () => {
        // console.log("Check 1: " + props.roundID);
        get("/api/get_round_by_id", { roundID: props.roundID }).then((round) => {
            // console.log("This displays the round for ID " + round.problem_set_id);
            get("/api/get_problem_set_by_id", { problemSetID: round.problem_set_id }).then(
                (problemSet) => {
                    // console.log("This displays the problem set for ID " + problemSet._id);
                    setQuestions(problemSet.questions);
                    setAnswers(problemSet.answers);
                    setDoneLoading(true);
                    // console.log(questions);
                }
            );
        });
    };

    useEffect(() => {
        if (doneLoading) {
            inputRef.current && inputRef.current.focus();
        }
    }, [doneLoading]);

    useEffect(() => {
        getRoundInfo();
    }, []);

    // useEffect(() => { 
    //     if (doneLoading) {
    //         if (props.showAnswer) {
    //             inputRef.current.value = answers[score];
    //         }
    //         else {
    //             inputRef.current.value = "";
    //         }    
    //     }       
    // }, [props.showAnswer, doneLoading])

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
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
    }, [props.showAnswer]);

    return (
        <div>
            {!doneLoading ? (
                <div> </div>
            ) : (
                <div>
                    <div className="Question-container">
                        <div className="Question-score">Question {score + 1} of {game.questions_per_round}</div>
                        <div className="Question-problem" style={{ fontSize: `${fontSizeRef.current}pt` }}>{questions[score]}</div>
                        <div className="Question-answer-box">
                            { props.showAnswer ? <div className="Question-show-answer"> {answers[score]} </div> : 
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
            )}
        </div>
    );

    // return ({ !doneLoading ? <div> Loading... </div> :
    //         <div className="Question-container">
    //             <div className="Question-score">
    //                 <p>
    //                     Score: { currProblem }
    //                 </p>
    //             </div>
    //             <div className="Question-problem">
    //                 { questions[currProblem] }
    //             </div>
    //             <div className="Question-answer-box">
    //                 <input type="text" placeholder="" onChange={handleInputChange} style={{fontSize: '24pt'}}/>
    //             </div>
    //         </div> }
    // )
};

export default Question;
