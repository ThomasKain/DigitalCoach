import AuthGuard from "@App/lib/auth/AuthGuard";
// import styles from "@App/styles/ProgressPage.module.scss";
import styles from "@App/styles/HistoryPage.module.scss";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Award, Target, TrendingUp, Calendar, Clock, ChevronRight } from "lucide-react";
import { IInterview } from "@App/lib/interview/models"
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import Spinner from "@App/components/atoms/Spinner";


export default function ProgressPage() { 
  const [interviews, setInterviews] = useState<IInterview[]>([]); // stores an array of all the user's interviews (the data function we use returns the list in descending chronological order)
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const { user } = useAuth();

  // Get user's analyzed interview from database 
  useEffect(() => {
    /**
     *  Fetch all of the user's analyzed interviews using the Firebase Client SDK.
     */
    const getInterviews = async () => {
      try {
        const host = window ? "localhost:8000" : "api"; // if we're not in browser, user backend service name (currently 'api'), otherwise use localhost
        const response = await fetch(`http://${host}/api/interview/${user?.uid}`);
        if (response.ok) {
          console.log("Successfully fetched interviews!");
          const data = await response.json();
          setInterviews(data);
          setLoading(false);
        } else {
          throw `Error: ${response.statusText || "Something went wrong"}`;
        }
      } catch (e) {
        throw `Error getting interviews: ${e}`;
      }
    };
    // wait until user context is loaded before getting interviews
    if (user) {
      getInterviews();
    }
    
  }, [user]);

  /**
   * Computes a user's improvement over time. This can be done in different ways, e.g. slope of linear regression. 
   * 
   * Currently we're returning the delta in the user's exponential moving average (EMA) where recent performance scores have more weight in computing the average which prioritizes the user's most recent capability to interview. 
   * 
   * We can assume the interviews are in descending chronological order because of the implementation of the database function used to get the interviews. But EMA needs ascending chronological order.
   */
  const calculateImprovement = () => {
    if (interviews.length) {
      const revInterviews = interviews.toReversed(); // reverse the array from descending to ascending chronological order
      let ema = revInterviews[0].metrics!.overall_score; // initialize ema to be the first value
      let prevEMA = ema; // stores the previous EMA
      const smoothing = 2; // exponential moving average has a smoothing factor where the larger the factor, the more weight recent interview scores have on the exponential moving average (a factor of 2 is commonly used)
      const multiplier = smoothing / (revInterviews.length + 1); // compute the multiplier for EMA
      
      // iterate over remaining array to compute EMA
      for (let i=1; i < revInterviews.length; i++) {
        const interviewScore = revInterviews[i].metrics!.overall_score; // current interview's overall score
        prevEMA = ema; // store ema before overwritting it
        ema = (interviewScore * multiplier) + (ema * (1-multiplier)); // ema = (current interview score * multiplier) plus (previous ema * (1 - multiplier))
      }
      
      const delta = Math.trunc(ema-prevEMA) // return the change between the previous EMA and current EMA
      if (delta >= 0) return `+${delta}`
      else return delta 
    } else { 
      return 0;
    }
  }

  /**
   * Compute the user's arithmetic average interview performance score.
   */
  const calculateAverage = () => {
    if (interviews.length) {
      let sum = 0; 
      for (const interview of interviews) {
        console.log(`interview=${interview.id}`)
        sum += interview.metrics!.overall_score
      }
      return Math.floor(sum / interviews.length);
    } else {
      return 0;
    }
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
  
  if (isLoading) {
    return (
      <AuthGuard>
        <Spinner message="Getting interviews..."/>
      </AuthGuard>
    ) 
  }
  return (
    <AuthGuard>
      <div className={styles.ProgressPage}>
        <div className={styles.pageHeader}>
          <h1>Interview History</h1>
          <p>Track your interview results and performance over time. Some interviews may not appear as they're being analyzed.</p>
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
              {/* user's average score across all interview performances */}
              <p className={styles.statValue}>{interviews && calculateAverage()}</p>
            </div>

            {/* Overall Improvement */}
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
               <div className={styles.statIcon}>
                  <TrendingUp/>
                </div> 
                <h3>Momentum</h3>
              </div>
                {/* how much the user has improved overtime  */}
                <p className={styles.statValue}>{interviews && calculateImprovement()}</p>
                <p className={styles.statLabel}>Improvement Over Time (EMA Δ)</p>
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
