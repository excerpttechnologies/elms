import mongoose, { Schema, Document, Model } from 'mongoose';

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  SUSPENDED = 'SUSPENDED',
}

export interface IProgress {
  moduleId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
}

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt?: Date;
  progress: IProgress[];
  progressPercentage: number;
  grade?: number;
  certificateUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.ACTIVE,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    progress: [
      {
        moduleId: String,
        lessonId: String,
        completed: Boolean,
        completedAt: Date,
      },
    ],
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
    },
    certificateUrl: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
EnrollmentSchema.index({ studentId: 1 });
EnrollmentSchema.index({ courseId: 1 });
EnrollmentSchema.index({ status: 1 });

export default (mongoose.models.Enrollment as Model<IEnrollment>) ||
  mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
