import { useEffect, useState, useRef } from 'react';

const BotGIF = ({state}) => {
    const [gifSrc, setGifSrc] = useState('');    
    const [Message, setMessage] = useState('');
    const gifUrls = {
        not_engaged: '/GIFs/not_engaged.gif',
        boredom: '/GIFs/Boredom.gif',
        confusion: '/GIFs/Confusion.gif',
        delight: '/GIFs/Delight.gif',
        engaged: '/GIFs/Engagement.gif',
        frustration: '/GIFs/Frustation.gif',
    };
    const preloadedGifs = useRef({});

    useEffect(() => {
        Object.entries(gifUrls).forEach(([key, src]) => {
            const img = new Image();
            img.src = src;
            preloadedGifs.current[key] = src;
        });
    }, []);

    useEffect(() => {
        const selectedGif = state?.prediction ? preloadedGifs.current[state.prediction] : gifUrls.not_engaged;
        setGifSrc(selectedGif);
        setMessage(state['message'] || "Let's stay focused and make progress!");
    }, [state]);
   
    return (
        <div style={styles.container}>
            {/* Bot Image */}
            <img src={gifSrc} alt="Emotion Bot" style={styles.image} />
            {/* Speech Bubble */}
            <div style={styles.speechBubble}>
                <p style={styles.text}>{Message || "Hello! I'm here to help you."}</p>
                {/* Tail of the speech bubble */}
                <div style={styles.speechBubbleTail}></div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    image: {
        width: "100%",
        marginBottom: "20px",
    },
    speechBubble: {
        display: "inline-block",
        backgroundColor: "#f1f1f1",
        borderRadius: "15px",
        padding: "15px 20px",
        maxWidth: "300px",
        textAlign: "left",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        position: "relative",
        fontFamily: "Arial, sans-serif",
    },
    text: {
        margin: 0,
        fontSize: "14px",
        lineHeight: "1.5",
    },
    speechBubbleTail: {
        content: '""',
        position: "absolute",
        bottom: "-10px",
        left: "20px",
        width: "0",
        height: "0",
        borderStyle: "solid",
        borderWidth: "10px 10px 0 0",
        borderColor: "#f1f1f1 transparent transparent transparent",
    },
};

export default BotGIF;

