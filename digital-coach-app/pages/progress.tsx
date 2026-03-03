import { useAuth } from "@App/lib/auth/AuthContextProvider";
import AuthGuard from "@App/lib/auth/AuthGuard";
import styles from "@App/styles/ProgressPage.module.scss";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Award, Target, TrendingUp } from "lucide-react";
import { Timestamp, doc, getDoc } from "firebase/firestore";
import { buttonBaseClasses } from "@mui/material";
import { IInterview } from "@App/lib/interview/models"


export default function ProgressPage() {
  const { userData } = useAuth();
  // DELETE: TESTING ONLY: CHECK OLD INTERVIEW PERFORMANCE
  // const router = useRouter();
  // useEffect(() => {
  //   console.log("In Progress Page...");
  //   router.push("http://localhost:3000/client_test");
  //   console.log("Querying Interview Results...")
  // }, []);
  
  
  const [interviews, setInterviews] = useState<number[]>([]); // stores an array of all the user's interviews
  const [averageScore, setAverageScore] = useState<number>(100); // user's average score across all interview performances
  const [improvement, setImprovement] = useState<number>(100); // how much the user has improved overtime
  const router = useRouter();

  useEffect(() => {
    // THIS IS TEMPORARY UNTIL WE IMPLEMENT THE FUNCTION TO READ THE INTERVIEWS FROM FIREBASE
    // setInterviews([...interviews, 1])

    
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
    <button
      key={interview.id} // identifier for button within an array of buttons
      onClick={() => router.push(`/interview/${interview.id}`)}
      className="interview-item"
      >

      <div className="item-content">
        <div className="item-main">
          <div className="item-primary">
            <div className="score-badge">
              {interview.metrics.overall_score}
            </div>
          </div>
        </div>
      </div>
    </button>
  }

  return (
    <AuthGuard>
      <div className={styles.ProgressPage}>
        <p>Interview History</p>
        <p>This is the new interview history page</p>

        {/* Statistics */}
        {interviews.length > 0 && (
          <div className="statistics-grid">
            {/* Interview Count */}
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">
                  <Award/>
                </div>

                <h3>Total Interviews</h3>
              </div>
              <p>{interviews.length}</p>
            </div>

            {/* Average Score */}
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">
                  <Target/>
                </div>
                <h3>Average Score</h3>
              </div>
              <p>{averageScore}</p>
            </div>

            {/* Overall Improvement */}
            <div className="stat-card">
              <div className="stat-header">
               <div className="stat-icon">
                  <TrendingUp/>
                </div> 
                <h3>Momentum</h3>
                <p className={"stat-value"}>{improvement}</p>
                <p className="stat-label">Improvement over time</p>
              </div>
            </div>
          </div>
        )}

        {/* Interview List */}
        <div className="interviews-list">
          <div className="list-header">
            <h2>Past Interviews</h2>
          </div>
        </div>

        {/* Handle case where there's no interview */}
        {interviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
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
          // for every interview, create a button that navigates them to their individual results
          <div>

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
