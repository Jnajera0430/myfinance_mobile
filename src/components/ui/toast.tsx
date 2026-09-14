
interface ToastActionElementProps   {
    action: ToastProps["action"];
    toastId: string;
}
export type ToastActionElement = React.FC<ToastActionElementProps>;
export type ToastProps = {
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: ToastActionElement;
};

export const ToastActionElement = ({ action, toastId, }: ToastActionElementProps) => {
    return (

        <button
            onClick={() => {
                // if (action?.onClick) {
                //     action.onClick();
                // }
                // toast.dismiss(toastId);
            }}
            className="ml-4 text-sm font-medium text-primary"
        >
            {}
        </button>
    )
}