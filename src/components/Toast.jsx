import { useToast } from '../context/ToastContext';

// Toast type configurations
const toastConfig = {
  success: {
    bg: '#dcfce7',
    border: '#22c55e',
    text: '#166534',
    icon: CheckIcon,
  },
  error: {
    bg: '#fee2e2',
    border: '#dc2626',
    text: '#991b1b',
    icon: ErrorIcon,
  },
  warning: {
    bg: '#fef3c7',
    border: '#f59e0b',
    text: '#92400e',
    icon: ClockIcon,
  },
  info: {
    bg: '#dbeafe',
    border: '#3b82f6',
    text: '#1e40af',
    icon: InfoIcon,
  },
};

function CheckIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  );
}

function SingleToast({ toast, onDismiss }) {
  const config = toastConfig[toast.type] || toastConfig.info;
  const Icon = config.icon;
  const isClickable = !!toast.onClick;

  const handleClick = () => {
    if (toast.onClick) {
      toast.onClick();
      onDismiss();
    }
  };

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      style={{
        backgroundColor: config.bg,
        border: `3px solid ${config.border}`,
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '4px 4px 0 #222',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '360px',
        width: '100%',
        animation: 'slideDown 0.3s ease-out',
        color: config.text,
        cursor: isClickable ? 'pointer' : 'default',
      }}
    >
      {/* Icon */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon />
      </div>

      {/* Message */}
      <div style={{
        flex: 1,
        fontSize: '14px',
        fontWeight: 'bold',
        lineHeight: 1.3,
      }}>
        {toast.message}
      </div>

      {/* Action Button */}
      {toast.button && (
        <button
          onClick={() => {
            toast.onButtonClick?.();
            onDismiss();
          }}
          style={{
            padding: '6px 12px',
            backgroundColor: config.border,
            color: '#fff',
            border: '2px solid #222',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {toast.button}
        </button>
      )}

      {/* Close Button */}
      <button
        onClick={onDismiss}
        style={{
          flexShrink: 0,
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          opacity: 0.6,
          color: config.text,
        }}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <>
      {/* Animation keyframes */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10001,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '0 16px',
          width: '100%',
          maxWidth: '400px',
          boxSizing: 'border-box',
        }}
      >
        {toasts.map((toast) => (
          <SingleToast
            key={toast.id}
            toast={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}

// Export icon components for custom use
export { CheckIcon, ErrorIcon, ClockIcon, InfoIcon, WarningIcon, ArrowDownIcon, ArrowUpIcon };
