// // AssignmentSubmitClient.tsx
// 'use client';

// import React, { useEffect, useState, useRef, useMemo } from 'react';
// import { useParams } from 'next/navigation';

// // -------------------------------
// // Types
// // -------------------------------
// export interface Question {
//   question: string;
//   type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
//   options?: string[];
//   correctAnswer?: string | string[];
//   points: number;
//   order?: number;
// }

// export interface Assignment {
//   _id: string;
//   title: string;
//   description?: string;
//   type?: string;
//   instructions?: string;
//   status: string;
//   totalPoints?: number;
//   passingScore?: number;
//   dueDate?: string;
//   allowLateSubmission?: boolean;
//   latePenalty?: number;
//   maxAttempts?: number;
//   timeLimit?: number;
//   courseId?: { _id: string; title?: string } | null;
//   questions: Question[];
// }

// export interface AnswerEntry {
//   questionId: string;
//   answer: string | string[];
// }

// export interface SubmissionResponse {
//   _id: string;
//   assignmentId: string;
//   studentId: string;
//   status: string;
//   score?: number;
//   attemptNumber: number;
//   submittedAt: string;
// }

// interface IUserLS {
//   _id: string;
//   firstName?: string;
//   lastName?: string;
//   email?: string;
// }

// interface IEnrollment {
//   _id: string;
//   studentId: string | { _id: string };
//   courseId: string | { _id: string; title?: string };
// }

// interface IAssignment {
//   _id: string;
//   courseId: { _id: string; title?: string } | string;
//   title: string;
//   description?: string;
//   type?: string;
//   status?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface ApiResponse<T> {
//   success?: boolean;
//   data: T;
//   message?: string;
// }

// // -------------------------------
// // Component
// // -------------------------------
// export default function AssignmentSubmitClient() {
//   const params = useParams();
//   const routeId = (params && (params as any).id) ?? null;

//   const [assignmentId, setAssignmentMydataId] = useState<string | null>(routeId);
//   const mountedRef = useRef(true);

//   // assignment states
//   const [assignment, setAssignment] = useState<Assignment | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const [answers, setAnswers] = useState<AnswerEntry[]>([]);
//   const [submitting, setSubmitting] = useState<boolean>(false);
//   const [result, setResult] = useState<SubmissionResponse | null>(null);
//   const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);

//   const startedAtRef = useRef<number>(0);
//   const timerRef = useRef<number | null>(null);
//   const [timeSpentSec, setTimeSpentSec] = useState<number>(0);

//   // stable localStorage key
//   const LOCAL_STORAGE_KEY = useMemo(
//     () => (assignmentId ? `assignment_draft_${assignmentId}` : 'assignment_draft_unknown'),
//     [assignmentId]
//   );

//   // discover assignment if no route id
//   useEffect(() => {
//     mountedRef.current = true;

//     if (assignmentId) {
//       return () => {
//         mountedRef.current = false;
//       };
//     }

//     async function discoverAssignmentForUser() {
//       try {
//         // 1) read user from localStorage
//         const dd = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
//         const ee: IUserLS | null = dd ? JSON.parse(dd) : null;
//         const userId = ee?._id;
//         if (!userId) {
//           console.warn('[INFO] No user id in localStorage — discovery aborted.');
//           return;
//         }

//         // 2) fetch enrollments
//         const enrollRes = await fetch('/api/enrollments/my', { credentials: 'include' });
//         const enrollJson: ApiResponse<IEnrollment[]> = await enrollRes.json();
//         const enrollments = enrollJson?.data ?? [];

//         // 3) filter enrollments for this student
//         const myEnrollments = enrollments.filter((e) => {
//           const sid = typeof e.studentId === 'string' ? e.studentId : (e.studentId as any)?._id;
//           return sid === userId;
//         });

//         const enrolledCourseIds = Array.from(
//           new Set(
//             myEnrollments
//               .map((e) => (typeof e.courseId === 'string' ? e.courseId : (e.courseId as any)?._id))
//               .filter(Boolean) as string[]
//           )
//         );

//         if (enrolledCourseIds.length === 0) {
//           console.info('[INFO] No enrolled courses.');
//           return;
//         }

//         // 4) fetch assignments
//         const assignRes = await fetch('/api/assignments', { credentials: 'include' });
//         const assignJson: ApiResponse<IAssignment[]> = await assignRes.json();
//         const allAssignments = assignJson?.data ?? [];

//         // 5) filter assignments by enrolled course ids
//         const matched = allAssignments.filter((a) => {
//           const cid = typeof a.courseId === 'string' ? a.courseId : (a.courseId as any)?._id;
//           return cid && enrolledCourseIds.includes(cid);
//         });

//         if (matched.length === 0) {
//           console.info('[INFO] No assignments matched enrolled courses.');
//           return;
//         }

//         if (mountedRef.current) {
//           setAssignmentMydataId(matched[0]._id);
//         }
//       } catch (err) {
//         console.error('[ERROR] discovering assignment:', err);
//       }
//     }

//     discoverAssignmentForUser();

//     return () => {
//       mountedRef.current = false;
//     };
//   }, [assignmentId]);

//   // load assignment when id is set
//   useEffect(() => {
//     let mounted = true;
//     mountedRef.current = true;

//     if (!assignmentId) {
//       setError('No assignment ID found in route.');
//       setLoading(false);
//       return () => {
//         mountedRef.current = false;
//       };
//     }

//     setLoading(true);
//     setError(null);

//     (async () => {
//       try {
//         const res = await fetch(`/api/assignments/${assignmentId}`, { credentials: 'include' });
//         if (!res.ok) {
//           const json = await res.json().catch(() => ({}));
//           throw new Error(json?.message || `Failed to load assignment (${res.status})`);
//         }
//         const json = await res.json();
//         if (!mounted) return;
//         const a: Assignment = (json && json.data) || json;
//         setAssignment(a ?? null);

//         // load draft or initialize answers
//         const draft = (() => {
//           try {
//             const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
//             return raw ? JSON.parse(raw) : null;
//           } catch {
//             return null;
//           }
//         })();

//         if (draft && Array.isArray(draft.answers)) {
//           setAnswers(draft.answers as AnswerEntry[]);
//         } else if (a) {
//           const initial = (a.questions || []).map((q, i) => ({
//             questionId: ((q.order ?? i) as number).toString(),
//             answer: Array.isArray(q.correctAnswer) ? [] : '',
//           }));
//           setAnswers(initial);
//         }

//         // start timer
//         startedAtRef.current = Date.now();
//         timerRef.current = window.setInterval(() => {
//           setTimeSpentSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
//         }, 1000);

//         setLoading(false);
//       } catch (err: unknown) {
//         if (!mounted) return;
//         const message = err instanceof Error ? err.message : String(err);
//         setError(message || 'Failed to load assignment');
//         setLoading(false);
//       }
//     })();

//     return () => {
//       mounted = false;
//       mountedRef.current = false;
//       if (timerRef.current) {
//         window.clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [assignmentId, LOCAL_STORAGE_KEY]);

//   // autosave
//   useEffect(() => {
//     if (!assignment) return;
//     try {
//       localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ answers }));
//     } catch {
//       // ignore
//     }
//   }, [answers, assignment, LOCAL_STORAGE_KEY]);

//   // helpers to handle answers
//   function setAnswer(questionId: string, value: string | string[]) {
//     setAnswers((prev) => {
//       const copy = [...prev];
//       const idx = copy.findIndex((x) => x.questionId === questionId);
//       if (idx === -1) {
//         copy.push({ questionId, answer: value });
//       } else {
//         copy[idx] = { ...copy[idx], answer: value };
//       }
//       return copy;
//     });
//   }

//   function toggleMulti(questionId: string, option: string) {
//     setAnswers((prev) => {
//       const copy = [...prev];
//       const idx = copy.findIndex((x) => x.questionId === questionId);
//       if (idx === -1) return prev;

//       const current = Array.isArray(copy[idx].answer) ? [...copy[idx].answer] : [];
//       const pos = current.indexOf(option);
//       if (pos === -1) current.push(option);
//       else current.splice(pos, 1);

//       copy[idx] = { ...copy[idx], answer: current };
//       return copy;
//     });
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!assignmentId) {
//       setAlert({ type: 'danger', message: 'Missing assignment ID.' });
//       return;
//     }

//     setSubmitting(true);
//     setAlert(null);

//     const payload = {
//       answers,
//       timeSpent: timeSpentSec,
//     };

//     try {
//       const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
//         method: 'POST',
//         credentials: 'include',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const json = await res.json().catch(() => ({}));
//       if (!res.ok) {
//         throw new Error(json?.message || `Submission failed (${res.status})`);
//       }

//       const data: SubmissionResponse = json.data || json;
//       setResult(data ?? null);
//       localStorage.removeItem(LOCAL_STORAGE_KEY);
//       if (timerRef.current) {
//         window.clearInterval(timerRef.current);
//         timerRef.current = null;
//       }

//       setAlert({ type: 'success', message: json.message || 'Submitted successfully' });
//     } catch (err: unknown) {
//       const message = err instanceof Error ? err.message : String(err);
//       setAlert({ type: 'danger', message: message || 'Submission failed' });
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   // small helpers
//   function formatTime(sec: number) {
//     const m = Math.floor(sec / 60);
//     const s = sec % 60;
//     return `${m}m ${s}s`;
//   }

//   // render a single question card
//   function renderQuestion(q: Question, idx: number) {
//     const qId = ((q.order ?? idx) as number).toString();
//     const entry = answers.find((a) => a.questionId === qId);
//     const val = entry?.answer ?? (Array.isArray(q.correctAnswer) ? [] : '');

//     return (
//       <div className="card mb-4 shadow-sm" key={qId}>
//         <div className="card-body">
//           <div className="d-flex justify-content-between align-items-start mb-2">
//             <h6 className="card-title mb-0">
//               {idx + 1}. {q.question}
//             </h6>
//             <div className="text-end">
//               <small className="text-muted d-block">Points: <span className="badge bg-info text-dark">{q.points ?? '-'}</span></small>
//               <small className="text-muted">Type: <span className="badge bg-secondary">{q.type}</span></small>
//             </div>
//           </div>

//           <div className="mt-3">
//             {q.type === 'MULTIPLE_CHOICE' && Array.isArray(q.options) && (
//               <ul className="list-group list-group-flush">
//                 {Array.isArray(q.correctAnswer) ? (
//                   q.options.map((opt, i) => (
//                     <li key={i} className="list-group-item d-flex align-items-center">
//                       <input
//                         id={`q_${qId}_opt_${i}`}
//                         className="form-check-input me-2"
//                         type="checkbox"
//                         checked={Array.isArray(val) && val.includes(opt)}
//                         onChange={() => toggleMulti(qId, opt)}
//                         aria-label={`Toggle option ${opt}`}
//                       />
//                       <label htmlFor={`q_${qId}_opt_${i}`} className="mb-0">
//                         {opt}
//                       </label>
//                     </li>
//                   ))
//                 ) : (
//                   q.options.map((opt, i) => (
//                     <li key={i} className="list-group-item d-flex align-items-center">
//                       <input
//                         id={`q_${qId}_opt_${i}`}
//                         className="form-check-input me-2"
//                         type="radio"
//                         name={`q_${qId}`}
//                         checked={val === opt}
//                         onChange={() => setAnswer(qId, opt)}
//                         aria-label={`Select option ${opt}`}
//                       />
//                       <label htmlFor={`q_${qId}_opt_${i}`} className="mb-0">
//                         {opt}
//                       </label>
//                     </li>
//                   ))
//                 )}
//               </ul>
//             )}

//             {q.type === 'TRUE_FALSE' && (
//               <div className="d-flex gap-3">
//                 <div className="form-check">
//                   <input
//                     id={`q_${qId}_true`}
//                     className="form-check-input"
//                     type="radio"
//                     name={`q_${qId}`}
//                     checked={val === 'true'}
//                     onChange={() => setAnswer(qId, 'true')}
//                   />
//                   <label htmlFor={`q_${qId}_true`} className="form-check-label">
//                     True
//                   </label>
//                 </div>

//                 <div className="form-check">
//                   <input
//                     id={`q_${qId}_false`}
//                     className="form-check-input"
//                     type="radio"
//                     name={`q_${qId}`}
//                     checked={val === 'false'}
//                     onChange={() => setAnswer(qId, 'false')}
//                   />
//                   <label htmlFor={`q_${qId}_false`} className="form-check-label">
//                     False
//                   </label>
//                 </div>
//               </div>
//             )}

//             {(q.type === 'SHORT_ANSWER' || q.type === 'ESSAY') && (
//               <textarea
//                 className="form-control mt-2"
//                 rows={q.type === 'ESSAY' ? 6 : 2}
//                 value={typeof val === 'string' ? val : ''}
//                 onChange={(e) => setAnswer(qId, e.target.value)}
//                 aria-label={`Answer for question ${idx + 1}`}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // UI states
//   if (!assignmentId) return <div className="p-4">No assignment ID found in route.</div>;
//   if (loading) return <div className="p-4">Loading assignment...</div>;
//   if (error) return <div className="alert alert-danger m-4">{error}</div>;
//   if (!assignment) return <div className="alert alert-warning m-4">Assignment not found.</div>;

//   return (
//     <div className="container my-5">
//       <div className="row justify-content-center">
//         <div className="col-lg-8">
//           <div className="mb-4">
//             <h2 className="h4 mb-1">{assignment.title}</h2>
//             <p className="text-muted mb-1">Course: {assignment.courseId?.title || '—'}</p>
//             {assignment.description && <p className="mb-2">{assignment.description}</p>}

//             <div className="d-flex flex-wrap gap-3 align-items-center">
//               <small className="text-muted">Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'No deadline'}</small>
//               <small className="text-muted">Status: <span className="fw-semibold">{assignment.status}</span></small>
//               {assignment.totalPoints !== undefined && <small className="text-muted">Total points: {assignment.totalPoints}</small>}
//             </div>
//           </div>

//           {alert && (
//             <div className={`alert ${alert.type === 'success' ? 'alert-success' : alert.type === 'danger' ? 'alert-danger' : 'alert-info'}`} role="alert">
//               {alert.message}
//             </div>
//           )}

//           {result && (
//             <div className="card mb-4 border-success">
//               <div className="card-body">
//                 <h5 className="card-title">Submission result</h5>
//                 <p className="mb-1">Status: <strong>{result.status}</strong></p>
//                 {result.score !== undefined && <p className="mb-1">Score: <strong>{result.score}</strong></p>}
//                 <p className="mb-0">Attempt: {result.attemptNumber} • Submitted at: {new Date(result.submittedAt).toLocaleString()}</p>
//               </div>
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             {assignment.questions && assignment.questions.length === 0 && (
//               <div className="alert alert-info">No questions available for this assignment.</div>
//             )}

//             {assignment.questions && assignment.questions.map((q, idx) => renderQuestion(q, idx))}

//             <div className="d-flex justify-content-between align-items-center mt-3">
//               <div>
//                 <small className="text-muted">Time spent: <span className="fw-semibold">{formatTime(timeSpentSec)}</span></small>
//                 {assignment.allowLateSubmission === false && assignment.dueDate && new Date() > new Date(assignment.dueDate) && (
//                   <div className="text-danger small mt-1">Warning: Assignment deadline has passed. Late submissions are not allowed.</div>
//                 )}
//               </div>

//               <div>
//                 <button type="submit" className="btn btn-primary" disabled={submitting}>
//                   {submitting ? 'Submitting...' : 'Submit Assignment'}
//                 </button>
//               </div>
//             </div>
//           </form>

//           <div className="mt-3 small text-muted">Draft is autosaved in your browser. You can continue later.</div>
//         </div>
//       </div>
//     </div>
//   );
// }



// AssignmentSubmitClient.tsx
'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';

// -------------------------------
// Types (Keeping your types as is)
// -------------------------------
export interface Question {
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  order?: number;
}

export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  instructions?: string;
  status: string;
  totalPoints?: number;
  passingScore?: number;
  dueDate?: string;
  allowLateSubmission?: boolean;
  latePenalty?: number;
  maxAttempts?: number;
  timeLimit?: number;
  courseId?: { _id: string; title?: string } | null;
  questions: Question[];
}

export interface AnswerEntry {
  questionId: string;
  answer: string | string[];
}

export interface SubmissionResponse {
  _id: string;
  assignmentId: string;
  studentId: string;
  status: string;
  score?: number;
  attemptNumber: number;
  submittedAt: string;
}

interface IUserLS {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface IEnrollment {
  _id: string;
  studentId: string | { _id: string };
  courseId: string | { _id: string; title?: string };
}

interface IAssignment {
  _id: string;
  courseId: { _id: string; title?: string } | string;
  title: string;
  description?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

// -------------------------------
// Component
// -------------------------------
export default function AssignmentSubmitClient() {
  const params = useParams();
  const routeId = (params && (params as any).id) ?? null;

  const [assignmentId, setAssignmentMydataId] = useState<string | null>(routeId);
  const mountedRef = useRef(true);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerEntry[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<SubmissionResponse | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'info'; message: string } | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const [timeSpentSec, setTimeSpentSec] = useState<number>(0);

  const LOCAL_STORAGE_KEY = useMemo(
    () => (assignmentId ? `assignment_draft_${assignmentId}` : 'assignment_draft_unknown'),
    [assignmentId]
  );

  // discover assignment if no route id
  useEffect(() => {
    mountedRef.current = true;

    if (assignmentId) {
      return () => {
        mountedRef.current = false;
      };
    }

    async function discoverAssignmentForUser() {
      try {
        const dd = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const ee: IUserLS | null = dd ? JSON.parse(dd) : null;
        const userId = ee?._id;
        if (!userId) {
          console.warn('[INFO] No user id in localStorage — discovery aborted.');
          return;
        }

        const enrollRes = await fetch('/api/enrollments/my', { credentials: 'include' });
        const enrollJson: ApiResponse<IEnrollment[]> = await enrollRes.json();
        const enrollments = enrollJson?.data ?? [];

        const myEnrollments = enrollments.filter((e) => {
          const sid = typeof e.studentId === 'string' ? e.studentId : (e.studentId as any)?._id;
          return sid === userId;
        });

        const enrolledCourseIds = Array.from(
          new Set(
            myEnrollments
              .map((e) => (typeof e.courseId === 'string' ? e.courseId : (e.courseId as any)?._id))
              .filter(Boolean) as string[]
          )
        );

        if (enrolledCourseIds.length === 0) {
          console.info('[INFO] No enrolled courses.');
          return;
        }

        const assignRes = await fetch('/api/assignments', { credentials: 'include' });
        const assignJson: ApiResponse<IAssignment[]> = await assignRes.json();
        const allAssignments = assignJson?.data ?? [];

        const matched = allAssignments.filter((a) => {
          const cid = typeof a.courseId === 'string' ? a.courseId : (a.courseId as any)?._id;
          return cid && enrolledCourseIds.includes(cid);
        });

        if (matched.length > 0 && mountedRef.current) {
          setAssignmentMydataId(matched[0]._id);
        }
      } catch (err) {
        console.error('[ERROR] discovering assignment:', err);
      }
    }

    discoverAssignmentForUser();

    return () => {
      mountedRef.current = false;
    };
  }, [assignmentId]);

  // load assignment when id is set
  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    if (!assignmentId) {
      setError('No assignment ID found in route.');
      setLoading(false);
      return () => {
        mountedRef.current = false;
      };
    }

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`/api/assignments/${assignmentId}`, { credentials: 'include' });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.message || `Failed to load assignment (${res.status})`);
        }
        const json = await res.json();
        if (!mounted) return;
        const a: Assignment = (json && json.data) || json;
        setAssignment(a ?? null);

        // load draft or initialize answers
        const draft = (() => {
          try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })();

        if (draft && Array.isArray(draft.answers)) {
          setAnswers(draft.answers as AnswerEntry[]);
        } else if (a) {
          const initial = (a.questions || []).map((q, i) => ({
            questionId: ((q.order ?? i) as number).toString(),
            answer: Array.isArray(q.correctAnswer) ? [] : '',
          }));
          setAnswers(initial);
        }

        // start timer
        startedAtRef.current = Date.now();
        timerRef.current = window.setInterval(() => {
          setTimeSpentSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
        }, 1000);

        setLoading(false);
      } catch (err: unknown) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message || 'Failed to load assignment');
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      mountedRef.current = false;
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, LOCAL_STORAGE_KEY]);

  // autosave
  useEffect(() => {
    if (!assignment) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ answers }));
    } catch {
      // ignore
    }
  }, [answers, assignment, LOCAL_STORAGE_KEY]);

  // helpers to handle answers
  function setAnswer(questionId: string, value: string | string[]) {
    setAnswers((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((x) => x.questionId === questionId);
      if (idx === -1) {
        copy.push({ questionId, answer: value });
      } else {
        copy[idx] = { ...copy[idx], answer: value };
      }
      return copy;
    });
  }

  function toggleMulti(questionId: string, option: string) {
    setAnswers((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((x) => x.questionId === questionId);
      if (idx === -1) return prev;

      const current = Array.isArray(copy[idx].answer) ? [...copy[idx].answer] : [];
      const pos = current.indexOf(option);
      if (pos === -1) current.push(option);
      else current.splice(pos, 1);

      copy[idx] = { ...copy[idx], answer: current };
      return copy;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assignmentId) {
      setAlert({ type: 'danger', message: 'Missing assignment ID.' });
      return;
    }

    setSubmitting(true);
    setAlert(null);

    const payload = {
      answers,
      timeSpent: timeSpentSec,
    };

    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.message || `Submission failed (${res.status})`);
      }

      const data: SubmissionResponse = json.data || json;
      setResult(data ?? null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setAlert({ type: 'success', message: json.message || 'Submitted successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setAlert({ type: 'danger', message: message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  }

  // small helpers
  function formatTime(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  }

  function getQuestionStatus(qIndex: number): 'answered' | 'unanswered' | 'flagged' {
    const questionId = (assignment?.questions?.[qIndex]?.order ?? qIndex).toString();
    const entry = answers.find(a => a.questionId === questionId);
    if (!entry) return 'unanswered';
    
    const answer = entry.answer;
    if (Array.isArray(answer)) {
      return answer.length > 0 ? 'answered' : 'unanswered';
    }
    return answer?.toString().trim() ? 'answered' : 'unanswered';
  }

  // calculate progress
  const answeredCount = useMemo(() => {
    return answers.filter(entry => {
      const answer = entry.answer;
      if (Array.isArray(answer)) return answer.length > 0;
      return answer?.toString().trim() !== '';
    }).length;
  }, [answers]);

  const totalQuestions = assignment?.questions?.length || 0;
  const progressPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // render a single question card
  function renderQuestion(q: Question, idx: number) {
    const qId = ((q.order ?? idx) as number).toString();
    const entry = answers.find((a) => a.questionId === qId);
    const val = entry?.answer ?? (Array.isArray(q.correctAnswer) ? [] : '');

    return (
      <div className={`bg-white rounded-2xl shadow-lg border ${idx === activeQuestion ? 'border-blue-500' : 'border-gray-200'} p-6 mb-6 transition-all duration-300`}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {idx + 1}
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mb-2">
                  {q.type.replace('_', ' ')}
                </span>
                <h3 className="text-xl font-bold text-gray-900">{q.question}</h3>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
              <span className="text-sm font-semibold text-emerald-700">{q.points} points</span>
            </div>
          </div>
        </div>

        {q.instructions && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="icon-[tabler--info-circle] size-5 text-blue-500 mt-0.5"></span>
              <p className="text-sm text-blue-700">{q.instructions}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {q.type === 'MULTIPLE_CHOICE' && Array.isArray(q.options) && (
            <div className="space-y-3">
              {Array.isArray(q.correctAnswer) ? (
                // Multiple select
                q.options.map((opt, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 border border-gray-200 hover:border-blue-300 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group">
                    <div className={`flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center ${Array.isArray(val) && val.includes(opt) ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-blue-400'}`}>
                      {Array.isArray(val) && val.includes(opt) && (
                        <span className="icon-[tabler--check] size-4 text-white"></span>
                      )}
                    </div>
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => toggleMulti(qId, opt)}
                    >
                      <label className="cursor-pointer">
                        <div className="font-medium text-gray-900">{opt}</div>
                      </label>
                    </div>
                  </div>
                ))
              ) : (
                // Single select
                q.options.map((opt, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 border border-gray-200 hover:border-blue-300 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group">
                    <div className={`flex-shrink-0 w-6 h-6 border-2 rounded-full flex items-center justify-center ${val === opt ? 'border-blue-500 border-6' : 'border-gray-300 group-hover:border-blue-400'}`}>
                      {val === opt && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </div>
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setAnswer(qId, opt)}
                    >
                      <label className="cursor-pointer">
                        <div className="font-medium text-gray-900">{opt}</div>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {q.type === 'TRUE_FALSE' && (
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${val === 'true' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                onClick={() => setAnswer(qId, 'true')}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${val === 'true' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <span className="icon-[tabler--check] size-6"></span>
                  </div>
                  <span className="font-semibold text-lg text-gray-900">True</span>
                </div>
              </div>
              
              <div 
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${val === 'false' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                onClick={() => setAnswer(qId, 'false')}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${val === 'false' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                    <span className="icon-[tabler--x] size-6"></span>
                  </div>
                  <span className="font-semibold text-lg text-gray-900">False</span>
                </div>
              </div>
            </div>
          )}

          {(q.type === 'SHORT_ANSWER' || q.type === 'ESSAY') && (
            <div className="relative">
              <textarea
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                rows={q.type === 'ESSAY' ? 8 : 4}
                value={typeof val === 'string' ? val : ''}
                onChange={(e) => setAnswer(qId, e.target.value)}
                placeholder="Type your answer here..."
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                {typeof val === 'string' && val.length > 0 ? `${val.length} characters` : ''}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <span className="icon-[tabler--alert-circle] size-6 text-red-600"></span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Assignment</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                >
                  <span className="icon-[tabler--refresh] size-4"></span>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
              <div className="flex items-center flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="icon-[tabler--book] size-5 text-gray-400"></span>
                  <span className="text-gray-600">{assignment.courseId?.title || '—'}</span>
                </div>
                {assignment.dueDate && (
                  <div className="flex items-center gap-2">
                    <span className="icon-[tabler--calendar] size-5 text-gray-400"></span>
                    <span className="text-gray-600">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              <span className="icon-[tabler--menu-2] size-4"></span>
              {showSidebar ? 'Hide Navigation' : 'Show Navigation'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress: {answeredCount}/{totalQuestions} questions answered</span>
              <span className="text-sm font-bold text-blue-600">{progressPercentage}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`rounded-xl p-4 mb-6 ${alert.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : alert.type === 'danger' ? 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200'}`}>
            <div className="flex items-center gap-3">
              <span className={`icon-[${alert.type === 'success' ? 'tabler--check' : alert.type === 'danger' ? 'tabler--alert-circle' : 'tabler--info-circle'}] size-5 ${alert.type === 'success' ? 'text-green-600' : alert.type === 'danger' ? 'text-red-600' : 'text-blue-600'}`}></span>
              <span className="font-medium">{alert.message}</span>
            </div>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Submission Complete! 🎉</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">Status: <span className="font-semibold text-emerald-700">{result.status}</span></p>
                  {result.score !== undefined && (
                    <p className="text-gray-700">Score: <span className="font-bold text-2xl text-gray-900">{result.score}</span> points</p>
                  )}
                  <p className="text-gray-600 text-sm">Attempt {result.attemptNumber} • Submitted at {new Date(result.submittedAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <span className="icon-[tabler--check] size-12 text-emerald-500"></span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions Area */}
          <div className="lg:col-span-2">
            {assignment.questions && assignment.questions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="icon-[tabler--file-text] size-10 text-gray-400"></span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h3>
                <p className="text-gray-600">This assignment doesn't have any questions yet.</p>
              </div>
            ) : (
              <div>
                {assignment.questions && renderQuestion(assignment.questions[activeQuestion], activeQuestion)}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                    disabled={activeQuestion === 0}
                    className="px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                  >
                    <span className="icon-[tabler--arrow-left] size-4"></span>
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">Question {activeQuestion + 1} of {totalQuestions}</span>
                  </div>
                  
                  <button
                    onClick={() => setActiveQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}
                    disabled={activeQuestion === totalQuestions - 1}
                    className="px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                  >
                    Next
                    <span className="icon-[tabler--arrow-right] size-4"></span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {(showSidebar || window.innerWidth >= 1024) && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
                {/* Timer Card */}
                <div className="mb-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Time Spent</p>
                      <h3 className="text-3xl font-bold mt-1">{formatTime(timeSpentSec)}</h3>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <span className="icon-[tabler--clock] size-6"></span>
                    </div>
                  </div>
                  {assignment.timeLimit && (
                    <div className="text-blue-100 text-sm">
                      Time Limit: {formatTime(assignment.timeLimit * 60)}
                    </div>
                  )}
                </div>

                {/* Question Navigator */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Questions</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {assignment.questions?.map((_, idx) => {
                      const status = getQuestionStatus(idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveQuestion(idx)}
                          className={`h-12 rounded-lg transition-all ${idx === activeQuestion ? 'ring-2 ring-blue-500 bg-blue-50' : status === 'answered' ? 'bg-green-100 text-green-800' : status === 'unanswered' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span className="font-medium">{idx + 1}</span>
                            {status === 'answered' && (
                              <span className="icon-[tabler--check] size-3"></span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Assignment Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Points</span>
                    <span className="font-semibold">{assignment.totalPoints || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Passing Score</span>
                    <span className="font-semibold">{assignment.passingScore || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Max Attempts</span>
                    <span className="font-semibold">{assignment.maxAttempts || 'Unlimited'}</span>
                  </div>
                  {assignment.allowLateSubmission === false && assignment.dueDate && new Date() > new Date(assignment.dueDate) && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="icon-[tabler--alert-triangle] size-5 text-red-600"></span>
                        <span className="text-sm text-red-700">Late submissions are not allowed</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <form onSubmit={handleSubmit}>
                  <button
                    type="submit"
                    disabled={submitting || (assignment.allowLateSubmission === false && assignment.dueDate && new Date() > new Date(assignment.dueDate))}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-3"
                  >
                    {submitting ? (
                      <>
                        <span className="icon-[tabler--loader] size-5 animate-spin"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span className="icon-[tabler--send] size-5"></span>
                        Submit Assignment
                      </>
                    )}
                  </button>
                  <div className="mt-3 text-center text-xs text-gray-500">
                    Draft is autosaved in your browser
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Panel */}
        {assignment.instructions && (
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <span className="icon-[tabler--alert-circle] size-6 text-amber-600"></span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h4>
                <p className="text-gray-700 whitespace-pre-line">{assignment.instructions}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}