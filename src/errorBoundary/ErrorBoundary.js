import React, { Component } from 'react';
import { BackHandler } from 'react-native';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught in boundary:', error, errorInfo);

    // Exit the app silently
    BackHandler.exitApp();
  }

  render() {
    if (this.state.hasError) {
      return null; // Don't display any error message, just exit
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
