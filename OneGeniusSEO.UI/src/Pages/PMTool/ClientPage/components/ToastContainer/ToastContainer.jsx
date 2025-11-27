import Toast from "../Toast";

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="tw:fixed tw:top-4 tw:right-4 tw:z-50 tw:space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
