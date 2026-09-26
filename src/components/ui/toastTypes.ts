import React from 'react';

export type ToastActionElementProps = {
  action?: ToastActionElement;
  toastId: string;
};

export type ToastActionElement = React.ComponentType<ToastActionElementProps>;

export type ToastVariant = 'default' | 'destructive' | 'success';

export type ToastProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: ToastVariant;
  duration?: number;
};
