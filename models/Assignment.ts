import mongoose, { Schema, Document, Model } from 'mongoose';

export enum AssignmentType {
  QUIZ = 'QUIZ',
  ESSAY = 'ESSAY',
  PROJECT = 'PROJECT',
  CODING = 'CODING',
  FILE_UPLOAD = 'FILE_UPLOAD',
}

export enum AssignmentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
}

export interface IQuestion {
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  order: number;
}

export interface IAssignment extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: AssignmentType;
  status: AssignmentStatus;
  instructions?: string;
  questions: IQuestion[];
  totalPoints: number;
  passingScore: number;
  dueDate?: Date;
  allowLateSubmission: boolean;
  latePenalty?: number;
  maxAttempts?: number;
  timeLimit?: number;
  attachments: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    type: {
      type: String,
      enum: Object.values(AssignmentType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AssignmentStatus),
      default: AssignmentStatus.DRAFT,
    },
    instructions: String,
    questions: [
      {
        question: { type: String, required: true },
        type: {
          type: String,
          enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY'],
        },
        options: [String],
        correctAnswer: Schema.Types.Mixed,
        points: { type: Number, required: true, min: 0 },
        order: { type: Number, required: true },
      },
    ],
    totalPoints: {
      type: Number,
      required: true,
      min: 0,
    },
    passingScore: {
      type: Number,
      default: 60,
      min: 0,
      max: 100,
    },
    dueDate: Date,
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    latePenalty: {
      type: Number,
      min: 0,
      max: 100,
    },
    maxAttempts: {
      type: Number,
      min: 1,
    },
    timeLimit: Number,
    attachments: [
      {
        name: String,
        url: String,
        size: Number,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AssignmentSchema.index({ courseId: 1 });
AssignmentSchema.index({ status: 1 });
AssignmentSchema.index({ dueDate: 1 });

export default (mongoose.models.Assignment as Model<IAssignment>) ||
  mongoose.model<IAssignment>('Assignment', AssignmentSchema);
