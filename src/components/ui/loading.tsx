import { LoadingSpinner } from "../Loading/LoadingSpinner";

interface FullPageLoaderProps {
  message?: string;
}

const FullPageLoader = ({ message }: FullPageLoaderProps) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
    <LoadingSpinner size={80} color="#2511cc" />
    {message && <div className="mt-4 text-gray-700">{message}</div>}
  </div>
);

export { FullPageLoader };
