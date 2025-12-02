import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiResponseBuilder {
  static success<T>(data?: T, message?: string, statusCode = 200) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      } as ApiResponse<T>,
      { status: statusCode }
    );
  }

  static created<T>(data?: T, message = 'Resource created successfully') {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      } as ApiResponse<T>,
      { status: 201 }
    );
  }

  static error(error: string, statusCode = 500, errors?: any[]) {
    return NextResponse.json(
      {
        success: false,
        error,
        errors,
      } as ApiResponse,
      { status: statusCode }
    );
  }

  static unauthorized(message = 'Unauthorized') {
    return NextResponse.json(
      {
        success: false,
        error: message,
      } as ApiResponse,
      { status: 401 }
    );
  }

  static forbidden(message = 'Forbidden') {
    return NextResponse.json(
      {
        success: false,
        error: message,
      } as ApiResponse,
      { status: 403 }
    );
  }

  static notFound(message = 'Resource not found') {
    return NextResponse.json(
      {
        success: false,
        error: message,
      } as ApiResponse,
      { status: 404 }
    );
  }

  static badRequest(message = 'Bad request', errors?: any[]) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        errors,
      } as ApiResponse,
      { status: 400 }
    );
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ) {
    return NextResponse.json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as ApiResponse<T[]>);
  }
}