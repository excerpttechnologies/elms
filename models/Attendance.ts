import mongoose, { Schema, Document, Model } from 'mongoose';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export interface IAttendance extends Document {
  courseId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  markedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: true,
    },
    notes: String,
    markedBy: {
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
AttendanceSchema.index({ courseId: 1, studentId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ studentId: 1 });
AttendanceSchema.index({ courseId: 1 });
AttendanceSchema.index({ date: 1 });

export default (mongoose.models.Attendance as Model<IAttendance>) ||
  mongoose.model<IAttendance>('Attendance', AttendanceSchema);
