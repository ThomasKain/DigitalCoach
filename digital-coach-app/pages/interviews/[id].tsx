import { useRouter } from "next/router";

/**
 * Webpage for a specific interview. 
 * @returns Webpage that displays the interview-related results
 */
export default function InterviewResults() {
    const router = useRouter();
    // THIS DATA IS TEMPORARY UNTIL WE IMPLEMENT THE FUNCTION TO READ THE INTERVIEWS FROM FIREBASE
    const mockData = {
        "id": "vsoSA7V72JFdBPMLJL29",
        "date": "03/04/2024",
        "timeStarted": "20:30",
        "duration": "5:30",
        "feedback": {
            ai_feedback: "Your enthusiasm was evident, and you established a great rapport early on. You used the STAR method effectively for behavioral questions, but your technical answers were slightly vague. Next time, focus more on specific metrics to quantify your past achievements, and try to pause briefly before answering complex questions to gather your thoughts.",
            overall_competency: {
                clarity: {
                score: 8,
                summary: "Excellent pacing at 150 WPM; your delivery was very clear and easy to follow.",
                },
                confidence: {
                score: 10,
                summary: "You had approximately 10 filler words or hedge phrases per minute, but you projected strong confidence throughout your interview!",
                },
                engagement: {
                score: 9,
                summary: "Great job varying your tone with 98% of your responses being expressive! You used 10 high-value keywords effectively in your responses.",
                }
            }
        },
        "metrics": {
            "filler_count": 2,
            "overall_score": 99,
            "wmp": 100,
            "star_score": 98
        },
        "transcript": [],
        "url": "google.com",
    }

    /**
     * Gets the interview document using its id from the URL.
     */
    const getInterview = async () => {

    }


    return (
        <p>Interview's id={router.query.id}</p>
    )
}