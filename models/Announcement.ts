import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  courseId?: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  targetAudience: Array<'ALL' | 'STUDENTS' | 'TEACHERS' | 'PARENTS'>;
  attachments: Array<{
    name: string;
    url: string;
  }>;
  publishedAt?: Date;
  expiresAt?: Date;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    targetAudience: [
      {
        type: String,
        enum: ['ALL', 'STUDENTS', 'TEACHERS', 'PARENTS'],
      },
    ],
    attachments: [
      {
        name: String,
        url: String,
      },
    ],
    publishedAt: Date,
    expiresAt: Date,
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AnnouncementSchema.index({ courseId: 1 });
AnnouncementSchema.index({ publishedAt: -1 });
AnnouncementSchema.index({ isPinned: -1 });

export default (mongoose.models.Announcement as Model<IAnnouncement>) ||
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
