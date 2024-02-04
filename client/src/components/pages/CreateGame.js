import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../../utilities.css";
import "./CreateGame.css";

import successful_beaver from "../../public/assets/beavers/successful_beaver.png";

import { get, post } from "../../utilities";

function CreateGame() {
    const [allGames, setAllGames] = useState([]);
    const [title, setTitle] = useState('');
    const [skipTime, setSkipTime] = useState(5);
    const [questionsPerRound, setQuestionsPerRound] = useState(10);
    const [timePerRound, setTimePerRound] = useState(240);
    const [qna, setQna] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        get("/api/get_all_games").then((res) => {
            setAllGames(res.games);
        });
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Tab') {
                event.preventDefault();
                const { target } = event;
                if (target && (target.tagName.toLowerCase() === 'textarea' || target.isContentEditable)) {
                    const start = target.selectionStart;
                    const end = target.selectionEnd;
                    target.value = target.value.substring(0, start) + "\t" + target.value.substring(end);
                    target.selectionStart = target.selectionEnd = start + 1;
                }
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        
        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        const url = title.replace(/\s/g, '-').toLowerCase();
        const urlExists = allGames.some(game => game.url === url);
        const all_info = qna.split('\n').map(q => q.split('\t'));
        const questions = all_info.map(q => q[0]);
        const answers = all_info.map(q => q[1]);
        const num_questions = parseInt(questionsPerRound);
        if (urlExists) {
            setTitle('title already taken :(')
        } else if (url.length > 30) {
            setTitle('title too long :(')
        } else if (questions.length < num_questions+1) {
            setTitle('not enough questions :(')
        } else if (questions.length !== answers.length) {
            setTitle('questions and answers do not match :(')
        } else if (new Set(questions).size !== questions.length) {
            setTitle('questions are not unique :(')
        } else {
            post("/api/create_game", {
                title: title,
                url: url,
                // skipTime: skipTime,
                questionsPerRound: num_questions,
                // timePerRound: timePerRound,
                questions: questions,
                answers: answers
                }).then((res) => {
                    const new_url = `/${url}`;
                    navigate(new_url);
            });
        }
    }

    return (
        <div className="CreateGame-form-container">
            <form onSubmit={handleSubmit}>
                <label>
                    Title of game
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
                </label>

                {/* <label>
                    Skip Time
                    <div className="CreateGame-small-description">Time penalty for skipping a question (in seconds).</div>
                    <input type="number" value={skipTime} onChange={e => {
                        if (e.target.value >= 0) {
                            setSkipTime(e.target.value)
                        }
                    }} placeholder="Default: 10" />
                </label> */}

                <label>
                    Questions per round
                    <input type="number" value={questionsPerRound} onChange={e => {
                        if (e.target.value >= 0) {
                            setQuestionsPerRound(e.target.value)
                        }
                    }} placeholder="Default: 10" />
                </label>

                {/* <label>
                    Time per round
                    <input type="number" value={timePerRound} placeholder="Default: 120" />
                </label> */}

                <label>
                    Questions and answers
                    <div className="CreateGame-small-description">The format should be:</div>
                    <div className="CreateGame-small-description">Q1 [tab] A1</div>
                    <div className="CreateGame-small-description">Q2 [tab] A2</div>
                    <div className="CreateGame-small-description">(You can import from Quizlet using the default export settings.)</div>
                    <textarea value={qna} onChange={e => setQna(e.target.value)}></textarea>
                </label>

                <button className="CreateGame-submit-button" type="submit">Submit</button>
            </form>
        </div>
    );
}

export default CreateGame;