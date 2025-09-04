import { useState } from "react";

const AnnotationForm = ({ onSubmit }) => {
    const [comment, setComment] = useState("");
    const [time, setTime] = useState(0);

    const handleSubmit = () => {
        onSubmit({ time, comment });
        setComment("");
    };

    return (
        <div>
            <input 
                type="number" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                placeholder="時間（秒）"
            />
            <input 
                type="text" 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                placeholder="コメント"
            />
            <button onClick={handleSubmit}>追加</button>
        </div>
    );
};

export default AnnotationForm;
