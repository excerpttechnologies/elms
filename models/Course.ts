import mongoose, { Schema, Document, Model } from 'mongoose';

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface ILesson {
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  resources: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  order: number;
}

export interface IModule {
  title: string;
  description?: string;
  lessons: ILesson[];
  order: number;
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  teacherId: mongoose.Types.ObjectId;
  thumbnail?: string;
  category?: string;
  tags: string[];
  duration?: number;
  level: CourseLevel;
  status: CourseStatus;
  price?: number;
  capacity?: number;
  enrollmentCount: number;
  modules: IModule[];
  prerequisites: string[];
  learningOutcomes: string[];
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    thumbnail: String,
    category: String,
    tags: [String],
    duration: Number,
    level: {
      type: String,
      enum: Object.values(CourseLevel),
      default: CourseLevel.BEGINNER,
    },
    status: {
      type: String,
      enum: Object.values(CourseStatus),
      default: CourseStatus.PUBLISHED,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    capacity: Number,
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    modules: [
      {
        title: { type: String, required: true },
        description: String,
        order: { type: Number, required: true },
        lessons: [
          {
            title: { type: String, required: true },
            description: String,
            content: String,
            videoUrl: String,
            duration: Number,
            resources: [
              {
                title: String,
                url: String,
                type: String,
              },
            ],
            order: { type: Number, required: true },
          },
        ],
      },
    ],
    prerequisites: [String],
    learningOutcomes: [String],
    startDate: Date,
    endDate: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
CourseSchema.index({ teacherId: 1 });
CourseSchema.index({ status: 1 });
CourseSchema.index({ category: 1 });
CourseSchema.index({ title: 'text', description: 'text' });
CourseSchema.index({ slug: 1 });

// Generate slug before saving
CourseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

export default (mongoose.models.Course as Model<ICourse>) ||
  mongoose.model<ICourse>('Course', CourseSchema);