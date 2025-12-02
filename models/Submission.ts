import mongoose, { Schema, Document, Model } from 'mongoose';

export enum SubmissionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  LATE = 'LATE',
}

export interface IAnswer {
  questionId: string;
  answer: string | string[];
}

export interface ISubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  files: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  status: SubmissionStatus;
  attemptNumber: number;
  submittedAt?: Date;
  score?: number;
  feedback?: string;
  gradedBy?: mongoose.Types.ObjectId;
  gradedAt?: Date;
  timeSpent?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [
      {
        questionId: String,
        answer: Schema.Types.Mixed,
      },
    ],
    files: [
      {
        name: String,
        url: String,
        size: Number,
      },
    ],
    status: {
      type: String,
      enum: Object.values(SubmissionStatus),
      default: SubmissionStatus.PENDING,
    },
    attemptNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    submittedAt: Date,
    score: {
      type: Number,
      min: 0,
    },
    feedback: String,
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    gradedAt: Date,
    timeSpent: Number,
  },
  {
    timestamps: true,
  }
);

// Indexes
SubmissionSchema.index({ assignmentId: 1, studentId: 1 });
SubmissionSchema.index({ studentId: 1 });
SubmissionSchema.index({ status: 1 });

export default (mongoose.models.Submission as Model<ISubmission>) ||
  mongoose.model<ISubmission>('Submission', SubmissionSchema);
