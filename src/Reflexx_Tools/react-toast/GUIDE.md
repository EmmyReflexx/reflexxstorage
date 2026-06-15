# React Toast Library - Complete Usage Guide

Hey! Let me show you **exactly** how to use this toast library in your React projects. I'll explain every method with real examples.

## 🚀 First Time Setup

### Step 1: Install the Library

```bash
npm install react-toast
# or
yarn add react-toast
```

### Step 2: Set Up the Toast Container (DO THIS ONCE!)

In your `App.tsx` or `index.tsx`:

```tsx
import React from 'react';
import { ToastContainer, useToast } from 'react-toast';

function App() {
  // Get toast state and the function to remove toasts
  const { toasts, removeToast } = useToast();

  return (
    <>
      {/* Your actual app content */}
      <MyComponent />
      
      {/* This MUST be at the bottom - it renders all toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
```

**⚠️ IMPORTANT:** You only need ONE `ToastContainer` in your entire app. Put it in your root component.

### Step 3: Start Using Toasts Anywhere

Now in **any component** inside your app:

```tsx
import React from 'react';
import { useToast } from 'react-toast';

function MyComponent() {
  // Get the toast methods
  const { success, error, warning, info, show } = useToast();

  return (
    <button onClick={() => success('It worked! 🎉')}>
      Click Me
    </button>
  );
}
```

That's it! The toast will appear in the top-right corner and disappear after 3 seconds.

---

## 📚 Every Method Explained with Examples

### 1. `success()` - Green Success Toast

```tsx
const { success } = useToast();

// Simplest form
success('File uploaded successfully!');

// With options
success('Profile saved!', {
  duration: 2000,        // Stays for 2 seconds
  position: 'top-center' // Shows at top center instead
});

// Real example
const handleSave = async () => {
  try {
    await saveToDatabase();
    success('Data saved successfully!');
  } catch (error) {
    // Handle error
  }
};
```

### 2. `error()` - Red Error Toast

```tsx
const { error } = useToast();

// Basic error
error('Something went wrong');

// With custom duration (stays longer so user can read)
error('Failed to connect to server', {
  duration: 5000  // 5 seconds
});

// Real example - form validation
const handleSubmit = (formData) => {
  if (!formData.email) {
    error('Email address is required');
    return;
  }
  if (!formData.password) {
    error('Please enter your password');
    return;
  }
  // Submit form...
};
```

### 3. `warning()` - Yellow Warning Toast

```tsx
const { warning } = useToast();

// Basic warning
warning('Your session will expire in 5 minutes');

// Real example
const handleDelete = (itemId) => {
  warning('This action cannot be undone', {
    duration: 4000,
    onClose: () => {
      console.log('User saw the warning');
    }
  });
};
```

### 4. `info()` - Blue Info Toast

```tsx
const { info } = useToast();

// Basic info
info('New version available');

// Real example - notifications
const checkForUpdates = () => {
  info('Update downloaded! Restart to apply', {
    position: 'bottom-right',
    duration: 0  // Never auto-close, user must click X
  });
};
```

### 5. `show()` - Default Gray Toast

```tsx
const { show } = useToast();

// Generic message
show('Processing your request...');

// Real example
const handleLongOperation = () => {
  show('Please wait, this may take a moment', {
    duration: 1000,
    showProgressBar: false  // Hide progress bar for simple notices
  });
};
```

### 6. `addToast()` - Full Control

Use this when you need EVERY option:

```tsx
const { addToast, updateToast, removeToast } = useToast();

// Complete customization
const id = addToast({
  message: 'Custom notification',
  type: 'info',
  duration: 5000,
  position: 'bottom-center',
  backgroundColor: '#1a1a2e',
  textColor: '#eee',
  showCloseButton: true,
  showProgressBar: true,
  pauseOnHover: true,
  width: 350,
  onClose: () => console.log('Toast closed')
});
```

### 7. `updateToast()` - Change Existing Toast

Perfect for loading states:

```tsx
const { info, updateToast } = useToast();

const handleAsyncTask = async () => {
  // Show loading toast
  const toastId = info('Uploading file...', { duration: 0 });
  
  try {
    await uploadFile();
    
    // Update the SAME toast to success
    updateToast(toastId, {
      message: 'File uploaded! ✅',
      type: 'success',
      duration: 3000
    });
  } catch (error) {
    // Update to error
    updateToast(toastId, {
      message: 'Upload failed ❌',
      type: 'error',
      duration: 4000
    });
  }
};
```

### 8. `removeToast()` - Remove Specific Toast

```tsx
const { addToast, removeToast } = useToast();

const showAndRemove = () => {
  const id = addToast({
    message: 'This will be removed in 1 second',
    duration: 0  // No auto-close
  });
  
  // Manually remove after 1 second
  setTimeout(() => {
    removeToast(id);
  }, 1000);
};
```

### 9. `removeAllToasts()` - Clear Everything

```tsx
const { removeAllToasts, success, error, warning } = useToast();

const clearAll = () => {
  success('Toast 1');
  error('Toast 2');
  warning('Toast 3');
  
  // Clear all at once after 2 seconds
  setTimeout(() => {
    removeAllToasts();  // All 3 disappear instantly
  }, 2000);
};
```

---

## 🎨 All Options Explained

Here's every option you can use with ANY toast method:

```tsx
const { show } = useToast();

show('My message', {
  // TYPE: Visual style (default: 'default')
  type: 'success',  // 'success' | 'error' | 'warning' | 'info' | 'default'
  
  // DURATION: How long it shows (ms) (default: 3000)
  duration: 5000,   // 0 = never auto-close
  
  // POSITION: Where it appears (default: 'top-right')
  position: 'bottom-center',  // 'top-right', 'top-left', 'top-center', 
                              // 'bottom-right', 'bottom-left', 'bottom-center'
  
  // CUSTOM COLORS: Override defaults
  backgroundColor: '#2d2d2d',  // Any CSS color
  textColor: '#ffffff',         // Any CSS color
  
  // CUSTOM WIDTH: Set specific size
  width: 400,        // Number = pixels, or string like '400px', '50%'
  
  // CUSTOM ICON: Replace default icon
  customIcon: <MyCustomIcon />,  // Any React node
  
  // PROGRESS BAR: Show/hide timer bar (default: true)
  showProgressBar: false,
  
  // CLOSE BUTTON: Show/hide X button (default: true)
  showCloseButton: false,
  
  // PAUSE ON HOVER: Pause timer when mouse over (default: true)
  pauseOnHover: false,
  
  // ON CLOSE: Callback when toast closes
  onClose: () => {
    console.log('Toast was closed');
    // Analytics tracking, cleanup, etc.
  }
});
```

---

## 💡 Real-World Examples

### Example 1: Form Submission with Loading State

```tsx
function LoginForm() {
  const { success, error, info, updateToast } = useToast();

  const handleLogin = async (email, password) => {
    // Show loading toast
    const toastId = info('Logging in...', { duration: 0 });
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        updateToast(toastId, {
          message: 'Login successful! Redirecting...',
          type: 'success',
          duration: 2000
        });
        // Redirect user
      } else {
        updateToast(toastId, {
          message: 'Invalid email or password',
          type: 'error',
          duration: 4000
        });
      }
    } catch (error) {
      updateToast(toastId, {
        message: 'Network error. Please try again.',
        type: 'error',
        duration: 5000
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Example 2: File Upload with Progress

```tsx
function FileUploader() {
  const { addToast, updateToast } = useToast();

  const handleUpload = async (file) => {
    const toastId = addToast({
      message: `Uploading ${file.name}...`,
      type: 'info',
      duration: 0,
      showProgressBar: false
    });
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      updateToast(toastId, {
        message: `Uploading ${file.name}... ${progress}%`
      });
      
      if (progress >= 100) {
        clearInterval(interval);
        updateToast(toastId, {
          message: `${file.name} uploaded!`,
          type: 'success',
          duration: 3000
        });
      }
    }, 500);
    
    // Actual upload logic here
  };

  return <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />;
}
```

### Example 3: Different Positions Demo

```tsx
function PositionDemo() {
  const { show } = useToast();
  
  const positions = [
    'top-right', 'top-left', 'top-center',
    'bottom-right', 'bottom-left', 'bottom-center'
  ];
  
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {positions.map(pos => (
        <button 
          key={pos}
          onClick={() => show(`Toast at ${pos}`, { position: pos })}
        >
          {pos}
        </button>
      ))}
    </div>
  );
}
```

### Example 4: Custom Styling for Brand Identity

```tsx
function BrandToast() {
  const { success } = useToast();
  
  const showBrandToast = () => {
    success('Welcome to OurApp!', {
      backgroundColor: '#6366f1',  // Purple brand color
      textColor: '#ffffff',
      width: '90%',
      position: 'top-center',
      customIcon: <CompanyLogo size={20} />,
      duration: 4000
    });
  };
  
  return <button onClick={showBrandToast}>Show Brand Message</button>;
}
```

### Example 5: Persistent Critical Error

```tsx
function CriticalErrorHandler() {
  const { error, removeToast } = useToast();
  
  useEffect(() => {
    const handleCriticalError = (error) => {
      // Show toast that NEVER auto-closes
      error(`Critical Error: ${error.message}`, { 
        duration: 0,  // User MUST click X
        position: 'top-center',
        backgroundColor: '#7f1d1d',
        textColor: '#fff'
      });
    };
    
    window.addEventListener('critical-error', handleCriticalError);
    return () => window.removeEventListener('critical-error', handleCriticalError);
  }, []);
}
```

### Example 6: Chained Notifications

```tsx
function Wizard() {
  const { show, removeAllToasts } = useToast();
  
  const steps = ['Step 1', 'Step 2', 'Step 3'];
  
  const runWizard = async () => {
    for (let step of steps) {
      removeAllToasts();  // Clear previous toast
      show(`Starting ${step}`, { duration: 1500 });
      await doStep(step);  // Your actual step logic
    }
    show('Wizard complete!', { type: 'success', duration: 3000 });
  };
}
```

---

## 🎯 Quick Reference Card

| Method | Color | Best For | Default Duration |
|--------|-------|----------|------------------|
| `success()` | Green | Positive outcomes | 3 seconds |
| `error()` | Red | Errors, failures | 3 seconds |
| `warning()` | Yellow | Warnings, cautions | 3 seconds |
| `info()` | Blue | Information, updates | 3 seconds |
| `show()` | Gray | Neutral messages | 3 seconds |

## 🔧 Common Patterns

### Pattern 1: Toast Utility Hook

```tsx
// Create a custom hook for your app
function useAppToasts() {
  const { success, error, warning } = useToast();
  
  return {
    showSaveSuccess: () => success('Changes saved'),
    showSaveError: () => error('Failed to save'),
    showDeleteWarning: () => warning('This will be permanent'),
  };
}

// Use it anywhere
function MyComponent() {
  const { showSaveSuccess, showSaveError } = useAppToasts();
  // Much cleaner!
}
```

### Pattern 2: Toast with Undo Action

```tsx
function DeleteButton() {
  const { show } = useToast();
  
  const handleDelete = () => {
    const id = show('Item deleted', {
      duration: 5000,
      onClose: () => console.log('Toast closed')
    });
    
    // Set timeout to undo
    const undoTimeout = setTimeout(() => {
      // Actually delete if not undone
    }, 5000);
    
    // Listen for undo (you'd need to add an undo button)
  };
}
```

### Pattern 3: Conditional Toasts

```tsx
function DataFetcher() {
  const { success, error } = useToast();
  
  const fetchData = async () => {
    try {
      const data = await api.getData();
      
      if (data.length === 0) {
        warning('No data found');
      } else {
        success(`Loaded ${data.length} items`);
      }
    } catch (err) {
      if (err.status === 404) {
        error('Resource not found');
      } else {
        error('Something went wrong');
      }
    }
  };
}
```

## ❓ Common Mistakes to Avoid

### ❌ Wrong: Multiple Containers
```tsx
function App() {
  return (
    <>
      <Page1 />
      <ToastContainer />  // DON'T DO THIS
      <Page2 />
      <ToastContainer />  // DON'T DO THIS
    </>
  );
}
```

### ✅ Correct: One Container at Root
```tsx
function App() {
  return (
    <>
      <Page1 />
      <Page2 />
      <ToastContainer />  // ONLY ONE, AT THE END
    </>
  );
}
```

### ❌ Wrong: Calling Hook Outside Component
```tsx
// This will crash!
const { success } = useToast();  // ERROR!

function MyComponent() {
  const { success } = useToast();  // ✅ Must be inside
}
```

### ✅ Correct: Always Inside Component
```tsx
function MyComponent() {
  const { success } = useToast();  // ✅ Correct
}
```

## 🎉 That's It!

You now know everything about using this toast library. Remember:
- Setup the container ONCE in your root
- Use `useToast()` hook in any component
- Each method has sensible defaults
- You can customize everything

Happy coding! 🚀