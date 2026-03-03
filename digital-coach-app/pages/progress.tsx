import AuthGuard from "@App/lib/auth/AuthGuard";
// import styles from "@App/styles/ProgressPage.module.scss";
import styles from "@App/styles/HistoryPage.module.scss";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Award, Target, TrendingUp, Calendar, Clock, ChevronRight } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { IInterview } from "@App/lib/interview/models"


export default function ProgressPage() { 
  const [interviews, setInterviews] = useState<IInterview[]>([]); // stores an array of all the user's interviews
  const [averageScore, setAverageScore] = useState<number>(100); // user's average score across all interview performances
  const [improvement, setImprovement] = useState<number>(100); // how much the user has improved overtime
  const router = useRouter();

  // THIS DATA IS TEMPORARY UNTIL WE IMPLEMENT THE FUNCTION TO READ THE INTERVIEWS FROM FIREBASE
  const mockData = {
      "id": "vsoSA7V72JFdBPMLJL29",
      "date": "03/04/2024",
      "timeStarted": "20:30",
      "duration": "5m 30s",
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
            },
            star: {
                score: 88,
                summary: "To elevate your solid foundation, focus on quantifying your 'Result' with concrete metrics and explicitly highlighting your individual contributions rather than just the team's effort during the 'Action' phase."
            }
          }
      },
      "metrics": {
          "filler_count": 2,
          "overall_score": 99,
          "wpm": 100,
      },
      "transcript": [],
      "url": "google.com",
  }

  useEffect(() => {
    setInterviews([...interviews, mockData, mockData])
  }, [])

  /**
   * TODO: Fetch all of the user's interviews using the Firebase Client SDK.
   */
  const getInterviews = async () => {
     
  }

  /**
   * Computes a user's improvement over time. This can be done in different ways, e.g. slope of linear regression. Currently using exponential moving average (EMA) where recent performance scores have more weight in computing the average which prioritizes the user's most recent capability to interview.
   */
  const calculateImprovement = () => {

  }

  /**
   * Computes the user's average performance score.
   */
  const calculateAverage = () => {
   
  }

  /**
   * Given an interview, create a button that navigates user to its results page on click.
   * @param interview The interview the button is for
   */
  const createInterviewBtn = (interview: IInterview) => {
    const btn = <button
      key={interview.id} // identifier for button within an array of buttons
      onClick={() => router.push(`/interviews/${interview.id}`)}
      className="interview-item"
      >

      <div className={styles.itemContent}>
        <div className={styles.itemMain}>
          <div className={styles.itemPrimary}>
            <div className={styles.scoreBadge}>
              <span className={styles.scoreValue}>
                {interview.metrics.overall_score}
              </span>
            </div>

            <div className={styles.itemInfo}>
              <div className={`${styles.infoRow} ${styles.date}`}>
                <Calendar/>
                <span>
                  {new Date(`${interview.date} ${interview.timeStarted}`).toLocaleDateString("en-US", { 
                    weekday: "long",
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit", 
                  })}
                </span>
              </div>
              <div className={`${styles.infoRow} ${styles.duration}`}>
                <Clock/>
                <span>
                  Duration: {interview.duration}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.itemMetrics}>
            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <Award/>
                <span>STAR</span>
              </div>
              <span className={styles.metricValue}>
                  {interview.feedback.overall_competency.star.score}
              </span>
            </div>
                
            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <TrendingUp/>
                <span>Pacing</span>
              </div>
              <span className={styles.metricValue}>
                {interview.metrics.wpm}
              </span>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <Target/>
                <span>Fillers</span>
              </div>
              <span className={styles.metricValue}>
                {interview.metrics.filler_count}
              </span>
            </div>
          </div>
        </div>

        <ChevronRight className={styles.chevronIcon}/>
      </div>
    </button>

    return btn;
  }
  return (
    <AuthGuard>
      <div className={styles.ProgressPage}>
        <div className={styles.pageHeader}>
          <h1>Interview History</h1>
          <p>Track your interview results and performance over time.</p>
        </div>

        {/* Statistics */}
        {interviews.length > 0 && (
          <div className={styles.statisticsGrid}>
            {/* Interview Count */}
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon}>
                  <Award/>
                </div>

                <h3>Total Interviews</h3>
              </div>
              <p className={styles.statValue}>{interviews.length}</p>
            </div>

            {/* Average Score */}
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon}>
                  <Target/>
                </div>
                <h3>Average Score</h3>
              </div>
              <p className={styles.statValue}>{averageScore}</p>
            </div>

            {/* Overall Improvement */}
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
               <div className={styles.statIcon}>
                  <TrendingUp/>
                </div> 
                <h3>Momentum</h3>
              </div>
                <p className={styles.statValue}>{improvement}</p>
                <p className={styles.statLabel}>Improvement over time</p>
            </div>
          </div>
        )}

        {/* Interview List */}
        <div className={styles.interviewsList}>
          <div className={styles.listHeader}>
            <h2>Past Interviews</h2>
          </div>
        </div>

        {/* Handle case where there's no interview */}
        {interviews.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Award/>
            </div>
            <h3>No interviews yet</h3>
            <p>
              Start your first interview to begin tracking your progress!
              </p>
              <button
                onClick={() => router.push("/naturalconversation")}>
                  Start Interview
                </button>
          </div>
        ) : (
          // for every interview, create a button that navigates them to their individual results (i.e. /interviews/[id])
          <div className={styles.tableContainer}>
              {interviews.map((interview) => createInterviewBtn(interview))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

// function ProgressInit() {
//   const { userData } = useAuth();
//   return (
//     <div className={styles.ProgressPage}>
//       <h1>Your Progress</h1>

//       <div className={styles.ProgressPage_avatarWrapper}>
//         {userData?.avatarUrl && (
//           <Avatar size={125} src={userData?.avatarUrl} />
//         )}
//       </div>

//       <div className={styles.ProgressPage_body}>
//         <div className={styles.ProgressPage_bodyLeft}>
//           <Card title="Initial Interview">
//             <Link href="/video" className={styles.linksText}>
//               Start an Interview
//             </Link>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Progress() {
//   //Store user's id here
//   const { userData } = useAuth();
//   let hasInterviewed = userData?.hasCompletedInterview;
//   //Add flag to user that says if they've completed an interview or not
//   if (hasInterviewed) {
//     return (
//       <AuthGuard>
//         <ProgressPage />
//       </AuthGuard>
//     );
//   } else {
//     return (
//       <AuthGuard>
//         <ProgressInit />
//       </AuthGuard>
//     );
//   }
// }
